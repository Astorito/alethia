import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPoliticianById, getAllInstitutions, getPoliticiansByTopic } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { Contradiction, ConsistencyScore } from "@/lib/types";
import { ShareCard } from "@/components/profile/share-card";
import { PoliticianRadarChart, VoteDistributionChart } from "@/components/profile/politician-charts";

interface PoliticianPageProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ────────────────────────────────────────────────

function getPresenciaLabel(score: number) {
  if (score >= 0.8) return "+ Alta";
  if (score >= 0.6) return "Media";
  return "Baja";
}

function getPresenciaColor(score: number) {
  if (score >= 0.8) return "text-muted-green";
  if (score >= 0.6) return "text-muted-gold";
  return "text-muted-red";
}

function getGradeColor(grade: string) {
  if (grade.startsWith("A")) return "text-muted-green";
  if (grade.startsWith("B")) return "text-muted-gold";
  return "text-muted-red";
}

function getContradictionBadge(severity: string) {
  switch (severity) {
    case "critical":
    case "high":
      return {
        label: "FLIP-FLOP DETECTADO",
        style: "bg-orange-100/60 text-orange-600/90 border border-orange-200/50",
        dot: "bg-orange-400",
        icon: "warning",
      };
    case "medium":
      return {
        label: "CAMBIO DE POSTURA LEVE",
        style: "bg-yellow-100/60 text-yellow-600/90 border border-yellow-200/50",
        dot: "bg-yellow-400",
        icon: "swap_horiz",
      };
    default:
      return {
        label: "CONSISTENTE",
        style: "bg-green-100/60 text-green-600/90 border border-green-200/50",
        dot: "bg-green-400",
        icon: "check_circle",
      };
  }
}

function formatYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

