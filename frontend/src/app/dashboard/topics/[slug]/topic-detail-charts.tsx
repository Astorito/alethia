"use client";

import { AlethiaAreaChart } from "@/components/charts/area-chart";
import { AlethiaSingleBarChart } from "@/components/charts/bar-chart";

interface Props {
  trend: { month: string; value: number }[];
  gapData: { label: string; value: number; color: string }[];
  showTrendOnly?: boolean;
}

export function TopicDetailCharts({ trend, gapData, showTrendOnly = false }: Props) {
  if (showTrendOnly) {
    return (
      <AlethiaAreaChart
        data={trend}
        series={[{ key: "value", label: "Momentum", color: "#4A90D9" }]}
        xKey="month"
        height={200}
        showGrid={false}
      />
    );
  }

  return (
    <AlethiaSingleBarChart
      data={gapData}
      height={200}
      layout="vertical"
      className="mt-2"
    />
  );
}
