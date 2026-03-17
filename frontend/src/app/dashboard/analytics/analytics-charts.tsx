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
  // Colores actualizados a la paleta sticht
  const activitySeries: AreaSeries[] = [
    { key: "sesiones", label: "Sesiones", color: "#B8C7D1" }, // accent-blue
    { key: "discursos", label: "Discursos", color: "#9DBEA9" }, // accent-green
    { key: "votos", label: "Votaciones", color: "#D8A48F" }, // accent-terracotta
  ];

  return (
    <div className="space-y-8">
      {/* 4a. Tendencia de coherencia */}
      <section id="consistency" className="glass-card rounded-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Tendencia de coherencia
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Evolución del Civic Score por partido
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">show_chart</span>
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
      <section id="alliances" className="glass-card rounded-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Mapa de alianzas
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Pares legislativos por tasa de alineamiento
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">handshake</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <AlethiaSingleBarChart
              data={allianceBarData}
              height={320}
              layout="vertical"
            />
          </div>
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-[11px] bg-slate-50/50 dark:bg-white/[0.03] rounded-xl overflow-hidden">
              <thead>
                <tr className="text-slate-900 dark:text-slate-400 uppercase font-black tracking-widest text-[9px] bg-slate-100/50 dark:bg-black/20">
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-white/10">Legislador A</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-white/10">Legislador B</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-white/10 text-center">Votaciones</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-white/10 text-right">Alineamiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                {topAlliances.slice(0, 10).map((al) => (
                  <tr key={al.id} className="hover:bg-white/50 dark:hover:bg-white/[0.05] transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {al.nameA}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                      {al.nameB}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-mono">
                      {al.voteCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-black text-[12px] ${
                            al.alignmentRate >= 0.8
                              ? "text-emerald-600 dark:text-accent-green"
                              : al.alignmentRate >= 0.6
                                ? "text-primary"
                                : "text-orange-600 dark:text-accent-terracotta"
                          }`}
                        >
                          {Math.round(al.alignmentRate * 100)}%
                        </span>
                        {al.sameParty && (
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            Mismo bloque
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4c. Brechas discurso vs realidad */}
      <section id="gaps" className="glass-card rounded-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Discurso vs Realidad
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Menciones en recinto vs. Proyectos aprobados
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">compare_arrows</span>
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
      <section id="votes" className="glass-card rounded-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Distribución de votos
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Posiciones globales en votaciones registradas
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-full max-w-[280px] shrink-0">
            <AlethiaPieChart data={voteDistribution} height={240} showLegend={false} />
          </div>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {voteDistribution.map((slice) => (
                <div key={slice.name} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 shadow-sm">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div>
                    <div className="text-xl font-light text-slate-900 dark:text-white leading-none mb-1">
                      {slice.value}%
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">
                      {slice.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4e. Actividad legislativa por mes */}
      <section id="activity" className="glass-card rounded-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-1">
              Actividad legislativa
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
              Sesiones, discursos y votaciones mensuales
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">area_chart</span>
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