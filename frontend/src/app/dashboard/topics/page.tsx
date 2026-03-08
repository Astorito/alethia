import Link from "next/link";
import { getAllTopics, getDiscourseGaps } from "@/lib/data";

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

export default function TopicsPage() {
  const topics = getAllTopics();
  const gaps = getDiscourseGaps();
  const gapMap = new Map(gaps.map((g) => [g.topic_id, g]));

  const topicsWithGap = topics
    .map((t) => ({ ...t, gap: gapMap.get(t.id) }))
    .sort((a, b) => (b.gap?.gap_ratio ?? 0) - (a.gap?.gap_ratio ?? 0));

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Legislativo
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Temas legislativos
          </h1>
          <p className="text-sm text-gray-500">
            Catálogo de {topics.length} temáticas con análisis de discurso y actividad real
          </p>
        </div>
        <Link
          href="/dashboard/topics/following"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/60 border border-black/8 hover:bg-white/80 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">bookmarks</span>
          Mis temas
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <div className="text-lg font-semibold text-pure-black">{topic.mention_count}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Menciones</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-pure-black">{topic.bill_count}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Proyectos</div>
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
    </>
  );
}