// ─── Section Component ───────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-medium text-pure-black">{title}</h2>
        {subtitle && <span className="text-[10px] uppercase tracking-widest text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default async function DashboardPoliticianPage({ params }: PoliticianPageProps) {
  const { id } = await params;
  const politician = getPoliticianById(id);
  if (!politician) notFound();

  const institutions = getAllInstitutions();
  const getInstitutionName = (instId: string) =>
    institutions.find((i) => i.id === instId)?.short_name ?? "Legislatura";

  const presencia = Math.round(politician.activity_score * 100);
  const presenciaLabel = getPresenciaLabel(politician.activity_score);
  const presenciaColor = getPresenciaColor(politician.activity_score);

  const sortedRoles = [...politician.roles].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  const sortedContradictions = [...politician.contradictions].sort(
    (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
  );

  // Top 5 temas por score
  const topTopics = [...politician.consistency_by_topic]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const lastVote = politician.votes
    .sort((a, b) => new Date(b.vote.voted_at).getTime() - new Date(a.vote.voted_at).getTime())[0];

  const currentRole = politician.current_role;

  // Extra mock data
  const attendancePct = Math.round(politician.activity_score * 100);
  const advisorCount = Math.floor(politician.activity_score * 12) + 3; // mock 3-15
  const djData = {
    yearPrev: 2022,
    yearCurr: 2023,
    prev: Math.floor(Math.random() * 50 + 20) * 1_000_000,
    curr: Math.floor(Math.random() * 80 + 30) * 1_000_000,
  };
  const djDiff = djData.curr - djData.prev;
  const djPct = ((djDiff / djData.prev) * 100).toFixed(1);
  const mandateEnd = currentRole?.ended_at
    ? new Date(currentRole.ended_at).getFullYear()
    : new Date().getFullYear() + 2;

  // Votes distribution
  const yesVotes = politician.votes.filter((v) => v.position === "yes").length;
  const noVotes = politician.votes.filter((v) => v.position === "no").length;
  const abstainVotes = politician.votes.filter((v) => v.position === "abstain").length;
  const absentVotes = politician.votes.filter((v) => v.position === "absent").length;

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-6xl mx-auto">
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <nav className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
        <Link href="/dashboard/politicians" className="hover:text-gray-600 transition-colors">
          Legisladores
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span>
          {currentRole?.role_title?.includes("Senador") ? "Senado" : "Cámara de Diputados"}
        </span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-pure-black">Perfil</span>
      </nav>

      {/* ── 1. Información Básica ───────────────────────────── */}
      <div className="glass-card-dash rounded-2xl p-6 md:p-8 border border-black/5">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Photo */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-black/10 shrink-0">
            <Image
              src={politician.photo_url}
              alt={politician.full_name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {politician.party && (
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: politician.party.color_hex }}
                />
              )}
              {politician.party && (
                <span className="text-xs text-gray-500 font-medium">
                  {politician.party.name}
                </span>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{politician.province}</span>
              {currentRole && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    Mandato {formatYear(currentRole.started_at)}–{mandateEnd}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-pure-black font-semibold tracking-tight">
              {politician.full_name}
            </h1>
            {currentRole && (
              <p className="text-sm text-gray-500 mt-0.5">
                {currentRole.role_title} · {getInstitutionName(currentRole.institution_id)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-pure-black text-warm-white text-sm font-medium rounded-full hover:bg-black/80 transition-all">
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              Seguir
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/60 text-pure-black text-sm font-medium rounded-full border border-black/10 hover:bg-white/80 transition-all">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Reporte
            </button>
          </div>
        </div>

        {/* Stats bar - Información resumida */}
        <div className="mt-6 pt-6 border-t border-black/5 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Edad</p>
            <p className="text-2xl font-mono font-semibold text-pure-black leading-none">
              {politician.birth_date ? new Date().getFullYear() - new Date(politician.birth_date).getFullYear() : "—"}
            </p>
            <p className="text-xs mt-1 text-gray-400">Años</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Provincia</p>
            <p className="text-lg font-semibold text-pure-black leading-none">
              {politician.province}
            </p>
            <p className="text-xs mt-1 text-gray-400">Distrito electoral</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Bloque</p>
            <p className="text-lg font-semibold text-pure-black leading-none truncate">
              {politician.party?.short_name || "Sin bloque"}
            </p>
            <p className="text-xs mt-1 text-gray-400">Alineación partidaria</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Antigüedad</p>
            <p className="text-lg font-semibold text-pure-black leading-none">
              {sortedRoles.length > 0 ? `${new Date().getFullYear() - formatYear(sortedRoles[0].started_at)} años` : "—"}
            </p>
            <p className="text-xs mt-1 text-gray-400">En el cargo</p>
          </div>
        </div>
      </div>

      {/* ── 2. Actividad ─────────────────────────────────────── */}
      <Section title="Actividad" subtitle="Presencia y participación" id="actividad">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">how_to_vote</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Presencia</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black leading-none">
              {presencia}%
            </p>
            <p className={`text-xs mt-2 font-medium ${presenciaColor}`}>{presenciaLabel}</p>
          </div>

          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">event_available</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Asistencia</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black leading-none">
              {attendancePct}%
            </p>
            <p className="text-xs mt-2 text-gray-400">Sesiones asistidas</p>
          </div>

          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">record_voice_over</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Intervenciones</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black leading-none">
              {politician.speeches.length}
            </p>
            <p className="text-xs mt-2 text-gray-400">Discursos registrados</p>
          </div>

          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">description</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Proyectos</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black leading-none">
              —
            </p>
            <p className="text-xs mt-2 text-gray-400">En desarrollo</p>
          </div>

          <div className="glass-card-dash p-5 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">badge</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Asesores</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black leading-none">
              {advisorCount}
            </p>
            <p className="text-xs mt-2 text-gray-400">Planta de asesores</p>
          </div>
        </div>
      </Section>

      {/* ── Declaración Jurada ──────────────────────────────── */}
      <Section title="Declaración Jurada Patrimonial" subtitle="Variación anual · OA" id="dj">
        <div className="glass-card-dash rounded-2xl p-6 border border-black/5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-xl bg-gray-50/60 border border-black/5">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{djData.yearPrev}</p>
              <p className="text-2xl font-mono font-semibold text-pure-black">
                ${(djData.prev / 1_000_000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-400 mt-1">Patrimonio declarado</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/60 border border-black/5">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{djData.yearCurr}</p>
              <p className="text-2xl font-mono font-semibold text-pure-black">
                ${(djData.curr / 1_000_000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-400 mt-1">Patrimonio declarado</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-xl ${djDiff >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
            <span className={`material-symbols-outlined text-[22px] ${djDiff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {djDiff >= 0 ? "trending_up" : "trending_down"}
            </span>
            <div>
              <p className={`font-semibold ${djDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {djDiff >= 0 ? "+" : ""}{djPct}% variación interanual
              </p>
              <p className="text-xs text-gray-500">
                Período {djData.yearPrev}–{djData.yearCurr} · Fuente: Oficina Anticorrupción
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 3. Proyectos y Votaciones ───────────────────────── */}
      <Section title="Proyectos y Votaciones" subtitle="Historial de votos" id="proyectos">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <h3 className="text-sm font-semibold text-pure-black mb-1">Distribución de votos</h3>
            <p className="text-[11px] text-gray-400 mb-4">
              {politician.votes.length} votaciones registradas
            </p>
            {politician.votes.length > 0 ? (
              <VoteDistributionChart yes={yesVotes} no={noVotes} abstain={abstainVotes} absent={absentVotes} />
            ) : (
              <p className="text-sm text-gray-400">Sin datos de votación</p>
            )}
          </div>

          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <h3 className="text-sm font-semibold text-pure-black mb-4">Últimas votaciones</h3>
            <div className="space-y-3">
              {politician.votes.slice(0, 5).map((vote) => (
                <div key={vote.id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-pure-black truncate">{vote.vote.title}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(vote.vote.voted_at)}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    vote.position === "yes" ? "bg-emerald-100 text-emerald-700" :
                    vote.position === "no" ? "bg-red-100 text-red-700" :
                    vote.position === "abstain" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {vote.position === "yes" ? "A FAVOR" :
                     vote.position === "no" ? "EN CONTRA" :
                     vote.position === "abstain" ? "ABSTENCIÓN" : "AUSENTE"}
                  </span>
                </div>
              ))}
              {politician.votes.length === 0 && (
                <p className="text-sm text-gray-400">No hay votaciones registradas</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. Comisiones ───────────────────────────────────── */}
      <Section title="Comisiones" subtitle="Participación en órganos deliberativos" id="comisiones">
        <div className="glass-card-dash p-6 rounded-2xl border border-black/5 text-center py-8">
          <span className="material-symbols-outlined text-gray-300 text-4xl mb-3 block">groups</span>
          <p className="text-sm text-gray-500">Información de comisiones en desarrollo</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Se mostrarán las comisiones en las que participa este legislador
          </p>
        </div>
      </Section>

      {/* ── 5. Alineación Política ──────────────────────────── */}
      <Section title="Alineación Política" subtitle="Coherencia por temática" id="alineacion">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-muted-gold text-[20px]">smart_toy</span>
              <h3 className="text-sm font-semibold text-pure-black">Análisis IA</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              El sistema ha detectado{" "}
              <span className="font-semibold text-pure-black">
                {politician.contradictions.length} contradiccion
                {politician.contradictions.length !== 1 ? "es" : ""} significativa
                {politician.contradictions.length !== 1 ? "s" : ""}
              </span>{" "}
              entre discursos y votos.
            </p>
            <div className="flex items-center justify-between py-3 border-t border-black/5">
              <span className="text-xs text-gray-400">Score de coherencia</span>
              <span className={`text-lg font-mono font-semibold ${getGradeColor(politician.consistency_grade)}`}>
                {politician.consistency_score}/10
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Última actualización: Hoy
            </p>
          </div>

          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <h3 className="text-sm font-semibold text-pure-black mb-1">Coherencia por tema</h3>
            <p className="text-[11px] text-gray-400 mb-4">Perfil multidimensional</p>
            {topTopics.length > 0 ? (
              <>
                <PoliticianRadarChart topics={topTopics} />
                <div className="mt-4 space-y-2">
                  {topTopics.map((t) => (
                    <div key={t.id} className="flex justify-between items-center py-1 border-b border-black/4 last:border-0">
                      <span className="text-sm text-gray-600">{t.policy_area ?? "General"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">{t.score.toFixed(1)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          t.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700" :
                          t.grade.startsWith("B") ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{t.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Sin datos de coherencia por tema</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── 6. Historial de Votación ────────────────────────── */}
      <Section title="Historial de Votación" subtitle="Contradicciones detectadas" id="historial">
        <div className="space-y-4">
          {sortedContradictions.length === 0 ? (
            <div className="glass-card-dash rounded-2xl p-6 border border-black/5 text-center py-12">
              <span className="material-symbols-outlined text-muted-green text-4xl mb-3 block">verified</span>
              <p className="text-sm text-gray-500">No se detectaron contradicciones significativas.</p>
            </div>
          ) : (
            sortedContradictions.map((c) => {
              const badge = getContradictionBadge(c.severity);
              const voteLabel =
                c.vote_position === "yes"
                  ? "AFIRMATIVO"
                  : c.vote_position === "no"
                    ? "EN CONTRA"
                    : c.vote_position.toUpperCase();

              return (
                <div
                  key={c.id}
                  className="glass-card-dash rounded-2xl p-5 border border-black/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {formatDate(c.detected_at)}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-pure-black mb-2 leading-snug">
                    {c.description}
                  </h4>

                  {(c.severity === "high" || c.severity === "critical") && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-white/50 rounded-xl p-3 border border-black/5">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Declaración pública</p>
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          &ldquo;{c.speech_stance}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] text-gray-400">Voto:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.vote_position === "yes" ? "bg-emerald-100 text-emerald-700" :
                          c.vote_position === "no" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {voteLabel}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Section>

      {/* ── 7. Patrimonio ───────────────────────────────────── */}
      <Section title="Patrimonio" subtitle="Declaraciones juradas" id="patrimonio">
        <div className="glass-card-dash p-6 rounded-2xl border border-black/5 text-center py-8">
          <span className="material-symbols-outlined text-gray-300 text-4xl mb-3 block">account_balance_wallet</span>
          <p className="text-sm text-gray-500">Información de patrimonio en desarrollo</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Se mostrarán las declaraciones juradas de bienes de este legislador
          </p>
        </div>
      </Section>

      {/* ── 8. Empresas ─────────────────────────────────────── */}
      <Section title="Empresas" subtitle="Vínculos societarios" id="empresas">
        <div className="glass-card-dash p-6 rounded-2xl border border-black/5 text-center py-8">
          <span className="material-symbols-outlined text-gray-300 text-4xl mb-3 block">business</span>
          <p className="text-sm text-gray-500">Información empresarial en desarrollo</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Se mostrarán los vínculos societarios de este legislador
          </p>
        </div>
      </Section>

      {/* ── 9. Redes Políticas ───────────────────────────────── */}
      <Section title="Redes Políticas" subtitle="Trayectoria y conexiones" id="redes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRoles.map((role) => {
            const isPresent = role.ended_at === null;
            const instName = getInstitutionName(role.institution_id);
            return (
              <div
                key={role.id}
                className={`glass-card-dash rounded-2xl p-5 border relative overflow-hidden ${
                  isPresent ? "border-black/10" : "border-black/5"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`w-2 h-2 rounded-full ${isPresent ? "bg-pure-black" : "bg-gray-300"}`}
                    />
                    <span className="text-[11px] font-mono text-gray-500">
                      {formatYear(role.started_at)} –{" "}
                      {isPresent ? "PRESENTE" : formatYear(role.ended_at!)}
                    </span>
                    {isPresent && (
                      <span className="ml-auto text-[9px] uppercase tracking-widest font-bold text-pure-black bg-black/5 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-semibold text-pure-black mb-1">
                    {role.role_title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{instName}</p>
                  {role.district && (
                    <p className="text-[10px] text-gray-400">Distrito: {role.district}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Share Card ─────────────────────────────────────── */}
      <ShareCard politician={politician} />
    </div>
  );
}
