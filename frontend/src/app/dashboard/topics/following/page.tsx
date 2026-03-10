import Link from "next/link";
import { getUserFollowedTopics, getTopicTrend, getDiscourseGaps, getAllPoliticians } from "@/lib/data";
import { TopicSparkline } from "./topic-sparkline";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100/60 text-red-700 border-red-200/60",
  high: "bg-orange-100/60 text-orange-700 border-orange-200/60",
  medium: "bg-yellow-100/60 text-yellow-700 border-yellow-200/60",
  low: "bg-green-100/60 text-green-700 border-green-200/60",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const FEED_ITEMS = [
  { type: "proyecto", title: "Nuevo proyecto de Ley de Seguridad", topic: "Seguridad", time: "Hace 2 horas", icon: "description", color: "bg-blue-50 text-blue-600" },
  { type: "votacion", title: "Votación aprobada: Presupuesto 2024", topic: "Economía", time: "Hace 4 horas", icon: "how_to_vote", color: "bg-green-50 text-green-600" },
  { type: "debate", title: "Debate en comisión: Educación digital", topic: "Educación", time: "Hace 6 horas", icon: "forum", color: "bg-purple-50 text-purple-600" },
  { type: "intervencion", title: "Discurso del Dip. Rodríguez", topic: "Ambiente", time: "Hace 8 horas", icon: "record_voice_over", color: "bg-amber-50 text-amber-600" },
  { type: "proyecto", title: "Proyecto modificado: Reforma laboral", topic: "Trabajo", time: "Ayer", icon: "edit_document", color: "bg-orange-50 text-orange-600" },
];

