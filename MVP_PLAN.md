# Alethia MVP — Plan de Ejecución

## Alcance MVP: Dashboard de Transparencia Legislativa

3 pantallas principales + 3 features compartibles. Datos simulados (JSON estático). Sin backend. Sin LLM.

---

## Pasos Concretos

| Paso | Descripción | Dependencia |
|------|-------------|-------------|
| 1 | Inicializar proyecto Next.js + dependencias + estructura de carpetas | Ninguna |
| 2 | Generar seed_data.json y crear capa de acceso a datos | Paso 1 |
| 3 | Layout principal: sidebar + header + contenido responsive | Paso 1 |
| 4 | Dashboard Panorama: stats globales, top Discourse Gaps, actividad reciente | Pasos 2, 3 |
| 5 | Lista de Legisladores: grid con fotos, scores, filtros por partido/provincia | Pasos 2, 3 |
| 6 | Perfil de Legislador: score, historial de votos, timeline de contradicciones | Pasos 2, 5 |
| 7 | Ranking de Coherencia: leaderboard ordenable con posiciones y tendencias | Pasos 2, 3 |
| 8 | Comparador 1v1: seleccionar dos legisladores y ver lado a lado | Paso 6 |
| 9 | Tarjeta Compartible: card tipo "report card" exportable como imagen | Paso 6 |

---

## PASO 1 — Inicializar proyecto Next.js (DETALLADO)

### Objetivo
Crear el proyecto Next.js dentro de la carpeta `frontend/` con todas las dependencias y la estructura de carpetas lista para desarrollar.

