import { supabase } from "./supabase";
import type {
  Politician,
  PoliticianWithParty,
  PoliticianProfile,
  Party,
  Bill,
  Vote,
  VotePosition,
  DashboardStats,
  PoliticianRole,
} from "./types";

// ─── Cache simple en memoria ─────────────────────────────────
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── Helpers ─────────────────────────────────────────────────

async function getPartyForPolitician(partyId: string | null): Promise<Party | null> {
  if (!partyId) return null;
  
  const { data } = await supabase
    .from("parties")
    .select("*")
    .eq("id", partyId)
    .single();
  
  return data as Party | null;
}

async function getCurrentRole(politicianId: string): Promise<PoliticianRole | null> {
  const { data } = await supabase
    .from("politician_roles")
    .select("*")
    .eq("politician_id", politicianId)
    .is("ended_at", null)
    .single();
  
  return data as PoliticianRole | null;
}

// ─── Dashboard ───────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const cacheKey = "dashboard_stats";
  const cached = getCache<DashboardStats>(cacheKey);
  if (cached) return cached;

  const [
    { count: politiciansCount },
    { count: sessionsCount },
    { count: votesCount },
    { count: speechesCount },
  ] = await Promise.all([
    supabase.from("politicians").select("*", { count: "exact", head: true }),
    supabase.from("sessions").select("*", { count: "exact", head: true }),
    supabase.from("votes").select("*", { count: "exact", head: true }),
    supabase.from("speeches").select("*", { count: "exact", head: true }),
  ]);

  // Calcular promedio de consistencia
  const { data: politicians } = await supabase
    .from("politicians")
    .select("consistency_score");
  
  const scores = politicians?.map((p) => p.consistency_score || 0) || [];
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const stats: DashboardStats = {
    total_politicians: politiciansCount || 0,
    total_sessions: sessionsCount || 0,
    total_votes: votesCount || 0,
    total_speeches: speechesCount || 0,
    total_contradictions: 0, // No implementado aún
    avg_consistency: Math.round(avg * 10) / 10,
    top_gaps: [], // No implementado aún
  };

  setCache(cacheKey, stats);
  return stats;
}

// ─── Legisladores ────────────────────────────────────────────

export async function getAllPoliticians(): Promise<PoliticianWithParty[]> {
  const cacheKey = "all_politicians";
  const cached = getCache<PoliticianWithParty[]>(cacheKey);
  if (cached) return cached;

  const { data: politicians } = await supabase
    .from("politicians")
    .select("*")
    .order("full_name");

  if (!politicians) return [];

  // Obtener roles actuales
  const { data: roles } = await supabase
    .from("politician_roles")
    .select("*")
    .is("ended_at", null);

  // Obtener partidos
  const { data: parties } = await supabase.from("parties").select("*");

  const politiciansWithData: PoliticianWithParty[] = politicians.map((p) => {
    const currentRole = roles?.find((r) => r.politician_id === p.id) || null;
    const party = currentRole?.party_id 
      ? parties?.find((party) => party.id === currentRole.party_id) || null 
      : null;

    return {
      ...p,
      party,
      current_role: currentRole,
    } as PoliticianWithParty;
  });

  setCache(cacheKey, politiciansWithData);
  return politiciansWithData;
}

export async function getPoliticianById(id: string): Promise<PoliticianProfile | null> {
  const { data: politician } = await supabase
    .from("politicians")
    .select("*")
    .eq("id", id)
    .single();

  if (!politician) return null;

  // Obtener roles
  const { data: roles } = await supabase
    .from("politician_roles")
    .select("*")
    .eq("politician_id", id);

  // Obtener partido actual
  const currentRole = roles?.find((r) => r.ended_at === null);
  const party = currentRole?.party_id
    ? await getPartyForPolitician(currentRole.party_id)
    : null;

  // Obtener votos
  const { data: votePositions } = await supabase
    .from("vote_positions")
    .select(`
      *,
      vote:votes(*)
    `)
    .eq("politician_id", id);

  // Obtener discursos
  const { data: speeches } = await supabase
    .from("speeches")
    .select("*")
    .eq("politician_id", id);

  return {
    ...politician,
    party,
    current_role: currentRole || null,
    roles: roles || [],
    votes: votePositions || [],
    speeches: speeches || [],
    contradictions: [],
    consistency_by_topic: [],
    alliances: [],
  } as PoliticianProfile;
}

