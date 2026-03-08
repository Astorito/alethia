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
  ExecutiveAuthority,
  DecreeOrResolution,
  CongressEvent,
  UpcomingSession,
  UserAlert,
  MonthlyConsistency,
  UserPreferences,
  Bill,
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

export function getAllInstitutions() {
  return data.institutions;
}

export function getAllProvinces(): string[] {
  const provinces = [...new Set(data.politicians.map((p) => p.province))];
  return provinces.sort();
}

// ─── Ejecutivo Nacional ──────────────────────────────────────

export function getExecutiveAuthorities(): ExecutiveAuthority[] {
  const authorities = data.executive_authorities ?? [];
  return [...authorities].sort((a, b) => {
    const isPresA = a.role_title.toLowerCase().includes("president");
    const isPresB = b.role_title.toLowerCase().includes("president");
    if (isPresA && !isPresB) return -1;
    if (!isPresA && isPresB) return 1;
    return 0;
  });
}

export function getExecutiveDecrees(): DecreeOrResolution[] {
  const decrees = data.executive_decrees ?? [];
  return [...decrees].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// ─── Topics avanzados ────────────────────────────────────────

export function getTopicBySlug(slug: string): Topic | null {
  return data.topics.find((t) => t.slug === slug) ?? null;
}

export function getPoliticiansByTopic(topicId: string): (ConsistencyScore & { politician: Politician })[] {
  return data.consistency_scores
    .filter((cs) => cs.topic_id === topicId)
    .map((cs) => ({
      ...cs,
      politician: data.politicians.find((p) => p.id === cs.politician_id)!,
    }))
    .filter((cs) => cs.politician)
    .sort((a, b) => b.score - a.score);
}

export function getBillsByPolicyArea(area: string): Bill[] {
  return data.bills
    .filter((b) => b.policy_area === area)
    .sort((a, b) => new Date(b.introduced_at).getTime() - new Date(a.introduced_at).getTime());
}

export function getTopicTrend(topicId: string): { month: string; value: number }[] {
  const topic = data.topics.find((t) => t.id === topicId);
  if (!topic) return [];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const base = topic.momentum_score * 10;
  return months.map((month, i) => ({
    month,
    value: Math.max(0.1, Math.round((base + Math.sin(i * 0.7) * 2 + (i * 0.15)) * 10) / 10),
  }));
}

// ─── Mis Temas (user preferences) ───────────────────────────

export function getUserPreferences(): UserPreferences {
  return data.user_preferences ?? { followed_topic_ids: [], followed_politician_ids: [] };
}

export function getUserFollowedTopics(): Topic[] {
  const prefs = getUserPreferences();
  return data.topics.filter((t) => prefs.followed_topic_ids.includes(t.id));
}

// ─── Análisis avanzado ───────────────────────────────────────

export function getVoteDistribution(partyId?: string): { name: string; value: number; color: string }[] {
  const positions = partyId
    ? data.vote_positions.filter((vp) => vp.party_id === partyId)
    : data.vote_positions;

  const counts = { yes: 0, no: 0, abstain: 0, absent: 0 };
  for (const vp of positions) {
    if (vp.position in counts) counts[vp.position as keyof typeof counts]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return [
    { name: "A favor", value: Math.round((counts.yes / total) * 100), color: "#4CAF50" },
    { name: "En contra", value: Math.round((counts.no / total) * 100), color: "#E74C3C" },
    { name: "Abstención", value: Math.round((counts.abstain / total) * 100), color: "#F39C12" },
    { name: "Ausente", value: Math.round((counts.absent / total) * 100), color: "#9CA3AF" },
  ];
}

export function getMonthlyActivity(): { month: string; sesiones: number; discursos: number; votos: number }[] {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMap: Record<string, { sesiones: number; discursos: number; votos: number }> = {};

  for (const m of months) {
    monthMap[m] = { sesiones: 0, discursos: 0, votos: 0 };
  }

  const monthNames: Record<number, string> = {
    1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
  };

  for (const session of data.sessions) {
    const m = monthNames[new Date(session.date).getMonth() + 1];
    if (m && monthMap[m]) {
      monthMap[m].sesiones++;
      monthMap[m].discursos += session.speech_count;
    }
  }

  for (const vote of data.votes) {
    const m = monthNames[new Date(vote.voted_at).getMonth() + 1];
    if (m && monthMap[m]) monthMap[m].votos++;
  }

  return months
    .filter((m) => monthMap[m].sesiones > 0 || monthMap[m].discursos > 0)
    .map((m) => ({ month: m, ...monthMap[m] }));
}

export function getTopAlliances(limit = 20): (AllianceScore & { polA: Politician; polB: Politician })[] {
  return data.alliance_scores
    .sort((a, b) => b.alignment_rate - a.alignment_rate)
    .slice(0, limit)
    .map((al) => ({
      ...al,
      polA: data.politicians.find((p) => p.id === al.politician_a_id)!,
      polB: data.politicians.find((p) => p.id === al.politician_b_id)!,
    }))
    .filter((al) => al.polA && al.polB);
}

export function getMonthlyConsistencyByParty(): MonthlyConsistency[] {
  return data.monthly_consistency ?? [];
}

// ─── Hoy en el Congreso ──────────────────────────────────────

export function getCongressToday(): CongressEvent[] {
  return data.congress_today ?? [];
}

export function getUpcomingSessions(): UpcomingSession[] {
  return (data.upcoming_sessions ?? []).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getRecentBillMovements(): Bill[] {
  return data.bills
    .filter((b) => b.status !== "draft" && b.status !== "rejected")
    .sort((a, b) => new Date(b.updated_at ?? b.introduced_at).getTime() - new Date(a.updated_at ?? a.introduced_at).getTime())
    .slice(0, 6);
}

// ─── Alertas ─────────────────────────────────────────────────

export function getUserAlerts(): UserAlert[] {
  return (data.user_alerts ?? []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getUnreadAlertsCount(): number {
  return (data.user_alerts ?? []).filter((a) => !a.read).length;
}