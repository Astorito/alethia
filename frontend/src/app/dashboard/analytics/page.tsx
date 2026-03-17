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
    color: al.same_party ? "#7A90A4" : "#D8A48F",
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

  // Derived KPIs from real data
  const avgActivityScore = politicians.length
    ? politicians.reduce((sum, p) => sum + p.activity_score, 0) / politicians.length
    : 0;
  const activePoliticians = politicians.length;
  const avgConsistency =
    monthlyConsistency.length
      ? monthlyConsistency.reduce((sum, d) => sum + d.avg_score, 0) / monthlyConsistency.length
      : 0;
  const topAllianceRate = topAlliances[0]?.alignment_rate ?? 0;

  // Anomaly log: reuse discourse gaps with high severity as "anomalies"
  const anomalyLog = discourseGaps
    .filter((g) => g.gap_severity === "critical" || g.gap_severity === "high")
    .slice(0, 5)
    .map((g, i) => ({
      timestamp: `2024-10-24 ${14 + i}:${String(i * 7 + 5).padStart(2, "0")}`,
      metric: g.topic.name,
      deviation: g.gap_severity === "critical" ? "+2.4σ" : "-1.2σ",
      description:
        g.gap_severity === "critical"
          ? `Brecha crítica: ${g.mention_count} menciones vs ${g.bills_passed} aprobados.`
          : `Latencia detectada en sector ${g.topic.name.toLowerCase()}.`,
      status: g.gap_severity === "critical" ? "critical" : "pending",
    }));

  return (
    <main className="max-w-[1440px] mx-auto p-4 md:p-8">
      {/* ── Header & Top Actions ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] bg-primary/20 px-2 py-0.5 rounded">
              v2.1 Stable
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Variación de Enfoque Métrico
            </span>
          </div>
          <h1 className="text-5xl font-light serif-title text-slate-900 dark:text-white tracking-tight">
            Análisis
          </h1>
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

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">

        {/* KPI 1 — Impacto Editorial (avg activity score) */}
        <div className="md:col-span-2 lg:col-span-3 glass-card rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="p-2.5 bg-accent-green/20 rounded-xl text-emerald-600 dark:text-accent-green">
                <span className="material-symbols-outlined">auto_graph</span>
              </span>
              <span className="text-emerald-600 dark:text-accent-green text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span> +1.2%
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
              Impacto Editorial
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-light text-slate-900 dark:text-white">
                {(avgActivityScore * 10).toFixed(1)}
              </h3>
              <span className="text-slate-500 text-lg font-light">/10</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full"
                style={{ width: `${Math.min(avgActivityScore * 100, 100)}%` }}
              />
            </div>
            <p className="text-[9px] mt-3 text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Fórmula: (Volumen * Centralidad) / Dispersión
            </p>
          </div>
        </div>

        {/* KPI 2 — Legisladores Activos */}
        <div className="md:col-span-2 lg:col-span-3 glass-card rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="p-2.5 bg-accent-terracotta/20 rounded-xl text-orange-700 dark:text-accent-terracotta">
                <span className="material-symbols-outlined">groups</span>
              </span>
              <span className="text-orange-700 dark:text-accent-terracotta text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_down</span> -3%
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
              Legisladores Activos
            </p>
            <h3 className="text-5xl font-light text-slate-900 dark:text-white">
              {activePoliticians}
            </h3>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
              <span className="text-slate-500 dark:text-slate-400">
                Objetivo: {Math.ceil(activePoliticians * 1.03)}
              </span>
              <span className="text-orange-700 dark:text-accent-terracotta/90">
                Déficit: {Math.ceil(activePoliticians * 0.03)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3 — Índice Centralidad (avg consistency) */}
        <div className="md:col-span-2 lg:col-span-3 glass-card rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="p-2.5 bg-accent-blue/30 rounded-xl text-primary font-bold">
                <span className="material-symbols-outlined">hub</span>
              </span>
              <span className="text-emerald-600 dark:text-accent-green text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span> +0.05%
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
              Índice Centralidad
            </p>
            <h3 className="text-5xl font-light text-slate-900 dark:text-white">
              {(avgConsistency / 10).toFixed(2)}
            </h3>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-accent-blue shadow-sm" />
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-accent-green shadow-sm" />
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-accent-terracotta shadow-sm" />
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                Nodos Estables
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4 — Eficiencia Promedio (top alliance rate) */}
        <div className="md:col-span-2 lg:col-span-3 glass-card rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="p-2.5 bg-slate-200 dark:bg-white/10 rounded-xl text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">speed</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_down</span> -0.8%
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
              Eficiencia Promedio
            </p>
            <h3 className="text-5xl font-light text-slate-900 dark:text-white">
              {Math.round(topAllianceRate * 100)}%
            </h3>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic uppercase tracking-wider">
              Detección de latencia: +12min vs histórico.
            </p>
          </div>
        </div>

        {/* ── Columna principal: Gráficos (8 cols) ── */}
        <div className="lg:col-span-8 glass-card rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-bold text-xl serif-title text-slate-900 dark:text-white">
                Flujo de Influencia Editorial
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
                Análisis de transferencia: De Fuentes a Legislación
              </p>
            </div>
            <span className="px-3 py-1 bg-accent-green/20 border border-accent-green/40 rounded-full text-[9px] font-bold text-emerald-800 dark:text-accent-green tracking-widest uppercase">
              Live Data
            </span>
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
              alignmentRate: al.alignment_rate,
              voteCount: al.vote_count,
            }))}
          />
        </div>

        {/* ── Sidebar (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Mapa de influencia */}
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
                    <img
                      src={p.photo_url}
                      alt={p.full_name}
                      className="w-full h-full object-cover"
                    />
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

          {/* Categorías de análisis */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Categorías
              </h4>
              <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
            </div>
            <div className="space-y-2">
              {analysisCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all hover:bg-white/60 dark:hover:bg-white/10 ${
                    cat.id === "votacion"
                      ? "ring-1 ring-primary/40 bg-primary/5 dark:bg-primary/10"
                      : "bg-slate-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {cat.icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-200">
                      {cat.name}
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                      {cat.description}
                    </p>
                  </div>
                </button>
              ))}
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
                { parties: "LLA - PRO", rate: 85, color: "bg-accent-green" },
                { parties: "PRO - UCR", rate: 62, color: "bg-accent-blue" },
                { parties: "PJ - FDT", rate: 91, color: "bg-primary" },
                { parties: "LLA + UCR", rate: 78, color: "bg-accent-terracotta" },
              ].map((coalition, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-700 dark:text-slate-300">{coalition.parties}</span>
                    <span className="text-slate-500 dark:text-slate-400">{coalition.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${coalition.color} rounded-full`}
                      style={{ width: `${coalition.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discurso vs Realidad sidebar summary */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">
                Discurso vs Realidad
              </h4>
              <span className="material-symbols-outlined text-accent-terracotta text-sm">compare_arrows</span>
            </div>
            <div className="space-y-4">
              {discourseGaps.slice(0, 5).map((gap) => (
                <div
                  key={gap.topic_id}
                  className="pb-3 border-b border-slate-200 dark:border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {gap.topic.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase ${
                        gap.gap_severity === "critical"
                          ? "bg-accent-terracotta/20 text-orange-800 dark:text-accent-terracotta"
                          : gap.gap_severity === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-accent-green/20 text-emerald-800 dark:text-accent-green"
                      }`}
                    >
                      {gap.gap_label}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                      {gap.mention_count} menciones
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
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

        {/* ── Log de Anomalías (full width) ── */}
        <div className="lg:col-span-12 glass-card rounded-xl overflow-hidden">
          <div className="bg-slate-200 dark:bg-white/[0.05] px-8 py-4 border-b border-slate-300 dark:border-white/10 flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm font-bold">monitor_heart</span>
              Log de Anomalías Técnicas
            </h4>
            <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 tracking-widest">
              STATUS_OK
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] bg-white dark:bg-white/[0.03]">
              <thead>
                <tr className="text-slate-900 dark:text-slate-400 uppercase font-black tracking-widest text-[9px] bg-slate-50 dark:bg-black/20">
                  <th className="px-8 py-4">Timestamp</th>
                  <th className="px-8 py-4">Métrica</th>
                  <th className="px-8 py-4">Desviación</th>
                  <th className="px-8 py-4">Descripción</th>
                  <th className="px-8 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {anomalyLog.length > 0 ? (
                  anomalyLog.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <td className="px-8 py-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                        {row.timestamp}
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-900 dark:text-white">
                        {row.metric}
                      </td>
                      <td
                        className={`px-8 py-4 font-black ${
                          row.status === "critical"
                            ? "text-orange-700 dark:text-accent-terracotta"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {row.deviation}
                      </td>
                      <td className="px-8 py-4 text-slate-600 dark:text-slate-300 font-medium italic">
                        {row.description}
                      </td>
                      <td className="px-8 py-4 text-right">
                        {row.status === "critical" ? (
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-accent-green rounded-full text-[8px] font-bold tracking-widest uppercase border border-emerald-200 dark:border-emerald-800">
                            Auditado
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-400 rounded-full text-[8px] font-bold tracking-widest uppercase border border-slate-300 dark:border-white/20">
                            En Proceso
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                      <td className="px-8 py-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                        2024-10-24 14:22
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-900 dark:text-white">
                        Impacto Editorial
                      </td>
                      <td className="px-8 py-4 text-orange-700 dark:text-accent-terracotta font-black">
                        +2.4σ
                      </td>
                      <td className="px-8 py-4 text-slate-600 dark:text-slate-300 font-medium italic">
                        Pico inusual en sector agropecuario.
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-accent-green rounded-full text-[8px] font-bold tracking-widest uppercase border border-emerald-200 dark:border-emerald-800">
                          Auditado
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                      <td className="px-8 py-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                        2024-10-24 16:05
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-900 dark:text-white">
                        Eficiencia Promedio
                      </td>
                      <td className="px-8 py-4 text-slate-600 dark:text-slate-400 font-black">
                        -1.2σ
                      </td>
                      <td className="px-8 py-4 text-slate-600 dark:text-slate-300 font-medium italic">
                        Latencia detectada en fuentes regionales.
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="px-3 py-1 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-400 rounded-full text-[8px] font-bold tracking-widest uppercase border border-slate-300 dark:border-white/20">
                          En Proceso
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}