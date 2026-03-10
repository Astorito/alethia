import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPoliticianById, getAllInstitutions } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Gavel,
  Mic,
  Briefcase,
  Building,
} from "lucide-react";

interface PoliticianPageProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ────────────────────────────────────────────────

function formatYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

function formatCurrency(amount: number) {
  return `$${(amount / 1_000_000).toFixed(1)}M`;
}

function getVoteIcon(position: string) {
  switch (position) {
    case "yes":
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case "no":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "abstain":
      return <MinusCircle className="w-4 h-4 text-amber-500" />;
    default:
      return <HelpCircle className="w-4 h-4 text-gray-400" />;
  }
}

function getVoteLabel(position: string) {
  switch (position) {
    case "yes":
      return "A favor";
    case "no":
      return "En contra";
    case "abstain":
      return "Abstención";
    default:
      return "Ausente";
  }
}

function getVoteStyle(position: string) {
  switch (position) {
    case "yes":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "no":
      return "bg-red-50 text-red-700 border-red-100";
    case "abstain":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

// ─── Page ────────────────────────────────────────────────────

export default async function DashboardPoliticianPage({ params }: PoliticianPageProps) {
  const { id } = await params;
  const politician = getPoliticianById(id);
  if (!politician) notFound();

  const institutions = getAllInstitutions();
  const getInstitutionName = (instId: string) =>
    institutions.find((i) => i.id === instId)?.short_name ?? "Legislatura";

  const currentRole = politician.current_role;
  const mandateEnd = currentRole?.ended_at
    ? new Date(currentRole.ended_at).getFullYear()
    : new Date().getFullYear() + 2;

  // Calculate metrics
  const totalVotes = politician.votes.length;
  const yesVotes = politician.votes.filter((v) => v.position === "yes").length;
  const noVotes = politician.votes.filter((v) => v.position === "no").length;
  const abstainVotes = politician.votes.filter((v) => v.position === "abstain").length;
  const absentVotes = politician.votes.filter((v) => v.position === "absent").length;

  const attendanceRate = totalVotes > 0 ? Math.round(((totalVotes - absentVotes) / totalVotes) * 100) : 0;
  const participationRate = totalVotes > 0 ? Math.round(((yesVotes + noVotes) / totalVotes) * 100) : 0;
  const debateRate = politician.activity_score > 0 ? Math.round(politician.activity_score * 100) : 0;

  // Mock data for additional metrics
  const mockBills = {
    introduced: Math.floor(Math.random() * 15) + 3,
    coAuthored: Math.floor(Math.random() * 25) + 8,
    approved: Math.floor(Math.random() * 8) + 1,
  };

  const mockCommittees = [
    "Comisión de Presupuesto y Hacienda",
    "Comisión de Asuntos Constitucionales",
    "Comisión de Derechos Humanos",
  ];

  const partyAlignment = Math.floor(Math.random() * 20) + 75; // 75-95%
  const govAlignment = Math.floor(Math.random() * 40) + 40; // 40-80%

  // DJ mock data
  const djData = {
    yearPrev: 2022,
    yearCurr: 2023,
    prev: Math.floor(Math.random() * 40 + 15) * 1_000_000,
    curr: Math.floor(Math.random() * 60 + 25) * 1_000_000,
  };
  const djDiff = djData.curr - djData.prev;
  const djPct = ((djDiff / djData.prev) * 100).toFixed(1);

  // Mock companies
  const mockCompanies = [
    { name: "Inversiones Patagónicas S.A.", role: "Accionista minoritario", since: "2018" },
    { name: "Consultora Estratégica Norte", role: "Socio", since: "2020" },
  ];

  // Recent votes (last 8)
  const recentVotes = [...politician.votes]
    .sort((a, b) => new Date(b.vote.voted_at).getTime() - new Date(a.vote.voted_at).getTime())
    .slice(0, 8);

  // Top topics from consistency scores (topics the politician is scored on)
  const topTopics = politician.consistency_by_topic
    .filter((ct) => ct.topic_id !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((ct) => ({
      name: ct.policy_area || "General",
      score: Math.round(ct.score * 100),
    }));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/politicians" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Legisladores
        </Link>
        <span>/</span>
        <span className="text-pure-black">Perfil</span>
      </nav>

      {/* ═══════════════════════════════════════════════════
          PROFILE HEADER
          ═══════════════════════════════════════════════════ */}
      <section className="glass-card-dash rounded-3xl p-8 mb-8 border border-black/5">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo */}
          <div className="relative w-32 h-40 rounded-2xl overflow-hidden bg-gray-100 ring-4 ring-white shadow-xl shrink-0">
            <Image src={politician.photo_url} alt={politician.full_name} fill className="object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Party badge */}
            <div className="flex items-center gap-3 mb-3">
              {politician.party && (
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full text-white"
                  style={{ backgroundColor: politician.party.color_hex || "#666" }}
                >
                  {politician.party.short_name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Mandato activo
              </span>
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-pure-black mb-2">
              {politician.full_name}
            </h1>

            {/* Role & Location */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Gavel className="w-4 h-4" />
                {currentRole?.role_title || "Legislador"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {politician.province}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Mandato {currentRole ? formatYear(currentRole.started_at) : "—"}–{mandateEnd}
              </span>
            </div>

            {/* Main Commission */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 max-w-md">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                <span className="font-medium">Comisión principal:</span> {mockCommittees[0]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 shrink-0">
            <button className="flex items-center gap-2 px-6 py-3 bg-pure-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              Seguir
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-black/10 text-pure-black rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Reporte
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          KEY PERFORMANCE METRICS (6 indicators)
          ═══════════════════════════════════════════════════ */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Métricas de Desempeño
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Attendance */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Asistencia</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{attendanceRate}%</p>
            <p className="text-xs mt-1 text-gray-400">A sesiones</p>
          </div>

          {/* 2. Vote Participation */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Votaciones</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{participationRate}%</p>
            <p className="text-xs mt-1 text-gray-400">Votos emitidos</p>
          </div>

          {/* 3. Debate Participation */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Debate</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{debateRate}%</p>
            <p className="text-xs mt-1 text-gray-400">Intervenciones</p>
          </div>

          {/* 4. Party Alignment */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Bloque</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{partyAlignment}%</p>
            <p className="text-xs mt-1 text-gray-400">Alineación</p>
          </div>

          {/* 5. Government Alignment */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Gobierno</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{govAlignment}%</p>
            <p className="text-xs mt-1 text-gray-400">Coincidencia</p>
          </div>

          {/* 6. Legislative Activity */}
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Actividad</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{mockBills.introduced}</p>
            <p className="text-xs mt-1 text-gray-400">Proyectos propios</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ═══════════════════════════════════════════════════
            LEFT COLUMN (2/3 width)
            ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-8">

          {/* ── LEGISLATIVE ACTIVITY ─────────────────────────── */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-6">Actividad Legislativa</h2>

            {/* Bills stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-2xl font-mono font-semibold text-blue-700">{mockBills.introduced}</p>
                <p className="text-xs text-blue-600 mt-1">Proyectos presentados</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                <p className="text-2xl font-mono font-semibold text-purple-700">{mockBills.coAuthored}</p>
                <p className="text-xs text-purple-600 mt-1">Proyectos co-firmados</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <p className="text-2xl font-mono font-semibold text-emerald-700">{mockBills.approved}</p>
                <p className="text-xs text-emerald-600 mt-1">Proyectos aprobados</p>
              </div>
            </div>

            {/* Committees */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Comisiones donde participa:</p>
              {mockCommittees.map((committee, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-black/5">
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">groups</span>
                  <span className="text-sm text-gray-700">{committee}</span>
                  {i === 0 && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Titular
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── VOTING RECORD ───────────────────────────────── */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-pure-black">Historial de Votaciones</h2>
              <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Ver todo →
              </Link>
            </div>

            <div className="space-y-3">
              {recentVotes.length > 0 ? (
                recentVotes.map((vote) => (
                  <div
                    key={vote.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-black/5 hover:bg-white/60 transition-colors"
                  >
                    {/* Vote icon */}
                    <div className={`p-2 rounded-lg ${getVoteStyle(vote.position)}`}>
                      {getVoteIcon(vote.position)}
                    </div>

                    {/* Vote details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pure-black line-clamp-1">{vote.vote.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">{formatDate(vote.vote.voted_at)}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          Bloque: {vote.position === "yes" ? "A favor" : vote.position === "no" ? "En contra" : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Result badge */}
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                        vote.vote.result === "passed"
                          ? "bg-emerald-100 text-emerald-700"
                          : vote.vote.result === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {vote.vote.result === "passed" ? "Aprobado" : vote.vote.result === "rejected" ? "Rechazado" : "En debate"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No hay votaciones registradas</p>
              )}
            </div>
          </section>

          {/* ── SPEECH AND DISCOURSE ANALYSIS ──────────────── */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-6">Análisis de Discurso</h2>

            {/* Top topics */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">Temas con mayor coherencia:</p>
              <div className="flex flex-wrap gap-2">
                {topTopics.length > 0 ? (
                  topTopics.map((topic) => (
                    <span
                      key={topic.name}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                    >
                      {topic.name} ({topic.score}%)
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">Sin datos de temas</span>
                )}
              </div>
            </div>

            {/* Interventions count */}
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <Mic className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-lg font-semibold text-amber-800">{politician.speeches.length} intervenciones</p>
                <p className="text-xs text-amber-600">En sesiones del período</p>
              </div>
            </div>

            {/* Sample quotes */}
            {politician.speeches.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-gray-600">Extractos recientes:</p>
                {politician.speeches.slice(0, 2).map((speech, i) => (
                  <blockquote key={speech.id} className="p-4 border-l-4 border-gray-200 bg-gray-50/50 rounded-r-xl">
                    <p className="text-sm text-gray-700 italic line-clamp-2">"{speech.transcript.slice(0, 120)}..."</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400">{formatDate(speech.created_at)}</span>
                      <Link
                        href="#"
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver transcript →
                      </Link>
                    </div>
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════
            RIGHT COLUMN (1/3 width) - Transparency
            ═══════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── TRANSPARENCY AND INTERESTS ─────────────────── */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-6">Transparencia</h2>

            {/* Declared Assets */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-3">Patrimonio Declarado</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-black/5">
                  <p className="text-xs text-gray-400">{djData.yearPrev}</p>
                  <p className="text-lg font-mono font-semibold text-pure-black">{formatCurrency(djData.prev)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-black/5">
                  <p className="text-xs text-gray-400">{djData.yearCurr}</p>
                  <p className="text-lg font-mono font-semibold text-pure-black">{formatCurrency(djData.curr)}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 p-3 rounded-xl ${
                  djDiff >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"
                }`}
              >
                {djDiff >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${djDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {djDiff >= 0 ? "+" : ""}
                  {djPct}% variación
                </span>
              </div>
            </div>

            {/* Companies */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-3">Vínculos Societarios</p>
              <div className="space-y-3">
                {mockCompanies.map((company, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-black/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-pure-black">{company.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span>{company.role}</span>
                      <span>·</span>
                      <span>Desde {company.since}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other roles */}
            <div className="mt-6 pt-6 border-t border-black/5">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-3">Otros Roles Públicos</p>
              <div className="p-3 bg-gray-50 rounded-xl border border-black/5">
                <p className="text-sm text-gray-700">Sin otros roles públicos declarados</p>
                <p className="text-[10px] text-gray-400 mt-1">Fuente: DJI - Declaración Jurada de Intereses</p>
              </div>
            </div>
          </section>

          {/* Consistency Score Card */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h3 className="font-serif text-lg font-medium text-pure-black mb-4">Coherencia Discurso-Voto</h3>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border-4 border-emerald-200 mb-3">
                <span className="text-3xl font-mono font-bold text-emerald-700">{politician.consistency_score}</span>
              </div>
              <p className="text-sm text-gray-600">Score sobre 10</p>
              <p className="text-xs text-gray-400 mt-1">{politician.contradictions.length} contradicciones detectadas</p>
            </div>
          </section>

          {/* Back link */}
          <Link
            href="/dashboard/politicians"
            className="flex items-center justify-center gap-2 w-full p-4 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Legisladores
          </Link>
        </div>
      </div>
    </div>
  );
}
