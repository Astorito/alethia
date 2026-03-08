# Alethia — Plataforma de Inteligencia Política

> Convierte sesiones legislativas en datos estructurados, análisis de discurso y dashboards de transparencia ciudadana.

---

## Objetivo final

Alethia es una plataforma que permite a ciudadanos, periodistas y organizaciones civiles entender **qué dicen** los legisladores argentinos, **cómo votan**, y sobre todo **cuándo hay contradicción entre ambas cosas**.

El diferenciador central es el **Discourse Gap Score**: una métrica que cuantifica la brecha entre la cantidad de veces que un tema se menciona en el recinto y la cantidad de leyes que efectivamente se aprueban sobre ese tema. Si un tema se menciona 542 veces y se aprueba 1 ley, el gap es 542x.

Fuentes de datos objetivo:
- **Votaciones** — Cámara de Diputados (`votaciones.hcdn.gob.ar`) + Senado (`senado.gob.ar/votaciones`)
- **Discursos** — Versiones taquigráficas de sesiones (PDF → texto)
- **Proyectos de ley** — API del Congreso y/o scraping

Usuarios objetivo: ciudadanos con interés en política, periodistas de datos, ONGs de transparencia, empresas que necesitan monitorear legislación.

---

## Estado actual — Marzo 2025

### ✅ Lo que está construido y funciona

**Infraestructura completa (docker-compose)**
- PostgreSQL 16 + pgvector, Redis, MinIO, backend, worker, frontend — todo dockerizado

**Schema de base de datos (22 tablas)**
- Entidades: `politicians`, `sessions`, `speeches`, `votes`, `vote_positions`, `bills`, `topics`
- Análisis: `speech_analysis`, `consistency_scores`, `contradictions`, `alliance_scores`, `discourse_gaps`
- Usuarios: `users`, `user_preferences`, `alerts`
- Índices ivfflat para búsqueda semántica con pgvector

**Backend FastAPI (18 endpoints)**
- Todos los endpoints definidos y funcionando con datos en memoria
- API docs en `/docs`

**Frontend Next.js — 4 vistas completas**
- Dashboard Panorama: stats globales, actividad semanal, Discurso vs. Realidad
- Lista de Legisladores: grid con consistency score y filtros
- Perfil de Político: trayectoria, score de coherencia IA, contradicciones
- Vista de Tema: hero image, gap score, quién habla, distribución geográfica
- Búsqueda semántica con highlights

**Datos simulados realistas**
- 15 políticos argentinos, 20 sesiones, ~200 discursos con análisis LLM simulado
- Votaciones con posiciones individuales por legislador
- Scores de coherencia y contradicciones detectadas

**Conector de fuentes reales (en progreso)**
- `hcd_connector.py`: scraper de `votaciones.hcdn.gob.ar` adaptado de `rquiroga7/como_voto`
- Estructura JSON del HCDN documentada y mapeada al schema
- Normalización de nombres con fuzzy matching
- Scraper del Senado con HTML parsing
- Análisis técnico completo de ambas fuentes en `FUENTES_ANALISIS.md`

### ⚠️ Lo que falta para ser funcional con datos reales

- Conectar la API a PostgreSQL (actualmente sirve JSON estático del seed)
- Correr la ingestion inicial de votaciones reales (períodos 2022-2025)
- Matching de nombres del HCDN contra tabla `politicians`
- Pipeline LLM sobre taquigrafías reales

---

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Base de datos | PostgreSQL 16 + pgvector |
| Queue | Celery + Redis |
| Storage | MinIO |
| Backend | FastAPI + SQLAlchemy async |
| Frontend | Next.js 14 + Tailwind |

## Créditos y fuentes

