"use client";

import { AlethiaLineChart, LineSeries } from "@/components/charts/line-chart";
import { AlethiaSingleBarChart, AlethiaBarChart, BarSeries } from "@/components/charts/bar-chart";
import { AlethiaPieChart, PieSlice } from "@/components/charts/pie-chart";
import { AlethiaAreaChart, AreaSeries } from "@/components/charts/area-chart";

interface TopAllianceRow {
  id: string;
  nameA: string;
  nameB: string;
  sameParty: boolean;
  alignmentRate: number;
  voteCount: number;
}

interface Props {
  consistencyLineData: Record<string, string | number>[];
  consistencySeries: LineSeries[];
  allianceBarData: { label: string; value: number; color: string }[];
  gapBarData: Record<string, string | number>[];
  gapSeries: BarSeries[];
  voteDistribution: PieSlice[];
  monthlyActivity: Record<string, string | number>[];
  topAlliances: TopAllianceRow[];
}

export function AnalyticsCharts({
  consistencyLineData,
  consistencySeries,
  allianceBarData,
  gapBarData,
  gapSeries,
  voteDistribution,
  monthlyActivity,
  topAlliances,
}: Props) {
  const activitySeries: AreaSeries[] = [
    { key: "sesiones", label: "Sesiones", color: "#4A90D9" },
    { key: "discursos", label: "Discursos", color: "#7EC8A4" },
    { key: "votos", label: "Votaciones", color: "#F39C12" },
  ];

  return (
    <div className="space-y-8">
      {/* 4a. Tendencia de coherencia */}
      <section id="consistency" className="glass-card-dash rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="font-serif text-xl font-medium text-pure-black mb-1">
            Tendencia de coherencia por partido
          </h2>
          <p className="text-xs text-gray-400">
            Evolución del Civic Score promedio por partido a lo largo de 2024
          </p>
        </div>
        <AlethiaLineChart
          data={consistencyLineData}
          series={consistencySeries}
          xKey="month"
          height={280}
          showLegend
          yDomain={[0, 10]}
        />
      </section>

      {/* 4b. Mapa de alianzas */}
      <section id="alliances" className="glass-card-dash rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="font-serif text-xl font-medium text-pure-black mb-1">
            Mapa de alianzas
          </h2>
          <p className="text-xs text-gray-400">
            Top pares legislativos por tasa de alineamiento en votaciones
          </p>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <AlethiaSingleBarChart
              data={allianceBarData}
              height={320}
              layout="vertical"
            />
          </div>
          <div className="col-span-7 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-3">Legislador A</th>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-3">Legislador B</th>
                  <th className="text-center text-xs text-gray-400 font-medium pb-3 pr-3">Votaciones</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-3">Alineamiento</th>
                </tr>
              </thead>
              <tbody>
                {topAlliances.slice(0, 10).map((al) => (
                  <tr key={al.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2.5 pr-3 text-xs font-medium text-pure-black">{al.nameA}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-600">{al.nameB}</td>
                    <td className="py-2.5 pr-3 text-center text-xs text-gray-400">{al.voteCount}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-xs font-bold ${
                          al.alignmentRate >= 0.8
                            ? "text-green-600"
                            : al.alignmentRate >= 0.6
                              ? "text-blue-600"
                              : "text-orange-500"
                        }`}
                      >
                        {Math.round(al.alignmentRate * 100)}%
                      </span>
                      {al.sameParty && (
                        <span className="ml-1.5 text-[10px] text-gray-400">(mismo bloque)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4c. Brechas discurso vs realidad */}
      <section id="gaps" className="glass-card-dash rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="font-serif text-xl font-medium text-pure-black mb-1">
            Brechas: discurso vs. realidad legislativa
          </h2>
          <p className="text-xs text-gray-400">
            Comparación entre menciones en recinto y proyectos efectivamente aprobados por tema
          </p>
        </div>
        <AlethiaBarChart
          data={gapBarData}
          series={gapSeries}
          xKey="label"
          height={300}
          showLegend
        />
      </section>

      {/* 4d. Distribución de votos */}
      <section id="votes" className="glass-card-dash rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="font-serif text-xl font-medium text-pure-black mb-1">
            Distribución de votos
          </h2>
          <p className="text-xs text-gray-400">
            Distribución global de posiciones en todas las votaciones registradas
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex-1 max-w-xs">
            <AlethiaPieChart data={voteDistribution} height={240} showLegend={false} />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              {voteDistribution.map((slice) => (
                <div key={slice.name} className="flex items-center gap-3 p-3 rounded-xl bg-black/3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div>
                    <div className="text-lg font-semibold text-pure-black">{slice.value}%</div>
                    <div className="text-xs text-gray-400">{slice.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4e. Actividad legislativa por mes */}
      <section id="activity" className="glass-card-dash rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="font-serif text-xl font-medium text-pure-black mb-1">
            Actividad legislativa mensual
          </h2>
          <p className="text-xs text-gray-400">
            Sesiones, discursos y votaciones registradas por mes durante 2024
          </p>
        </div>
        <AlethiaAreaChart
          data={monthlyActivity}
          series={activitySeries}
          xKey="month"
          height={280}
          showLegend
        />
      </section>
    </div>
  );
}
