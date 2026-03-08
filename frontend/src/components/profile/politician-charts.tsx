"use client";

import { AlethiaRadarChart } from "@/components/charts/radar-chart";
import { AlethiaPieChart, PieSlice } from "@/components/charts/pie-chart";

interface TopicScore {
  id: string;
  policy_area: string | null;
  score: number;
  grade: string;
  speech_count: number;
}

interface PoliticianRadarChartProps {
  topics: TopicScore[];
}

export function PoliticianRadarChart({ topics }: PoliticianRadarChartProps) {
  if (topics.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-8">
        Sin datos de temas disponibles
      </p>
    );
  }

  const radarData = topics.map((t) => ({
    subject: t.policy_area ?? "General",
    score: t.score,
  }));

  return (
    <AlethiaRadarChart
      data={radarData}
      series={[{ key: "score", label: "Coherencia", color: "#4A90D9" }]}
      angleKey="subject"
      height={220}
    />
  );
}

interface VoteDistributionChartProps {
  yes: number;
  no: number;
  abstain: number;
  absent: number;
}

export function VoteDistributionChart({ yes, no, abstain, absent }: VoteDistributionChartProps) {
  const total = yes + no + abstain + absent || 1;
  const slices: PieSlice[] = [
    { name: "A favor", value: Math.round((yes / total) * 100), color: "#4CAF50" },
    { name: "En contra", value: Math.round((no / total) * 100), color: "#E74C3C" },
    { name: "Abstención", value: Math.round((abstain / total) * 100), color: "#F39C12" },
    { name: "Ausente", value: Math.round((absent / total) * 100), color: "#9CA3AF" },
  ].filter((s) => s.value > 0);

  return (
    <AlethiaPieChart
      data={slices}
      height={200}
      innerRadius={45}
      outerRadius={75}
      showLegend
    />
  );
}
