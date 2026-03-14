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
  bloc: string | null;
  bloc: string | null;
chamber: string | null;
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

export interface ExecutiveAuthority {
  id: string;
  full_name: string;
  role_title: string;
  ministry_or_area: string | null;
  photo_url: string;
  started_at: string;
  ended_at: string | null;
  party_id: string | null;
}

export type DecreeType = "dnu" | "decreto" | "resolucion";

export interface DecreeOrResolution {
  id: string;
  number: string;
  date: string;
  type: DecreeType;
  summary: string;
  source_url: string | null;
}

export type CongressEventType = "session" | "vote" | "bill" | "speech";

export interface CongressEvent {
  id: string;
  type: CongressEventType;
  title: string;
  description: string;
  date: string;
  icon: string;
  related_ids: string[];
}

export interface UpcomingSession {
  id: string;
  title: string;
  date: string;
  institution: string;
}

export type AlertType = "contradiction" | "topic_surge" | "bill_advance" | "vote";

export interface UserAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  date: string;
  read: boolean;
  related_id: string | null;
}

export interface MonthlyConsistency {
  month: string;
  party_short: string;
  avg_score: number;
}

export interface UserPreferences {
  followed_topic_ids: string[];
  followed_politician_ids: string[];
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
  executive_authorities?: ExecutiveAuthority[];
  executive_decrees?: DecreeOrResolution[];
  congress_today?: CongressEvent[];
  upcoming_sessions?: UpcomingSession[];
  user_alerts?: UserAlert[];
  monthly_consistency?: MonthlyConsistency[];
  user_preferences?: UserPreferences;
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