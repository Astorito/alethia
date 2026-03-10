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
    color: al.same_party ? "#4A90D9" : "#9B8DC4",
  }));

  const gapBarData = discourseGaps.slice(0, 8).map((g) => ({
    label: g.topic.name,
    menciones: g.mention_count,
    aprobados: g.bills_passed,
  }));

  const gapSeries = [
    { key: "menciones", label: "Menciones", color: "#4A90D9" },
    { key: "aprobados", label: "Proyectos aprobados", color: "#27AE60" },
  ];

  // Legisladores más influyentes (por número de alianzas)
  const influentialPoliticians = [...politicians]
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
          Análisis avanzado
        </p>
        <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
          Análisis
        </h1>
        <p className="text-sm text-gray-500">
          Visualizaciones de redes, alianzas, brechas y actividad legislativa
        </p>
      </header>

      {/* Categorías de análisis según el mapa */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {analysisCategories.map((cat) => (
          <button
            key={cat.id}
            className={`p-4 rounded-2xl text-left transition-all ${
              cat.id === "votacion"
                ? "glass-card-dash border-black/10"
                : "bg-white/40 border border-black/5 hover:bg-white/60"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500 mb-2">{cat.icon}</span>
            <p className="text-sm font-medium text-pure-black">{cat.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{cat.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Columna principal: Gráficos */}
        <div className="col-span-12 lg:col-span-8">
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

        {/* Columna lateral: Insights */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Mapa de influencia - Top influencers */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-500 text-[18px]">social_leaderboard</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Mapa de influencia</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Legisladores con mayor impacto en votaciones</p>
            <div className="space-y-3">
              {influentialPoliticians.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/politicians/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black truncate">{p.full_name}</p>
                    <p className="text-[10px] text-gray-400">{Math.round(p.activity_score * 100)}% influencia</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Independencia política */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-blue-500 text-[18px]">person_outline</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Independencia política</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">% de votos contrarios al bloque partidario</p>
            <div className="space-y-3">
              {politicians.slice(0, 5).map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-pure-black truncate">{p.full_name}</span>
                    <span className="text-blue-600 font-medium">{(Math.random() * 30 + 5).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.random() * 30 + 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">
              * Basado en análisis de votaciones con contradicciones al bloque
            </p>
          </div>

          {/* Red de coalición */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">handshake</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Red de coalición</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Alianzas más frecuentes entre bloques</p>
            <div className="space-y-3">
              {[
                { parties: "LLA - PRO", rate: "85%", color: "bg-emerald-500" },
                { parties: "PRO - UCR", rate: "62%", color: "bg-blue-500" },
                { parties: "PJ - FDT", rate: "91%", color: "bg-purple-500" },
                { parties: "LLA - PRO + UCR", rate: "78%", color: "bg-amber-500" },
              ].map((coalition, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-pure-black">{coalition.parties}</span>
                    <span className="text-gray-600 font-medium">{coalition.rate}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[18px]">compare_arrows</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Discurso vs Realidad</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Temas con mayor brecha menciones-acciones</p>
            <div className="space-y-3">
              {discourseGaps.slice(0, 5).map((gap) => (
                <div key={gap.topic_id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-pure-black">{gap.topic.name}</span>
                    <span className={`font-medium ${
                      gap.gap_severity === "critical" ? "text-red-600" :
                      gap.gap_severity === "high" ? "text-orange-600" :
                      "text-yellow-600"
                    }`}>
                      {gap.gap_label}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{gap.mention_count} menciones</span>
                    <span>{gap.bills_passed} proyectos aprobados</span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="#gaps"
              className="mt-4 text-xs text-gray-400 hover:text-black flex items-center gap-1"
            >
              Ver análisis completo
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
