"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

interface AlethiaBarChartProps {
  data: Record<string, string | number>[];
  series: BarSeries[];
  xKey: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function AlethiaBarChart({
  data,
  series,
  xKey,
  height = 260,
  layout = "horizontal",
  showGrid = true,
  showLegend = false,
  className,
}: AlethiaBarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 4, right: 8, left: isVertical ? 90 : -10, bottom: 0 }}
          barCategoryGap="30%"
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          )}
          {isVertical ? (
            <>
              <YAxis
                dataKey={xKey}
                type="category"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={85}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AlethiaSingleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  layout?: "horizontal" | "vertical";
  defaultColor?: string;
  className?: string;
}

export function AlethiaSingleBarChart({
  data,
  height = 260,
  layout = "vertical",
  defaultColor = "#4A90D9",
  className,
}: AlethiaSingleBarChartProps) {
  const isVertical = layout === "vertical";
  const chartData = data.map((d) => ({ name: d.label, value: d.value, color: d.color ?? defaultColor }));

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout}
          margin={{ top: 4, right: 8, left: isVertical ? 100 : -10, bottom: 0 }}
          barCategoryGap="25%"
        >
          {isVertical ? (
            <>
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                width={95}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
