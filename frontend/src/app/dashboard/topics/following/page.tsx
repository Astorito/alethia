import Link from "next/link";
import { getUserFollowedTopics, getTopicTrend, getDiscourseGaps } from "@/lib/data";
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

export default function MyTopicsPage() {
  const followed = getUserFollowedTopics();
  const gaps = getDiscourseGaps();
  const gapMap = new Map(gaps.map((g) => [g.topic_id, g]));

  const topicsWithData = followed.map((t) => ({
    ...t,
    gap: gapMap.get(t.id),
    trend: getTopicTrend(t.id),
  }));

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Personalizado
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Mis temas
          </h1>
          <p className="text-sm text-gray-500">
            Seguís {followed.length} tema{followed.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/topics"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/60 border border-black/8 hover:bg-white/80 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Explorar temas
        </Link>
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
            Explorá el catálogo y seguí los temas que te interesan
          </p>
          <Link
            href="/dashboard/topics"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-pure-black text-white hover:bg-gray-800 transition-all"
          >
            Ver catálogo de temas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <h3 className="font-serif text-lg font-medium text-pure-black group-hover:text-muted-blue transition-colors">
                      {topic.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[severity]}`}
                  >
                    {SEVERITY_LABELS[severity]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xl font-semibold text-pure-black">{topic.mention_count}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Menciones</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-pure-black">{topic.bill_count}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Proyectos</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-muted-red">{gap?.gap_label ?? "—"}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Brecha</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Momentum (11 meses)</span>
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
      )}
    </>
  );
}
