import { createClient } from '@supabase/supabase-js'

// Estas variables deben estar en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de las tablas de Supabase
export type DbPolitician = {
  id: string
  full_name: string
  first_name: string | null
  last_name: string | null
  gender: string | null
  birth_date: string | null
  province: string | null
  photo_url: string | null
  bio: string | null
  consistency_score: number | null
  consistency_grade: string | null
  activity_score: number | null
  external_id: string | null
  source: string | null
  created_at: string
  updated_at: string
}

export type DbParty = {
  id: string
  name: string
  short_name: string | null
  color_hex: string | null
  ideology: string | null
  founded_at: string | null
  dissolved_at: string | null
  created_at: string
}

export type DbPoliticianRole = {
  id: string
  politician_id: string
  institution_id: string
  party_id: string | null
  role_title: string
  started_at: string
  ended_at: string | null
  district: string | null
  created_at: string
}

export type DbBill = {
  id: string
  institution_id: string
  title: string
  number: string | null
  summary: string | null
  policy_area: string | null
  status: string
  introduced_at: string | null
  enacted_at: string | null
  external_id: string | null
  source: string | null
  created_at: string
  updated_at: string
}

export type DbVote = {
  id: string
  session_id: string
  bill_id: string | null
  title: string
  vote_type: string | null
  result: string | null
  yes_count: number
  no_count: number
  abstain_count: number
  absent_count: number
  voted_at: string | null
  external_id: string | null
  created_at: string
}

export type DbVotePosition = {
  id: string
  vote_id: string
  politician_id: string
  position: string
  party_id: string | null
  created_at: string
}

export type DbInstitution = {
  id: string
  name: string
  short_name: string | null
  type: string
  country: string
  province: string | null
  api_base_url: string | null
  created_at: string
}
