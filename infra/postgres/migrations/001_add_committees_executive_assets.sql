-- ============================================================
-- ALETHIA — Migration 001: Committees, Executive, Asset Declarations
-- Extends the base schema with tables required for the
-- political transparency pipeline.
-- ============================================================

-- ─── ATTENDANCE TRACKING ────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    politician_id   UUID NOT NULL REFERENCES politicians(id),
    status          TEXT NOT NULL CHECK (status IN ('present', 'absent', 'on_leave')),
    interventions   INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, politician_id)
);

-- ─── COMMITTEES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS committees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id),
    name            TEXT NOT NULL,
    slug            TEXT,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, name)
);

CREATE TABLE IF NOT EXISTS committee_memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id    UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    politician_id   UUID NOT NULL REFERENCES politicians(id),
    role            TEXT DEFAULT 'member',  -- 'president', 'vice_president', 'secretary', 'member'
    started_at      DATE,
    ended_at        DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(committee_id, politician_id)
);

-- ─── EXECUTIVE BRANCH ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS executive_officials (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       TEXT NOT NULL,
    role_title      TEXT NOT NULL,          -- 'Presidente', 'Vicepresidente', 'Jefe de Gabinete'
    ministry        TEXT,
    photo_url       TEXT,
    party_id        UUID REFERENCES parties(id),
    started_at      DATE NOT NULL,
    ended_at        DATE,
    is_current      BOOLEAN GENERATED ALWAYS AS (ended_at IS NULL) STORED,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executive_actions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id     UUID REFERENCES executive_officials(id),
    action_type     TEXT NOT NULL CHECK (action_type IN ('decree', 'dnu', 'resolution', 'speech', 'announcement')),
    title           TEXT NOT NULL,
    number          TEXT,                   -- 'DNU 70/2023', 'Decreto 1234/2024'
    date            DATE NOT NULL,
    summary         TEXT,
    full_text       TEXT,
    source_url      TEXT,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ASSET DECLARATIONS ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_declarations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id   UUID REFERENCES politicians(id),
    official_name   TEXT NOT NULL,
    declaration_year INT NOT NULL,
    total_assets    NUMERIC(15,2),
    currency        TEXT DEFAULT 'ARS',
    source_url      TEXT,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(official_name, declaration_year)
);

CREATE TABLE IF NOT EXISTS asset_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    declaration_id      UUID NOT NULL REFERENCES asset_declarations(id) ON DELETE CASCADE,
    category            TEXT NOT NULL,       -- 'real_estate', 'vehicle', 'investment', 'company', 'bank_account'
    description         TEXT,
    value               NUMERIC(15,2),
    currency            TEXT DEFAULT 'ARS',
    company_name        TEXT,               -- if category = 'company'
    ownership_percentage FLOAT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BLOC / INTERBLOC TRACKING ──────────────────────────────

CREATE TABLE IF NOT EXISTS parliamentary_blocs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id  UUID NOT NULL REFERENCES institutions(id),
    name            TEXT NOT NULL,
    short_name      TEXT,
    interbloc_name  TEXT,
    president_name  TEXT,
    member_count    INT DEFAULT 0,
    external_id     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, name)
);

-- ─── SCRAPING AUDIT LOG ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS scraping_runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source          TEXT NOT NULL,          -- 'hcdn_legislators', 'senate_votes', etc.
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    status          TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
    records_found   INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    error_message   TEXT,
    metadata        JSONB
);

-- ─── INDICES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_session_attendance_session ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_politician ON session_attendance(politician_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_politician ON committee_memberships(politician_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_committee ON committee_memberships(committee_id);
CREATE INDEX IF NOT EXISTS idx_executive_actions_type ON executive_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_executive_actions_date ON executive_actions(date);
CREATE INDEX IF NOT EXISTS idx_asset_declarations_politician ON asset_declarations(politician_id);
CREATE INDEX IF NOT EXISTS idx_asset_declarations_year ON asset_declarations(declaration_year);
CREATE INDEX IF NOT EXISTS idx_parliamentary_blocs_institution ON parliamentary_blocs(institution_id);
CREATE INDEX IF NOT EXISTS idx_scraping_runs_source ON scraping_runs(source);
