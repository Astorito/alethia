-- ============================================================
-- ALETHIA — Schema completo
-- PostgreSQL 16 + pgvector
-- ============================================================

-- ─── EXTENSIONES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── ENUMS ───────────────────────────────────────────────────

CREATE TYPE chamber_type AS ENUM ('deputies', 'senate', 'executive', 'municipal');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE vote_position AS ENUM ('yes', 'no', 'abstain', 'absent', 'present');
CREATE TYPE bill_status AS ENUM ('draft', 'committee', 'floor', 'passed', 'rejected', 'vetoed', 'enacted');
CREATE TYPE stance_type AS ENUM ('support', 'oppose', 'neutral', 'mixed');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE alert_type AS ENUM ('contradiction', 'topic_surge', 'new_alliance', 'bill_update', 'custom');
CREATE TYPE source_type AS ENUM ('transcript', 'video', 'xml_api', 'pdf', 'manual');

-- ─── INSTITUCIONES Y ESTRUCTURA POLÍTICA ─────────────────────

CREATE TABLE institutions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,                          -- "Cámara de Diputados de la Nación"
    short_name  TEXT,                                   -- "HCD"
    type        chamber_type NOT NULL,
    country     TEXT NOT NULL DEFAULT 'AR',
    province    TEXT,                                   -- NULL = nacional
    api_base_url TEXT,                                  -- URL de la API pública si existe
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parties (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    short_name  TEXT,
    color_hex   TEXT,                                   -- para UI: "#1A73E8"
    ideology    TEXT,                                   -- "center-right", "left", etc.
    founded_at  DATE,
    dissolved_at DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PERSONAS / POLÍTICOS ─────────────────────────────────────

CREATE TABLE politicians (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           TEXT NOT NULL,
    first_name          TEXT,
    last_name           TEXT,
    gender              TEXT,
    birth_date          DATE,
    province            TEXT,                           -- provincia de origen/representación
    photo_url           TEXT,
    bio                 TEXT,

    -- Scores calculados (cacheados, actualizados por worker)
    consistency_score   FLOAT,                          -- 0.0 - 10.0
    consistency_grade   TEXT,                           -- "A", "B+", "C-", etc.
    activity_score      FLOAT,                          -- qué tan activo es
    last_analyzed_at    TIMESTAMPTZ,

    -- Metadata
    external_id         TEXT,                           -- ID en la API del Congreso
    source              source_type DEFAULT 'manual',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Roles históricos de cada político (puede tener varios a lo largo del tiempo)
CREATE TABLE politician_roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id   UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    institution_id  UUID NOT NULL REFERENCES institutions(id),
    party_id        UUID REFERENCES parties(id),
    role_title      TEXT NOT NULL,                      -- "Diputado Nacional", "Ministro de Economía"
    started_at      DATE NOT NULL,
    ended_at        DATE,                               -- NULL = rol actual
    district        TEXT,                               -- "Buenos Aires", "Córdoba"
    is_current      BOOLEAN GENERATED ALWAYS AS (ended_at IS NULL) STORED,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SESIONES ────────────────────────────────────────────────

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id),
    title           TEXT NOT NULL,
    session_number  TEXT,                               -- "Sesión Ordinaria 745"
    session_type    TEXT,                               -- "ordinaria", "extraordinaria", "especial"
    date            DATE NOT NULL,
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    status          session_status DEFAULT 'scheduled',

    -- Contenido raw
    video_url       TEXT,
    audio_path      TEXT,
    transcript_url  TEXT,
    transcript_raw  TEXT,                               -- texto taquigráfico completo

    -- Procesamiento
    processing_status TEXT DEFAULT 'pending',           -- 'pending','processing','done','error'
    speech_count    INT DEFAULT 0,
    word_count      INT DEFAULT 0,

    -- Metadata
    external_id     TEXT,
    source          source_type DEFAULT 'transcript',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DISCURSOS / INTERVENCIONES ──────────────────────────────

CREATE TABLE speeches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    politician_id   UUID REFERENCES politicians(id),    -- NULL si no identificado aún
    speaker_label   TEXT,                               -- "DIPUTADO VARGAS:" del taquigráfico

    -- Contenido
    transcript      TEXT NOT NULL,
    word_count      INT,
    duration_seconds INT,

    -- Timestamps dentro de la sesión
    start_time      FLOAT,                              -- segundos desde inicio
    end_time        FLOAT,
    sequence_order  INT,                                -- posición en la sesión

    -- Embedding para búsqueda semántica
    embedding       VECTOR(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Metadata
    source          source_type DEFAULT 'transcript',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANÁLISIS LLM DE DISCURSOS ───────────────────────────────

CREATE TABLE speech_analysis (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    speech_id       UUID NOT NULL UNIQUE REFERENCES speeches(id) ON DELETE CASCADE,

    -- Clasificación
    topic           TEXT,                               -- "reforma tributaria"
    topic_cluster   TEXT,                               -- cluster asignado por BERTopic
    policy_area     TEXT,                               -- "economy", "security", "education"...
    summary         TEXT,                               -- resumen 1-2 oraciones

    -- Postura y tono
    stance          stance_type,
    sentiment       sentiment_type,
    sentiment_score FLOAT,                              -- -1.0 a 1.0

    -- Extracción
    keywords        TEXT[],
    named_entities  JSONB,                              -- {"persons": [], "orgs": [], "laws": []}
    claims          JSONB,                              -- array de afirmaciones específicas

    -- Confianza del modelo
    confidence      FLOAT,
    model_used      TEXT,
    raw_llm_output  JSONB,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROYECTOS DE LEY ────────────────────────────────────────

CREATE TABLE bills (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id),
    title           TEXT NOT NULL,
    number          TEXT,                               -- "2024-D-1234"
    summary         TEXT,
    full_text_url   TEXT,
    policy_area     TEXT,
    status          bill_status DEFAULT 'draft',
    introduced_at   DATE,
    enacted_at      DATE,
    embedding       VECTOR(1536),

    -- Metadata
    external_id     TEXT,
    source          source_type DEFAULT 'xml_api',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Autores del proyecto
CREATE TABLE bill_authors (
    bill_id         UUID REFERENCES bills(id) ON DELETE CASCADE,
    politician_id   UUID REFERENCES politicians(id),
    role            TEXT DEFAULT 'author',              -- 'author', 'co_author'
    PRIMARY KEY (bill_id, politician_id)
);

-- Trayectoria del proyecto
CREATE TABLE bill_stages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id         UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    stage_name      TEXT NOT NULL,                      -- "Comisión de Presupuesto"
    status          TEXT,
    occurred_at     DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VOTACIONES ──────────────────────────────────────────────

CREATE TABLE votes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id),
    bill_id         UUID REFERENCES bills(id),
    title           TEXT NOT NULL,                      -- descripción de qué se vota
    vote_type       TEXT,                               -- "general", "en particular", "moción"
    result          TEXT,                               -- "aprobado", "rechazado"
    yes_count       INT DEFAULT 0,
    no_count        INT DEFAULT 0,
    abstain_count   INT DEFAULT 0,
    absent_count    INT DEFAULT 0,
    voted_at        TIMESTAMPTZ,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Posición individual de cada político en cada votación
CREATE TABLE vote_positions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id         UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
    politician_id   UUID NOT NULL REFERENCES politicians(id),
    position        vote_position NOT NULL,
    party_id        UUID REFERENCES parties(id),        -- partido al momento del voto
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vote_id, politician_id)
);