export async function filterPoliticians(filters: {
  party?: string;
  province?: string;
  search?: string;
  sortBy?: "name" | "score" | "activity";
  sortDir?: "asc" | "desc";
}): Promise<PoliticianWithParty[]> {
  let query = supabase.from("politicians").select("*");

  if (filters.search) {
    query = query.ilike("full_name", `%${filters.search}%`);
  }

  if (filters.province) {
    query = query.eq("province", filters.province);
  }

  const { data: politicians } = await query;
  if (!politicians) return [];

  // Obtener roles y partidos
  const { data: roles } = await supabase
    .from("politician_roles")
    .select("*, party:parties(*)")
    .is("ended_at", null);

  let result: PoliticianWithParty[] = politicians.map((p) => {
    const role = roles?.find((r) => r.politician_id === p.id);
    return {
      ...p,
      party: role?.party || null,
      current_role: role || null,
    } as PoliticianWithParty;
  });

  // Filtrar por partido
  if (filters.party) {
    result = result.filter((p) => p.party?.short_name === filters.party);
  }

  // Ordenar
  const dir = filters.sortDir === "asc" ? 1 : -1;
  switch (filters.sortBy) {
    case "name":
      result.sort((a, b) => a.full_name.localeCompare(b.full_name) * dir);
      break;
    case "activity":
      result.sort((a, b) => ((a.activity_score || 0) - (b.activity_score || 0)) * dir);
      break;
    case "score":
    default:
      result.sort((a, b) => ((a.consistency_score || 0) - (b.consistency_score || 0)) * dir);
  }

  return result;
}

// ─── Ranking ─────────────────────────────────────────────────

export async function getRanking(): Promise<PoliticianWithParty[]> {
  const politicians = await getAllPoliticians();
  return politicians.sort((a, b) => (b.consistency_score || 0) - (a.consistency_score || 0));
}

// ─── Proyectos de Ley ────────────────────────────────────────

export async function getRecentBills(limit = 10): Promise<Bill[]> {
  const { data } = await supabase
    .from("bills")
    .select("*")
    .order("introduced_at", { ascending: false })
    .limit(limit);

  return (data || []) as Bill[];
}

export async function getBillsByYear(year: number): Promise<Bill[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data } = await supabase
    .from("bills")
    .select("*")
    .gte("introduced_at", startDate)
    .lte("introduced_at", endDate)
    .order("introduced_at", { ascending: false });

  return (data || []) as Bill[];
}

// ─── Provincias ──────────────────────────────────────────────

export async function getAllProvinces(): Promise<string[]> {
  const { data } = await supabase
    .from("politicians")
    .select("province")
    .not("province", "is", null);

  const provinces = [...new Set(data?.map((p) => p.province) || [])];
  return provinces.sort();
}

// ─── Partidos ────────────────────────────────────────────────

export async function getAllParties(): Promise<Party[]> {
  const { data } = await supabase.from("parties").select("*");
  return (data || []) as Party[];
}

// ─── Votos ───────────────────────────────────────────────────

export async function getVotePositionsByPolitician(politicianId: string): Promise<VotePosition[]> {
  const { data } = await supabase
    .from("vote_positions")
    .select("*")
    .eq("politician_id", politicianId);

  return (data || []) as VotePosition[];
}

export async function getVoteById(voteId: string): Promise<Vote | null> {
  const { data } = await supabase
    .from("votes")
    .select("*")
    .eq("id", voteId)
    .single();

  return data as Vote | null;
}