export default function MyTopicsPage() {
  const followed = getUserFollowedTopics();
  const gaps = getDiscourseGaps();
  const gapMap = new Map(gaps.map((g) => [g.topic_id, g]));
  const politicians = getAllPoliticians();

  const topicsWithData = followed.map((t) => ({
    ...t,
    gap: gapMap.get(t.id),
    trend: getTopicTrend(t.id),
  }));

  // Legisladores seguidos (mock - en una app real vendría de user_preferences)
  const followedPoliticians = politicians.slice(0, 3);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Feed Personalizado
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Mis Temas
          </h1>
          <p className="text-sm text-gray-500">
            Seguís {followed.length} tema{followed.length !== 1 ? "s" : ""} y {followedPoliticians.length} legisladores
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/politicians"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/60 border border-black/8 hover:bg-white/80 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Seguir legisladores
          </Link>
          <Link
            href="/dashboard/topics"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-pure-black text-white hover:bg-gray-800 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Explorar temas
          </Link>
        </div>
      </header>

      {topicsWithData.length === 0 ? (
        <div className="glass-card-dash rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">
            bookmarks
          </span>
          <h3 className="font-serif text-lg text-gray-500 mb-2">
            Aún no seguís ningún tema
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Explorá el catálogo y seguí los temas que te interesan para recibir actualizaciones
          </p>
          <Link
            href="/dashboard/topics"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-pure-black text-white hover:bg-gray-800 transition-all"
          >
            Ver catálogo de temas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Columna izquierda: Feed y temas seguidos */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Feed de actividad */}
            <div className="glass-card-dash rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-purple-500 text-[20px]">rss_feed</span>
                <h2 className="font-serif text-lg font-medium text-pure-black">Feed personalizado</h2>
              </div>
              <div className="space-y-3">
                {FEED_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pure-black">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {item.topic}
                        </span>
                        <span className="text-[10px] text-gray-400">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Temas seguidos */}
            <div>
              <h2 className="font-serif text-lg font-medium text-pure-black mb-4">Temas seguidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicsWithData.map((topic) => {
                  const gap = topic.gap;
                  const severity = gap?.gap_severity ?? "low";

                  return (
                    <Link
                      key={topic.id}
                      href={`/dashboard/topics/${topic.slug}`}
                      className="glass-card-dash rounded-2xl p-5 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: topic.color_hex }}
                          />
                          <h3 className="font-serif text-base font-medium text-pure-black group-hover:text-muted-blue transition-colors">
                            {topic.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[severity]}`}
                        >
                          {SEVERITY_LABELS[severity]}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-pure-black">{topic.mention_count}</div>
                          <div className="text-[10px] text-gray-400">Menciones</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-pure-black">{topic.bill_count}</div>
                          <div className="text-[10px] text-gray-400">Proyectos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-pure-black">{topic.speech_count}</div>
                          <div className="text-[10px] text-gray-400">Debates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-muted-red">{gap?.gap_label ?? "—"}</div>
                          <div className="text-[10px] text-gray-400">Brecha</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Momentum</span>
                          <span className="text-[10px] font-medium text-gray-600">
                            {Math.round(topic.momentum_score * 100)}%
                          </span>
                        </div>
                        <TopicSparkline
                          data={topic.trend}
                          color={topic.color_hex}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Proyectos seguidos */}
            <div className="glass-card-dash rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">description</span>
                  <h2 className="font-serif text-lg font-medium text-pure-black">Proyectos seguidos</h2>
                </div>
                <Link href="/dashboard/topics" className="text-xs text-gray-400 hover:text-black">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Ley de Seguridad Integral", status: "En comisión", progress: 45, topic: "Seguridad" },
                  { title: "Reforma Previsional", status: "En debate", progress: 70, topic: "Economía" },
                  { title: "Educación Digital", status: "Aprobado", progress: 100, topic: "Educación" },
                ].map((project, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pure-black">{project.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {project.topic}
                        </span>
                        <span className="text-[10px] text-gray-400">{project.status}</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 text-right mt-0.5">{project.progress}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Legisladores seguidos */}
            <div className="glass-card-dash rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">person_check</span>
                  <h3 className="font-serif text-base font-medium text-pure-black">Legisladores seguidos</h3>
                </div>
                <Link href="/dashboard/politicians" className="text-xs text-gray-400 hover:text-black">
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-3">
                {followedPoliticians.map((politician) => (
                  <Link
                    key={politician.id}
                    href={`/dashboard/politicians/${politician.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img
                        src={politician.photo_url}
                        alt={politician.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pure-black truncate">{politician.full_name}</p>
                      <div className="flex items-center gap-1">
                        {politician.party && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: politician.party.color_hex }}
                          />
                        )}
                        <span className="text-[10px] text-gray-400">{politician.party?.short_name}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${
                      politician.consistency_grade.startsWith("A") ? "text-emerald-600" :
                      politician.consistency_grade.startsWith("B") ? "text-blue-600" :
                      "text-amber-600"
                    }`}>
                      {politician.consistency_grade}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Alertas personalizadas */}
            <div className="glass-card-dash rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-red-500 text-[20px]">notifications_active</span>
                <h3 className="font-serif text-base font-medium text-pure-black">Alertas personalizadas</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <p className="text-sm font-medium text-pure-black">Contradicción detectada</p>
                  <p className="text-[10px] text-gray-500 mt-1">Dip. García votó diferente a su discurso en Seguridad</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <p className="text-sm font-medium text-pure-black">Nuevo proyecto</p>
                  <p className="text-[10px] text-gray-500 mt-1">En tu tema seguido "Economía"</p>
                </div>
              </div>
              <Link
                href="/dashboard/alerts"
                className="mt-4 text-xs text-gray-400 hover:text-black flex items-center gap-1"
              >
                Ver todas las alertas
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {/* Configuración de seguimiento */}
            <div className="glass-card-dash rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">settings</span>
                <h3 className="font-serif text-base font-medium text-pure-black">Preferencias</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Notificaciones push", enabled: true },
                  { label: "Resumen semanal", enabled: true },
                  { label: "Alertas urgentes", enabled: true },
                  { label: "Nuevos proyectos", enabled: false },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{pref.label}</span>
                    <div className={`w-8 h-4 rounded-full ${pref.enabled ? "bg-emerald-500" : "bg-gray-300"} relative`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${pref.enabled ? "left-4.5" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