-- ─── TEMAS / TOPICS ──────────────────────────────────────────

CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL UNIQUE,               -- "minería", "educación"
    slug            TEXT NOT NULL UNIQUE,               -- "mineria", "educacion"
    description     TEXT,
    policy_area     TEXT,
    parent_topic_id UUID REFERENCES topics(id),         -- jerarquía de temas
    color_hex       TEXT,                               -- para UI
    hero_image_url  TEXT,                               -- imagen de header del topic

    -- Métricas calculadas (actualizadas por worker)
    mention_count   INT DEFAULT 0,
    speech_count    INT DEFAULT 0,
    bill_count      INT DEFAULT 0,
    momentum_score  FLOAT DEFAULT 0,                    -- trending score

    -- Gap score: discurso vs. ley real
    discourse_gap_score FLOAT,                          -- cuánto se habla vs. cuánto se legisla
    discourse_gap_label TEXT,                           -- "111x", "37x"
    last_calculated_at TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Relación speeches ↔ topics (M:N)
CREATE TABLE speech_topics (
    speech_id       UUID REFERENCES speeches(id) ON DELETE CASCADE,
    topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
    relevance_score FLOAT DEFAULT 1.0,
    PRIMARY KEY (speech_id, topic_id)
);

-- Relación bills ↔ topics (M:N)
CREATE TABLE bill_topics (
    bill_id         UUID REFERENCES bills(id) ON DELETE CASCADE,
    topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (bill_id, topic_id)
);