### Comandos a ejecutar

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Cuando pregunte opciones, elegir:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: @/*

### Dependencias adicionales a instalar

```bash
npm install lucide-react clsx tailwind-merge
npm install @tanstack/react-query
npm install -D @types/node
```

NO instalar shadcn/ui todavía. Se agrega después cuando se necesite un componente específico.

### Estructura de carpetas a crear

Después de crear el proyecto, generar esta estructura dentro de `frontend/src/`:

```
frontend/src/
├── app/
│   ├── layout.tsx              ← ya existe, se modifica
│   ├── page.tsx                ← ya existe, se reemplaza (Dashboard)
│   ├── globals.css             ← ya existe, se modifica
│   ├── politicians/
│   │   ├── page.tsx            ← Lista de legisladores
│   │   └── [id]/
│   │       └── page.tsx        ← Perfil individual
│   ├── ranking/
│   │   └── page.tsx            ← Leaderboard de coherencia
│   └── compare/
│       └── page.tsx            ← Comparador 1v1
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         ← Navegación lateral
│   │   └── header.tsx          ← Header con búsqueda
│   ├── dashboard/
│   │   ├── stats-cards.tsx     ← Tarjetas de métricas globales
│   │   ├── gap-chart.tsx       ← Gráfico de Discourse Gap
│   │   └── activity-feed.tsx   ← Feed de actividad reciente
│   ├── politicians/
│   │   ├── politician-card.tsx ← Card individual en el grid
│   │   ├── politician-grid.tsx ← Grid con filtros
│   │   └── filters.tsx         ← Filtros por partido/provincia
│   ├── profile/
│   │   ├── score-card.tsx      ← Score de coherencia visual
│   │   ├── vote-history.tsx    ← Historial de votos
│   │   └── contradiction-timeline.tsx ← Timeline de contradicciones
│   ├── ranking/
│   │   └── leaderboard.tsx     ← Tabla del ranking
│   ├── compare/
│   │   └── compare-view.tsx    ← Vista de comparación 1v1
│   └── ui/
│       ├── badge.tsx           ← Badge reutilizable
│       ├── card.tsx            ← Card wrapper reutilizable
│       └── progress-bar.tsx    ← Barra de progreso para scores
├── lib/
│   ├── data.ts                 ← Funciones de acceso a seed_data.json
│   ├── types.ts                ← Tipos TypeScript para todas las entidades
│   └── utils.ts                ← Helpers (cn(), formatDate, etc.)
└── data/
    └── seed_data.json          ← Datos simulados generados por seed_demo.py
```

### Archivo `lib/utils.ts` — contenido inicial

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500";
  if (grade.startsWith("B")) return "text-blue-500";
  if (grade.startsWith("C")) return "text-amber-500";
  return "text-red-500";
}

export function getGradeBgColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/10";
  if (grade.startsWith("B")) return "bg-blue-500/10";
  if (grade.startsWith("C")) return "bg-amber-500/10";
  return "bg-red-500/10";
}
```

### Configuración de Tailwind

En `tailwind.config.ts`, agregar los colores de los partidos políticos:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Partidos políticos argentinos
        "party-uxp": "#1A5FA8",
        "party-lla": "#9B59B6",
        "party-jxc": "#F4D03F",
        "party-hcf": "#E67E22",
        "party-fit": "#E74C3C",
        // UI
        "alethia-primary": "#1A1A2E",
        "alethia-accent": "#16213E",
        "alethia-highlight": "#0F3460",
        "alethia-gold": "#E2B714",
      },
    },
  },
  plugins: [],
};

export default config;
```

### Criterios de aceptación del Paso 1

- [ ] `npm run dev` levanta sin errores en http://localhost:3000
- [ ] La estructura de carpetas está creada (pueden estar vacías)
- [ ] `lib/utils.ts` y `lib/types.ts` existen
- [ ] Tailwind funciona (se ve algún estilo aplicado)
- [ ] No hay errores de TypeScript (`npm run build` pasa)

---

## PASO 2 — Generar datos y crear capa de acceso (DETALLADO)

### Objetivo
Tener un archivo `seed_data.json` dentro de `frontend/src/data/` con datos realistas, y una capa de tipos TypeScript + funciones de acceso que hagan fácil consumir esos datos desde cualquier componente.

### 2A — Generar el seed_data.json

Ir a la raíz del proyecto y ejecutar:

```bash
cd backend/seeds
pip install faker
python seed_demo.py
```

Esto genera un archivo `seed_data.json` en la misma carpeta. Moverlo a:

```bash
# Desde la raíz del proyecto
mv backend/seeds/seed_data.json frontend/src/data/seed_data.json
```

El archivo tiene esta estructura:

```json
{
  "institutions": [...],       // 4 registros
  "parties": [...],            // 5 registros
  "topics": [...],             // 10 registros
  "politicians": [...],        // 15 registros
  "politician_roles": [...],   // ~20 registros
  "sessions": [...],           // 20 registros
  "bills": [...],              // 30 registros
  "votes": [...],              // 40 registros
  "vote_positions": [...],     // ~420 registros
  "speeches": [...],           // ~200 registros
  "speech_analyses": [...],    // ~200 registros
  "consistency_scores": [...], // ~60 registros
  "contradictions": [...],     // ~30 registros
  "alliance_scores": [...],    // ~40 registros
  "discourse_gaps": [...],     // 10 registros
  "users": [...]               // 1 registro
}
```

### 2B — Archivo de tipos: `lib/types.ts`

Crear este archivo con TODOS los tipos que mapean al seed:

```typescript
export interface Institution {
  id: string;
  name: string;
  short_name: string;
  type: "deputies" | "senate" | "executive" | "municipal";
  country: string;
  created_at: string;
}

export interface Party {
  id: string;
  name: string;
  short_name: string;
  color_hex: string;
  ideology: string;
  founded_at: string;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  policy_area: string;
  color_hex: string;
  hero_image_url: string | null;
  mention_count: number;
  bill_count: number;
  speech_count: number;
  momentum_score: number;
  discourse_gap_score: number;
  discourse_gap_label: string;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Politician {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  province: string;
  photo_url: string;
  bio: string;
  consistency_score: number;
  consistency_grade: string;
  activity_score: number;
  last_analyzed_at: string;
  external_id: string;
  created_at: string;
  updated_at: string;
}

export interface PoliticianRole {
  id: string;
  politician_id: string;
  institution_id: string;
  party_id: string;
  role_title: string;
  started_at: string;
  ended_at: string | null;
  district: string;
  created_at: string;
}

export interface Session {
  id: string;
  institution_id: string;
  title: string;
  session_number: string;
  session_type: string;
  date: string;
  started_at: string;
  ended_at: string;
  status: string;
  processing_status: string;
  speech_count: number;
  word_count: number;
  external_id: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  institution_id: string;
  title: string;
  number: string;
  summary: string;
  policy_area: string;
  status: "draft" | "committee" | "floor" | "passed" | "enacted" | "rejected";
  introduced_at: string;
  enacted_at: string | null;
  external_id: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  session_id: string;
  bill_id: string | null;
  title: string;
  vote_type: string;
  result: string;
  yes_count: number;
  no_count: number;
  abstain_count: number;
  absent_count: number;
  voted_at: string;
  external_id: string;
  created_at: string;
}

export interface VotePosition {
  id: string;
  vote_id: string;
  politician_id: string;
  position: "yes" | "no" | "abstain" | "absent" | "present";
  party_id: string;
  created_at: string;
}

export interface Speech {
  id: string;
  session_id: string;
  politician_id: string;
  speaker_label: string;
  transcript: string;
  word_count: number;
  duration_seconds: number;
  start_time: number;
  end_time: number;
  sequence_order: number;
  embedding_model: string;
  created_at: string;
}

export interface SpeechAnalysis {
  id: string;
  speech_id: string;
  topic: string;
  topic_cluster: string;
  policy_area: string;
  summary: string;
  stance: "support" | "oppose" | "neutral" | "mixed";
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number;
  keywords: string[];
  confidence: number;
  model_used: string;
  created_at: string;
}

export interface ConsistencyScore {
  id: string;
  politician_id: string;
  topic_id: string | null;
  policy_area: string | null;
  score: number;
  grade: string;
  speech_count: number;
  vote_count: number;
  contradiction_count: number;
  alignment_count: number;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface Contradiction {
  id: string;
  politician_id: string;
  speech_id: string;
  vote_id: string;
  topic_id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  speech_stance: string;
  vote_position: string;
  similarity_score: number;
  detected_at: string;
  is_flagged: boolean;
  reviewed: boolean;
}

export interface AllianceScore {
  id: string;
  politician_a_id: string;
  politician_b_id: string;
  same_party: boolean;
  alignment_rate: number;
  vote_count: number;
  topic_id: string | null;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface DiscourseGap {
  id: string;
  topic_id: string;
  institution_id: string;
  mention_count: number;
  speech_count: number;
  politician_count: number;
  bills_introduced: number;
  bills_passed: number;
  laws_enacted: number;
  gap_ratio: number;
  gap_label: string;
  gap_severity: "low" | "medium" | "high" | "critical";
  period_start: string;
  period_end: string;
  calculated_at: string;
}

export interface SeedData {
  institutions: Institution[];
  parties: Party[];
  topics: Topic[];
  politicians: Politician[];
  politician_roles: PoliticianRole[];
  sessions: Session[];
  bills: Bill[];
  votes: Vote[];
  vote_positions: VotePosition[];
  speeches: Speech[];
  speech_analyses: SpeechAnalysis[];
  consistency_scores: ConsistencyScore[];
  contradictions: Contradiction[];
  alliance_scores: AllianceScore[];
  discourse_gaps: DiscourseGap[];
}

// ─── Tipos derivados (para las vistas) ─────────────────────

export interface PoliticianWithParty extends Politician {
  party: Party | null;
  current_role: PoliticianRole | null;
}

export interface PoliticianProfile extends PoliticianWithParty {
  roles: PoliticianRole[];
  votes: (VotePosition & { vote: Vote })[];
  speeches: Speech[];
  contradictions: Contradiction[];
  consistency_by_topic: ConsistencyScore[];
  alliances: (AllianceScore & { ally: Politician })[];
}

export interface DashboardStats {
  total_politicians: number;
  total_sessions: number;
  total_votes: number;
  total_speeches: number;
  total_contradictions: number;
  avg_consistency: number;
  top_gaps: (DiscourseGap & { topic: Topic })[];
}
```

### 2C — Capa de acceso a datos: `lib/data.ts`

Este archivo es el "backend falso". Importa el JSON y expone funciones tipadas que simulan queries. Cuando se conecte el backend real, solo hay que cambiar este archivo.

```typescript
import seedData from "@/data/seed_data.json";
import type {
  SeedData,
  Politician,
  PoliticianWithParty,
  PoliticianProfile,
  Party,
  Topic,
  Vote,
  VotePosition,
  Contradiction,
  ConsistencyScore,
  DiscourseGap,
  DashboardStats,
  AllianceScore,
  PoliticianRole,
} from "./types";

const data = seedData as unknown as SeedData;

// ─── Helpers internos ────────────────────────────────────────

function findPartyForPolitician(politicianId: string): Party | null {
  const currentRole = data.politician_roles.find(
    (r) => r.politician_id === politicianId && r.ended_at === null
  );
  if (!currentRole) return null;
  return data.parties.find((p) => p.id === currentRole.party_id) ?? null;
}

function getCurrentRole(politicianId: string): PoliticianRole | null {
  return (
    data.politician_roles.find(
      (r) => r.politician_id === politicianId && r.ended_at === null
    ) ?? null
  );
}

// ─── Dashboard ───────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const topGaps = data.discourse_gaps
    .sort((a, b) => b.gap_ratio - a.gap_ratio)
    .slice(0, 5)
    .map((gap) => ({
      ...gap,
      topic: data.topics.find((t) => t.id === gap.topic_id)!,
    }));

  const scores = data.politicians.map((p) => p.consistency_score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    total_politicians: data.politicians.length,
    total_sessions: data.sessions.length,
    total_votes: data.votes.length,
    total_speeches: data.speeches.length,
    total_contradictions: data.contradictions.length,
    avg_consistency: Math.round(avg * 10) / 10,
    top_gaps: topGaps,
  };
}

// ─── Legisladores ────────────────────────────────────────────

export function getAllPoliticians(): PoliticianWithParty[] {
  return data.politicians.map((p) => ({
    ...p,
    party: findPartyForPolitician(p.id),
    current_role: getCurrentRole(p.id),
  }));
}

export function getPoliticianById(id: string): PoliticianProfile | null {
  const politician = data.politicians.find((p) => p.id === id);
  if (!politician) return null;

  const party = findPartyForPolitician(id);
  const currentRole = getCurrentRole(id);
  const roles = data.politician_roles.filter((r) => r.politician_id === id);

  const votePositions = data.vote_positions
    .filter((vp) => vp.politician_id === id)
    .map((vp) => ({
      ...vp,
      vote: data.votes.find((v) => v.id === vp.vote_id)!,
    }))
    .filter((vp) => vp.vote);

  const speeches = data.speeches.filter((s) => s.politician_id === id);
  const contradictions = data.contradictions.filter(
    (c) => c.politician_id === id
  );

  const consistencyByTopic = data.consistency_scores.filter(
    (cs) => cs.politician_id === id && cs.topic_id !== null
  );

  const alliances = data.alliance_scores
    .filter(
      (a) => a.politician_a_id === id || a.politician_b_id === id
    )
    .map((a) => {
      const allyId =
        a.politician_a_id === id ? a.politician_b_id : a.politician_a_id;
      return {
        ...a,
        ally: data.politicians.find((p) => p.id === allyId)!,
      };
    })
    .filter((a) => a.ally)
    .sort((a, b) => b.alignment_rate - a.alignment_rate);

  return {
    ...politician,
    party,
    current_role: currentRole,
    roles,
    votes: votePositions,
    speeches,
    contradictions,
    consistency_by_topic: consistencyByTopic,
    alliances,
  };
}

export function filterPoliticians(filters: {
  party?: string;
  province?: string;
  search?: string;
  sortBy?: "name" | "score" | "activity";
  sortDir?: "asc" | "desc";
}): PoliticianWithParty[] {
  let result = getAllPoliticians();

  if (filters.party) {
    result = result.filter((p) => p.party?.short_name === filters.party);
  }

  if (filters.province) {
    result = result.filter((p) => p.province === filters.province);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) => p.full_name.toLowerCase().includes(q));
  }

  const dir = filters.sortDir === "asc" ? 1 : -1;
  switch (filters.sortBy) {
    case "name":
      result.sort((a, b) => a.full_name.localeCompare(b.full_name) * dir);
      break;
    case "activity":
      result.sort((a, b) => (a.activity_score - b.activity_score) * dir);
      break;
    case "score":
    default:
      result.sort(
        (a, b) => (a.consistency_score - b.consistency_score) * dir
      );
  }

  return result;
}

// ─── Ranking ─────────────────────────────────────────────────

export function getRanking(): PoliticianWithParty[] {
  return getAllPoliticians().sort(
    (a, b) => b.consistency_score - a.consistency_score
  );
}

// ─── Comparador ──────────────────────────────────────────────

export function comparePoliticians(
  idA: string,
  idB: string
): { a: PoliticianProfile; b: PoliticianProfile; shared_votes: number; alignment_rate: number } | null {
  const a = getPoliticianById(idA);
  const b = getPoliticianById(idB);
  if (!a || !b) return null;

  const alliance = data.alliance_scores.find(
    (al) =>
      (al.politician_a_id === idA && al.politician_b_id === idB) ||
      (al.politician_a_id === idB && al.politician_b_id === idA)
  );

  return {
    a,
    b,
    shared_votes: alliance?.vote_count ?? 0,
    alignment_rate: alliance?.alignment_rate ?? 0,
  };
}

// ─── Topics / Discourse Gaps ─────────────────────────────────

export function getAllTopics(): Topic[] {
  return data.topics;
}

export function getDiscourseGaps(): (DiscourseGap & { topic: Topic })[] {
  return data.discourse_gaps
    .map((gap) => ({
      ...gap,
      topic: data.topics.find((t) => t.id === gap.topic_id)!,
    }))
    .sort((a, b) => b.gap_ratio - a.gap_ratio);
}

// ─── Datos auxiliares para filtros ───────────────────────────

export function getAllParties(): Party[] {
  return data.parties;
}

export function getAllProvinces(): string[] {
  const provinces = [...new Set(data.politicians.map((p) => p.province))];
  return provinces.sort();
}
```

### Criterios de aceptación del Paso 2

- [ ] Existe `frontend/src/data/seed_data.json` con datos generados
- [ ] Existe `frontend/src/lib/types.ts` con todos los tipos
- [ ] Existe `frontend/src/lib/data.ts` con todas las funciones de acceso
- [ ] Existe `frontend/src/lib/utils.ts` con helpers
- [ ] Se puede importar `getDashboardStats()` desde un page.tsx y devuelve datos válidos
- [ ] `npm run build` pasa sin errores de TypeScript
- [ ] Todos los tipos matchean la estructura del JSON (no hay `any`)

---

## Pasos 3-9 (Resumen para planificar)

### Paso 3 — Layout principal
- Sidebar fijo a la izquierda: logo Alethia, links a Dashboard, Legisladores, Ranking, Comparador
- Header con título de la página actual
- Responsive: sidebar se colapsa en mobile a hamburger menu
- Tema oscuro (fondo #1A1A2E, texto blanco)
- Fuente: Inter o system-ui

### Paso 4 — Dashboard Panorama
- 4 stat cards: legisladores, sesiones, votaciones, score promedio
- Gráfico de barras horizontal: top 5 Discourse Gaps (tema + ratio)
- Feed de actividad reciente (últimas sesiones + votaciones)
- Todo server component, sin "use client"

### Paso 5 — Lista de Legisladores
- Grid de cards (3 columnas desktop, 1 mobile)
- Cada card: foto, nombre, partido (con color), provincia, score con grade
- Filtros: dropdown partido, dropdown provincia, búsqueda por nombre
- Ordenar por: score (default), nombre, actividad

### Paso 6 — Perfil de Legislador
- Header: foto grande, nombre, partido, provincia, rol actual
- Score de coherencia grande con grade (estilo report card)
- Gráfico de coherencia por tema
- Timeline de contradicciones: fecha, descripción, severidad con colores
- Historial de votos recientes: tabla con votación, posición, resultado

### Paso 7 — Ranking de Coherencia
- Tabla: posición, foto, nombre, partido, score, grade, contradicciones
- Ordenable por columna
- Indicador visual de top 3 (oro, plata, bronce)
- Barras de progreso para el score

### Paso 8 — Comparador 1v1
- Dos selectores de legislador (dropdown con búsqueda)
- Side by side: foto, score, grade, partido
- Tasa de alineamiento entre ambos
- Tabla de votos donde votaron diferente (las discrepancias)
- Diferencia de score por tema

### Paso 9 — Tarjeta Compartible
- En el perfil del legislador, botón "Compartir"
- Genera un card estilo infografía con: nombre, foto, score, grade, top contradicción
- Usa html2canvas o similar para exportar como PNG
- Dimensiones optimizadas para Twitter/X (1200x628)
