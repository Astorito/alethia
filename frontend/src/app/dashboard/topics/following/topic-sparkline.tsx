"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface Props {
  data: { month: string; value: number }[];
  color: string;
}

export function TopicSparkline({ data, color }: Props) {
  return (
    <div style={{ width: "100%", height: 48 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