- **[rquiroga7/como_voto](https://github.com/rquiroga7/como_voto)** — Base del conector HCDN. Resolvió el trabajo más difícil: entender la estructura de las APIs del Congreso, el cruce entre cámaras y la normalización de nombres. MIT License.
- **[votaciones.hcdn.gob.ar](https://votaciones.hcdn.gob.ar)** — Fuente oficial de votaciones de Diputados. Datos de dominio público.
- **[senado.gob.ar/votaciones](https://www.senado.gob.ar/votaciones/actas)** — Fuente oficial de votaciones del Senado. Datos de dominio público.



---

## Inicio rápido (local)

### 1. Prerrequisitos
- Docker + Docker Compose
- Python 3.11+
- Node 20+

### 2. Variables de entorno
```bash
cp .env.example .env
# Editar con tus keys de OpenAI/Anthropic si querés análisis LLM real
```

### 3. Levantar infraestructura
```bash
docker compose up db redis minio -d
```

### 4. Backend
```bash
cd backend
pip install -r requirements.txt
# Generar datos simulados
python -m seeds.seed_demo
# Levantar API
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## URLs

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |

---

## Estructura del monorepo

```
alethia/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Settings
│   │   ├── database.py      # SQLAlchemy engine
│   │   ├── models/          # ORM models
│   │   ├── api/             # Routers
│   │   │   ├── politicians.py
│   │   │   ├── topics.py
│   │   │   ├── analysis.py
│   │   │   ├── dashboard.py
│   │   │   ├── sessions.py
│   │   │   └── search.py
│   │   └── services/        # Lógica de negocio
│   ├── seeds/
│   │   └── seed_demo.py     # Datos simulados argentinos
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Dashboard panorama
│       │   ├── politicians/      # Lista y perfiles
│       │   ├── topics/           # Lista y detalle
│       │   └── search/           # Búsqueda semántica
│       ├── components/
│       │   ├── layout/Sidebar.tsx
│       │   └── charts/
│       └── lib/api.ts
└── infra/
    └── postgres/
        ├── init.sql
        └── schema.sql
```

---

## API Endpoints principales

```
GET /api/v1/dashboard/overview        — Stats globales
GET /api/v1/politicians               — Lista con filtros
GET /api/v1/politicians/:id           — Perfil completo
GET /api/v1/politicians/:id/consistency — Score de coherencia
GET /api/v1/politicians/:id/alliances — Redes de alianzas
GET /api/v1/topics                    — Lista de temas
GET /api/v1/topics/:slug              — Tema + discourse gap
GET /api/v1/analysis/consistency      — Ranking consistencia
GET /api/v1/analysis/alliances        — Red de alianzas
GET /api/v1/analysis/discourse-gap    — Brechas discurso/ley
GET /api/v1/analysis/contradictions   — Contradicciones detectadas
GET /api/v1/search?q=...              — Búsqueda semántica
```

---

## Roadmap

```
FASE 0 ──────── FASE 1 ──────── FASE 2 ──────── FASE 3 ──────── FASE 4
Fundación       DB + Datos      Análisis LLM    Features        Escala
  ✅ done         🔄 next          🔲              🔲              🔲
```

---

### ✅ Fase 0 — Fundación `COMPLETA`

Objetivo: validar la arquitectura y el modelo de datos antes de tocar fuentes reales.

- [x] Monorepo completo (backend + frontend + infra)
- [x] Schema PostgreSQL con 22 tablas y relaciones completas
- [x] Docker Compose con todos los servicios
- [x] ORM SQLAlchemy con todos los modelos
- [x] FastAPI con 18 endpoints operativos
- [x] Datos simulados realistas de Argentina (`seed_demo.py`)
- [x] Frontend Next.js con 4 vistas principales y diseño editorial
- [x] Análisis técnico de fuentes reales (HCDN + Senado)
- [x] Conector `hcd_connector.py` basado en `rquiroga7/como_voto`
- [x] Documentación de estructura JSON del HCDN

---

### 🔄 Fase 1 — Datos reales `EN CURSO`

Objetivo: reemplazar el seed simulado por datos reales del Congreso argentino.

**1.1 — Ingestion de votaciones** ← *próximo paso*
- [ ] Correr `hcd_connector.py` para períodos 140-143 (2022-2025)
- [ ] Loader que inserta actas cacheadas en PostgreSQL
- [ ] Matching nombres HCDN → `politicians` con rapidfuzz
- [ ] Scraper del Senado adaptado al schema
- [ ] ~50.000 `vote_positions` reales en DB

**1.2 — Lista de legisladores actuales**
- [ ] Scraper de `hcdn.gob.ar/diputados/` → tabla `politicians`
- [ ] Scraper de `senado.gob.ar/senadores/` → tabla `politicians`
- [ ] Tabla `politician_roles` con mandatos activos e históricos

**1.3 — Conectar API a PostgreSQL**
- [ ] Alembic migrations desde el schema SQL
- [ ] Reemplazar lectura de JSON estático por queries async a PostgreSQL
- [ ] Endpoints de análisis con datos reales

---

### 🔲 Fase 2 — Análisis LLM

Objetivo: extraer inteligencia de los discursos y cruzarla con los votos.

**2.1 — Taquigrafías (discursos)**
- [ ] Scraper de versiones taquigráficas HCDN (PDF por sesión)
- [ ] Parser PDF → texto → tabla `speeches`
- [ ] Pipeline Celery: speech → GPT-4o-mini → `speech_analysis`
  - Tema, subtema, postura (support/oppose/neutral), sentimiento
  - Extracción de afirmaciones (`claims`)
  - Resumen de 2 oraciones

**2.2 — Consistency Score real**
- [ ] Algoritmo: comparar `speech_analysis.stance` vs `vote_positions.position`
  - Por legislador y por tema
  - Score 0-10, grado A/B/C/D
- [ ] Worker Celery que recalcula scores tras cada sesión
- [ ] Tabla `contradictions` con casos detectados automáticamente

**2.3 — Clustering y narrativas**
- [ ] BERTopic sobre corpus de speeches por tema
- [ ] Embeddings con `text-embedding-3-small` → pgvector
- [ ] Búsqueda semántica real (reemplaza búsqueda por texto)
- [ ] Tabla `narratives` con grupos de afirmaciones relacionadas

**2.4 — Discourse Gap Score real**
- [ ] Cruzar `speech_analysis.topic` (menciones) vs `bills.status` (leyes aprobadas)
- [ ] Cálculo automático por tema y período
- [ ] Tabla `discourse_gaps` con historial temporal

---

### 🔲 Fase 3 — Features de producto

Objetivo: convertir el motor analítico en un producto usable.

- [ ] Auth con Supabase (email + Google)
- [ ] Perfiles de usuario: temas seguidos, legisladores seguidos
- [ ] Sistema de alertas real-time (PostgreSQL LISTEN/NOTIFY → SSE)
  - Contradicción detectada en legislador seguido
  - Surge de un tema seguido
  - Proyecto de ley con avance
- [ ] Exportación de reportes en PDF por legislador o tema
- [ ] API pública para periodistas y ONGs (con rate limiting)
- [ ] GitHub Action: update automático lunes y jueves (como `como_voto`)

---

### 🔲 Fase 4 — Escala y features avanzados

Objetivo: expandir cobertura y profundidad analítica.

- [ ] Ingestion de audio/video con Whisper (sesiones sin taquigrafía)
- [ ] Agentes MCP: Auditor de Consistencia, Analista de Debate
- [ ] Cobertura del Poder Ejecutivo (decretos, resoluciones)
- [ ] Legislatura porteña (LCBA)
- [ ] Knowledge graph con Neo4j para relaciones complejas
- [ ] Dashboard para empresas (monitoreo de legislación sectorial)
- [ ] Comparador entre legisladores ("¿cuánto votan igual X e Y?")

---