-- ─── CLAIMS / AFIRMACIONES ───────────────────────────────────

CREATE TABLE claims (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    speech_id       UUID NOT NULL REFERENCES speeches(id) ON DELETE CASCADE,
    politician_id   UUID REFERENCES politicians(id),
    text            TEXT NOT NULL,                      -- la afirmación exacta
    claim_type      TEXT,                               -- "promise", "fact", "opinion", "attack"
    topic_id        UUID REFERENCES topics(id),
    embedding       VECTOR(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NARRATIVAS ──────────────────────────────────────────────

CREATE TABLE narratives (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id        UUID REFERENCES topics(id),
    label           TEXT NOT NULL,                      -- "el campo como motor del país"
    description     TEXT,
    framing         TEXT,                               -- "pro-industry", "environmental"
    claim_count     INT DEFAULT 0,
    politician_count INT DEFAULT 0,
    centroid        VECTOR(1536),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE narrative_claims (
    narrative_id    UUID REFERENCES narratives(id) ON DELETE CASCADE,
    claim_id        UUID REFERENCES claims(id) ON DELETE CASCADE,
    similarity      FLOAT,
    PRIMARY KEY (narrative_id, claim_id)
);

-- ─── SCORES ANALÍTICOS ───────────────────────────────────────

-- Consistency Score: discurso vs. voto para cada político/tema
CREATE TABLE consistency_scores (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id       UUID NOT NULL REFERENCES politicians(id),
    topic_id            UUID REFERENCES topics(id),     -- NULL = score global
    policy_area         TEXT,

    score               FLOAT NOT NULL,                 -- 0.0 - 10.0
    grade               TEXT,                           -- "A", "B+", "C-", etc.
    speech_count        INT DEFAULT 0,
    vote_count          INT DEFAULT 0,
    contradiction_count INT DEFAULT 0,
    alignment_count     INT DEFAULT 0,

    period_start        DATE,
    period_end          DATE,
    calculated_at       TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(politician_id, topic_id, period_start, period_end)
);

-- Contradicciones detectadas (speech vs. vote)
CREATE TABLE contradictions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id   UUID NOT NULL REFERENCES politicians(id),
    speech_id       UUID REFERENCES speeches(id),
    vote_id         UUID REFERENCES votes(id),
    topic_id        UUID REFERENCES topics(id),

    description     TEXT,                               -- explicación generada por LLM
    severity        TEXT,                               -- "low", "medium", "high", "critical"
    speech_stance   stance_type,
    vote_position   vote_position,
    similarity_score FLOAT,                             -- cuán relacionados están el discurso y el voto

    detected_at     TIMESTAMPTZ DEFAULT NOW(),
    is_flagged      BOOLEAN DEFAULT TRUE,               -- para moderación manual
    reviewed        BOOLEAN DEFAULT FALSE
);

-- Alliance Scores: qué tan seguido votan igual dos políticos
CREATE TABLE alliance_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_a_id UUID NOT NULL REFERENCES politicians(id),
    politician_b_id UUID NOT NULL REFERENCES politicians(id),
    same_party      BOOLEAN,

    alignment_rate  FLOAT,                              -- % votan igual
    vote_count      INT,                                -- total de votos compartidos
    topic_id        UUID REFERENCES topics(id),         -- NULL = alianza general

    period_start    DATE,
    period_end      DATE,
    calculated_at   TIMESTAMPTZ DEFAULT NOW(),

    CHECK (politician_a_id < politician_b_id),          -- evitar duplicados
    UNIQUE(politician_a_id, politician_b_id, topic_id, period_start)
);

-- ─── USUARIOS Y ALERTAS ──────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT,
    profile_type    TEXT DEFAULT 'citizen',             -- 'citizen', 'journalist', 'company'
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

CREATE TABLE user_preferences (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    followed_topics     UUID[],                         -- topic IDs seguidos
    followed_politicians UUID[],                        -- politician IDs seguidos
    followed_policy_areas TEXT[],
    notification_email BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            alert_type NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    severity        TEXT DEFAULT 'medium',              -- 'low', 'medium', 'high'
    is_read         BOOLEAN DEFAULT FALSE,

    -- Referencias opcionales
    politician_id   UUID REFERENCES politicians(id),
    topic_id        UUID REFERENCES topics(id),
    bill_id         UUID REFERENCES bills(id),
    contradiction_id UUID REFERENCES contradictions(id),

    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DISCOURSE GAP (DISCURSO VS. LEY REAL) ───────────────────

CREATE TABLE discourse_gaps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id        UUID NOT NULL REFERENCES topics(id),
    institution_id  UUID REFERENCES institutions(id),

    -- Volumen de discurso
    mention_count   INT DEFAULT 0,
    speech_count    INT DEFAULT 0,
    politician_count INT DEFAULT 0,

    -- Producción legislativa
    bills_introduced INT DEFAULT 0,
    bills_passed    INT DEFAULT 0,
    laws_enacted    INT DEFAULT 0,

    -- Gap calculado
    gap_ratio       FLOAT,                              -- mention_count / MAX(laws_enacted, 1)
    gap_label       TEXT,                               -- "542x", "111x"
    gap_severity    TEXT,                               -- 'low', 'medium', 'high', 'critical'

    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    calculated_at   TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(topic_id, institution_id, period_start, period_end)
);

-- ─── ÍNDICES ─────────────────────────────────────────────────

-- Búsqueda semántica (pgvector)
CREATE INDEX ON speeches USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON claims   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
CREATE INDEX ON bills    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Búsqueda full-text (trigram)
CREATE INDEX ON speeches USING gin (transcript gin_trgm_ops);
CREATE INDEX ON bills    USING gin (title gin_trgm_ops);
CREATE INDEX ON politicians USING gin (full_name gin_trgm_ops);

-- Queries frecuentes
CREATE INDEX ON speeches (session_id);
CREATE INDEX ON speeches (politician_id);
CREATE INDEX ON speech_analysis (policy_area);
CREATE INDEX ON speech_analysis (topic);
CREATE INDEX ON speech_analysis (stance);
CREATE INDEX ON vote_positions (politician_id);
CREATE INDEX ON vote_positions (vote_id);
CREATE INDEX ON contradictions (politician_id);
CREATE INDEX ON contradictions (severity);
CREATE INDEX ON consistency_scores (politician_id);
CREATE INDEX ON alliance_scores (politician_a_id);
CREATE INDEX ON alliance_scores (politician_b_id);
CREATE INDEX ON alerts (user_id, is_read);
CREATE INDEX ON discourse_gaps (topic_id, period_start);
CREATE INDEX ON politician_roles (politician_id, is_current);
