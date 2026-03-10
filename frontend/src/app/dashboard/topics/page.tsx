import Link from "next/link";
import { getAllTopics, getDiscourseGaps, getAllPoliticians } from "@/lib/data";

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

const categoryFilters = [
  { id: "all", name: "Todos" },
  { id: "economia", name: "Economía" },
  { id: "seguridad", name: "Seguridad" },
  { id: "salud", name: "Salud" },
  { id: "educacion", name: "Educación" },
  { id: "ambiente", name: "Ambiente" },
];

export default function TopicsPage() {
  const topics = getAllTopics();
  const gaps = getDiscourseGaps();
  const politicians = getAllPoliticians();
  const gapMap = new Map(gaps.map((g) => [g.topic_id, g]));

  const topicsWithGap = topics
    .map((t) => ({ ...t, gap: gapMap.get(t.id) }))
    .sort((a, b) => (b.gap?.gap_ratio ?? 0) - (a.gap?.gap_ratio ?? 0));

  // Temas más populares (por momentum)
  const trendingTopics = [...topicsWithGap]
    .sort((a, b) => b.momentum_score - a.momentum_score)
    .slice(0, 3);

  // Legisladores más activos en temas
  const activePoliticians = [...politicians]
    .sort((a, b) => b.activity_score - a.activity_score)
    .slice(0, 4);

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Foros Legislativos
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Temas
          </h1>
          <p className="text-sm text-gray-500">
            Catálogo de {topics.length} temáticas con proyectos, debates y votaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/topics/following"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/60 border border-black/8 hover:bg-white/80 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">bookmarks</span>
            Mis temas
          </Link>
        </div>
      </header>

      {/* Filtros por categoría */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter.id}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              filter.id === "all"
                ? "bg-pure-black text-white"
                : "bg-white/60 text-gray-600 hover:bg-white/80 border border-black/5"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna izquierda: Lista de temas */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicsWithGap.map((topic) => {
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
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        {topic.policy_area}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[severity]}`}
                    >
                      Brecha {SEVERITY_LABELS[severity]}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-pure-black group-hover:text-muted-blue transition-colors mb-1">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {topic.description}
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-center mb-4">
                    <div>
                      <div className="text-lg font-semibold text-pure-black">{topic.mention_count}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">Menciones</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-pure-black">{topic.bill_count}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">Proyectos</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-pure-black">{topic.speech_count}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">Debates</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-muted-red">{gap?.gap_label ?? "—"}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide">Brecha</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">Momentum</span>
                      <span className="text-[10px] font-medium text-gray-600">
                        {Math.round(topic.momentum_score * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${topic.momentum_score * 100}%`,
                          backgroundColor: topic.color_hex,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Temas en tendencia */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[18px]">trending_up</span>
              <h3 className="font-serif text-base font-medium text-pure-black">En tendencia</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, i) => (
                <Link
                  key={topic.id}
                  href={`/dashboard/topics/${topic.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-300 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black truncate">{topic.name}</p>
                    <p className="text-[10px] text-gray-400">{topic.policy_area}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-emerald-600">
                      +{Math.round(topic.momentum_score * 100)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Legisladores activos en temas */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">groups</span>
                <h3 className="font-serif text-base font-medium text-pure-black">Legisladores activos</h3>
              </div>
              <Link href="/dashboard/politicians" className="text-xs text-gray-400 hover:text-black">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {activePoliticians.map((politician) => (
                <Link
                  key={politician.id}
                  href={`/dashboard/politicians/${politician.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img
                      src={politician.photo_url}
                      alt={politician.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black truncate">{politician.full_name}</p>
                    <p className="text-[10px] text-gray-400">
                      {Math.round(politician.activity_score * 100)}% actividad
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Feed personalizado */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-500 text-[18px]">rss_feed</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Feed personalizado</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                <p className="text-sm text-pure-black">Nuevo proyecto en Seguridad</p>
                <p className="text-[10px] text-gray-400 mt-1">Hace 2 horas</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <p className="text-sm text-pure-black">Votación en Economía</p>
                <p className="text-[10px] text-gray-400 mt-1">Hace 4 horas</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50/50 border border-green-100">
                <p className="text-sm text-pure-black">Debate en Educación</p>
                <p className="text-[10px] text-gray-400 mt-1">Hace 6 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
