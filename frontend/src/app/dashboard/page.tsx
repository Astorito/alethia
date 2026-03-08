import Link from "next/link";
import {
  getDashboardStats,
  getDiscourseGaps,
  getCongressToday,
  getUnreadAlertsCount,
  getMonthlyActivity,
  getUserFollowedTopics,
} from "@/lib/data";
import { DashboardActivityChart } from "./dashboard-activity-chart";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const gaps = getDiscourseGaps();
  const events = getCongressToday();
  const unreadAlerts = getUnreadAlertsCount();
  const monthlyActivity = getMonthlyActivity();
  const followedTopics = getUserFollowedTopics();

  const discourseVsReality = gaps.slice(0, 5).map((g) => ({
    topic: g.topic.name,
    mentions: g.mention_count,
    projects: `${g.bills_passed} proyecto${g.bills_passed !== 1 ? "s" : ""}`,
    gap: g.gap_label,
    urgency:
      g.gap_severity === "critical"
        ? "Alta"
        : g.gap_severity === "high"
          ? "Media"
          : "Baja",
    urgencyStyle:
      g.gap_severity === "critical"
        ? "bg-red-100/50 text-red-700/70 border-red-200/50"
        : g.gap_severity === "high"
          ? "bg-yellow-100/50 text-yellow-700/70 border-yellow-200/50"
          : "bg-green-100/50 text-green-700/70 border-green-200/50",
  }));

  const recentEvents = events.slice(0, 2);

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Buenos días, Sofía
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Resumen de actividad legislativa y cívica de hoy.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link
            href="/dashboard/alerts"
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5 relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadAlerts > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-muted-red rounded-full border border-warm-white" />
            )}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Menciones
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[20px]">campaign</span>
          </div>
          <div>
            <span className="font-mono text-[48px] leading-none text-muted-blue tracking-tighter">
              {stats.total_speeches}
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <span className="material-symbols-outlined text-[14px] text-muted-green">arrow_upward</span>
              <span>en base de datos</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Alertas
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[20px]">warning</span>
          </div>
          <div>
            <span className="font-mono text-[48px] leading-none text-muted-red tracking-tighter">
              {String(stats.total_contradictions).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <span>Contradicciones detectadas</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Sesiones
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[20px]">gavel</span>
          </div>
          <div>
            <span className="font-mono text-[48px] leading-none text-gray-600 tracking-tighter">
              {stats.total_sessions}
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <span>Registradas</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Civic Score
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[20px]">verified</span>
          </div>
          <div>
            <span className="font-mono text-[48px] leading-none text-muted-green tracking-tighter">
              {stats.avg_consistency}
            </span>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <span>Promedio coherencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad semanal */}
      <div className="glass-card-dash rounded-2xl p-6 mb-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-serif text-xl text-gray-800">Actividad legislativa mensual</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sesiones, discursos y votaciones 2024</p>
          </div>
          <Link
            href="/dashboard/analytics#activity"
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            Ver análisis completo →
          </Link>
        </div>
        <DashboardActivityChart data={monthlyActivity} />
      </div>

      <div className="grid grid-cols-12 gap-8 mb-10">
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-serif text-xl text-gray-800">Lo que pasó hoy</h3>
            <Link
              href="/dashboard/congress"
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          {recentEvents.map((event) => (
            <Link
              key={event.id}
              href="/dashboard/congress"
              className="glass-card-dash p-5 rounded-2xl flex gap-4 items-start hover:bg-white/80 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-muted-blue group-hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">{event.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide capitalize">
                    {event.type}
                  </span>
                </div>
                <h4 className="text-base font-medium text-gray-800 mb-1 group-hover:text-black transition-colors line-clamp-1">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-500 font-light line-clamp-2">
                  {event.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col h-full">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-serif text-xl text-gray-800">Tus temas</h3>
            <Link
              href="/dashboard/topics/following"
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Administrar →
            </Link>
          </div>
          <div className="glass-card-dash p-6 rounded-2xl h-full flex flex-col justify-center space-y-5">
            {followedTopics.slice(0, 4).map((topic) => (
              <Link
                key={topic.id}
                href={`/dashboard/topics/${topic.slug}`}
                className="group"
              >
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium group-hover:text-pure-black transition-colors">
                    {topic.name}
                  </span>
                  <span className="text-gray-400 font-mono text-xs">
                    {Math.round(topic.momentum_score * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full group-hover:opacity-80 transition-opacity"
                    style={{
                      width: `${topic.momentum_score * 100}%`,
                      backgroundColor: topic.color_hex,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full mb-10">
        <h3 className="font-serif text-xl text-gray-800 mb-6">
          Discurso vs. Realidad Legislativa
        </h3>
        <div className="glass-card-dash rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-gray-400 font-medium">
                  <th className="px-6 py-4 font-medium">Temática</th>
                  <th className="px-6 py-4 font-medium">Menciones</th>
                  <th className="px-6 py-4 font-medium">Proyectos aprobados</th>
                  <th className="px-6 py-4 font-medium text-right">Brecha</th>
                  <th className="px-6 py-4 font-medium text-right">Urgencia</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {discourseVsReality.map((row) => (
                  <tr
                    key={row.topic}
                    className="border-b border-black/5 last:border-b-0 hover:bg-white/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{row.topic}</td>
                    <td className="px-6 py-4 text-gray-500">{row.mentions}</td>
                    <td className="px-6 py-4 text-gray-500">{row.projects}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-red">{row.gap}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.urgencyStyle}`}
                      >
                        {row.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50/30 border-t border-black/5 flex justify-end">
            <Link
              href="/dashboard/analytics#gaps"
              className="text-xs text-gray-500 hover:text-black font-medium transition-colors"
            >
              Ver análisis completo →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
