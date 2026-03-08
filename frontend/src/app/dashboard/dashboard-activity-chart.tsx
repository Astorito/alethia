"use client";

import { AlethiaAreaChart } from "@/components/charts/area-chart";

interface Props {
  data: Record<string, string | number>[];
}

export function DashboardActivityChart({ data }: Props) {
  return (
    <AlethiaAreaChart
      data={data}
      series={[
        { key: "sesiones", label: "Sesiones", color: "#4A90D9" },
        { key: "discursos", label: "Discursos", color: "#7EC8A4" },
        { key: "votos", label: "Votaciones", color: "#F39C12" },
      ]}
      xKey="month"
      height={180}
      showGrid={false}
      showLegend
    />
  );
}
