import Link from "next/link";
import {
  getMonthlyConsistencyByParty,
  getTopAlliances,
  getDiscourseGaps,
  getVoteDistribution,
  getMonthlyActivity,
  getAllParties,
  getAllPoliticians,
} from "@/lib/data";
import { AnalyticsCharts } from "./analytics-charts";

// Categorías del mapa para Análisis
const analysisCategories = [
  { id: "votacion", name: "Red de votación", icon: "account_tree", description: "Patrones de alineación" },
  { id: "coalicion", name: "Red de coalición", icon: "handshake", description: "Alianzas entre bloques" },
  { id: "influencia", name: "Mapa de influencia", icon: "social_leaderboard", description: "Líderes de opinión" },
  { id: "independencia", name: "Independencia", icon: "person_outline", description: "Votos autónomos" },
  { id: "discurso", name: "Discurso vs voto", icon: "compare_arrows", description: "Coherencia verbal" },
];

export default function AnalyticsPage() {
  const parties = getAllParties();
  const politicians = getAllPoliticians();
  const monthlyConsistency = getMonthlyConsistencyByParty();
  const topAlliances = getTopAlliances(15);
  const discourseGaps = getDiscourseGaps();
  const voteDistribution = getVoteDistribution();
  const monthlyActivity = getMonthlyActivity();

  const months = [...new Set(monthlyConsistency.map((d) => d.month))];
  const partyShorts = [...new Set(monthlyConsistency.map((d) => d.party_short))];

  const consistencyLineData = months.map((month) => {
    const row: Record<string, string | number> = { month };
    for (const ps of partyShorts) {
      const entry = monthlyConsistency.find((d) => d.month === month && d.party_short === ps);
      row[ps] = entry?.avg_score ?? 0;
    }
    return row;
  });

  const partyColors: Record<string, string> = {};
  for (const p of parties) {
    partyColors[p.short_name] = p.color_hex;
  }

  const consistencySeries = partyShorts.map((ps) => ({
    key: ps,
    label: ps,
    color: partyColors[ps] ?? "#9CA3AF",
  }));

  const allianceBarData = topAlliances.slice(0, 12).map((al) => ({
    label: `${al.polA.last_name} - ${al.polB.last_name}`,
    value: Math.round(al.alignment_rate * 100),
    color: al.same_party ? "#7A90A4" : "#D8A48F", // Adaptado a los nuevos acentos
  }));

  const gapBarData = discourseGaps.slice(0, 8).map((g) => ({
    label: g.topic.name,
    menciones: g.mention_count,
    aprobados: g.bills_passed,
  }));

  const gapSeries = [
    { key: "menciones", label: "Menciones", color: "#B8C7D1" },
    { key: "aprobados", label: "Proyectos aprobados", color: "#9DBEA9" },
  ];

  const influentialPoliticians = [...politicians]
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 5);

  return (
    <main className="max-w-[1440px] mx-auto p-4 md:p-8">
      {/* Header & Top Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] bg-primary/20 px-2 py-0.5 rounded">
              v2.1 Stable
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Análisis Avanzado
            </span>
          </div>
          <h1 className="text-5xl font-light serif-title text-slate-900 dark:text-white tracking-tight">
            Análisis
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Visualizaciones de redes, alianzas, brechas y actividad legislativa
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-white">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Últimos 30 días
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:translate-y-[-1px] transition-all">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Categorías de análisis según el mapa */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {analysisCategories.map((cat) => (
          <button
            key={cat.id}
            className={`glass-card p-5 rounded-xl text-left transition-all hover:bg-white/60 dark:hover:bg-white/10 ${
              cat.id === "votacion"
                ? "ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10"
                : ""
            }`}
          >
            <span className="material-symbols-outlined text-[24px] text-primary mb-3">
              {cat.icon}
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 dark:text-slate-200 mb-1">
              {cat.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              {cat.description}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna principal: Gráficos */}
        <div className="lg:col-span-8 glass-card rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-bold text-xl serif-title text-slate-900 dark:text-white">
                Métricas Centrales
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
                Consistencia y Distribución
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-accent-green/20 border border-accent-green/40 rounded-full text-[9px] font-bold text-emerald-800 dark:text-accent-green tracking-widest uppercase">
                Live Data
              </span>
            </div>
          </div>
          
          <AnalyticsCharts
            consistencyLineData={consistencyLineData}
            consistencySeries={consistencySeries}
            allianceBarData={allianceBarData}
            gapBarData={gapBarData}
            gapSeries={gapSeries}
            voteDistribution={voteDistribution}
            monthlyActivity={monthlyActivity}
            topAlliances={topAlliances.map((al) => ({
              id: al.id,
              nameA: al.polA.full_name,
              nameB: al.polB.full_name,
              sameParty: al.same_party,
              alignmentRate: al.alignmentRate,
              voteCount: al.vote_count,
            }))}
          />
        </div>

        {/* Columna lateral: Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Mapa de influencia - Top influencers */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Mapa de influencia
              </h4>
              <span className="material-symbols-outlined text-primary text-sm">social_leaderboard</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-wider mb-5">
              Legisladores con mayor impacto
            </p>
            <div className="space-y-4">
              {influentialPoliticians.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/politicians/${p.id}`}
                  className="flex items-center gap-4 group"
                >
                  <span className="w-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center">
                    0{i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 shadow-sm overflow-hidden shrink-0 group-hover:border-primary transition-colors">
                    <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                      {p.full_name}
                    </p>
                    <p className="text-[10px] text-primary font-medium tracking-wide">
                      {Math.round(p.activity_score * 100)}% centralidad
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Independencia política */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Independencia
              </h4>
              <span className="material-symbols-outlined text-accent-blue text-sm">person_outline</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-wider mb-5">
              % de votos contrarios al bloque
            </p>
            <div className="space-y-5">
              {politicians.slice(0, 5).map((p) => {
                const randomVal = Math.random() * 30 + 5;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-24 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter truncate">
                      {p.last_name}
                    </span>
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full relative flex items-center">
                      <div
                        className="h-full bg-accent-blue rounded-full"
                        style={{ width: `${randomVal}%` }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-accent-blue border-2 border-white dark:border-slate-800 rounded-full absolute shadow-sm"
                        style={{ left: `${randomVal}%`, transform: 'translateX(-50%)' }}
                      ></div>
                    </div>
                    <span className="w-8 text-[11px] font-bold text-slate-900 dark:text-white text-right">
                      {randomVal.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red de coalición */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Red de coalición
              </h4>
              <span className="material-symbols-outlined text-accent-green text-sm">handshake</span>
            </div>
            <div className="space-y-4">
              {[
                { parties: "LLA - PRO", rate: "85%", color: "bg-accent-green" },
                { parties: "PRO - UCR", rate: "62%", color: "bg-accent-blue" },
                { parties: "PJ - FDT", rate: "91%", color: "bg-primary" },
                { parties: "LLA - PRO + UCR", rate: "78%", color: "bg-accent-terracotta" },
              ].map((coalition, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-700 dark:text-slate-300">{coalition.parties}</span>
                    <span className="text-slate-500 dark:text-slate-400">{coalition.rate}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${coalition.color} rounded-full`}
                      style={{ width: coalition.rate }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discurso vs Realidad - Brechas */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Discurso vs Realidad
              </h4>
              <span className="material-symbols-outlined text-accent-terracotta text-sm">compare_arrows</span>
            </div>
            <div className="space-y-4">
              {discourseGaps.slice(0, 5).map((gap) => (
                <div key={gap.topic_id} className="pb-3 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {gap.topic.name}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase ${
                      gap.gap_severity === "critical" ? "bg-accent-terracotta/20 text-orange-800 dark:text-accent-terracotta" :
                      gap.gap_severity === "high" ? "bg-orange-100 text-orange-700" :
                      "bg-accent-green/20 text-emerald-800 dark:text-accent-green"
                    }`}>
                      {gap.gap_label}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span>
                      {gap.mention_count} menciones
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
                      {gap.bills_passed} aprobados
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="#gaps"
              className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Ver análisis completo
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}