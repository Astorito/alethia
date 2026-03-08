import {
  getMonthlyConsistencyByParty,
  getTopAlliances,
  getDiscourseGaps,
  getVoteDistribution,
  getMonthlyActivity,
  getAllParties,
} from "@/lib/data";
import { AnalyticsCharts } from "./analytics-charts";

export default function AnalyticsPage() {
  const parties = getAllParties();
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

  return (
    <>
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
          Análisis avanzado
        </p>
        <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
          Análisis
        </h1>
        <p className="text-sm text-gray-500">
          Visualizaciones avanzadas de tendencias, alianzas, brechas y actividad legislativa
        </p>
      </header>

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
    </>
  );
}
