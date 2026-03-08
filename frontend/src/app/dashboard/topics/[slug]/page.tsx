import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTopicBySlug,
  getPoliticiansByTopic,
  getBillsByPolicyArea,
  getTopicTrend,
  getDiscourseGaps,
} from "@/lib/data";
import { TopicDetailCharts } from "./topic-detail-charts";

const BILL_STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100/60 text-gray-600 border-gray-200/60",
  committee: "bg-blue-100/60 text-blue-700 border-blue-200/60",
  floor: "bg-purple-100/60 text-purple-700 border-purple-200/60",
  passed: "bg-green-100/60 text-green-700 border-green-200/60",
  enacted: "bg-emerald-100/60 text-emerald-700 border-emerald-200/60",
  rejected: "bg-red-100/60 text-red-700 border-red-200/60",
};

const BILL_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  committee: "En comisión",
  floor: "En plenario",
  passed: "Aprobado",
  enacted: "Promulgado",
  rejected: "Rechazado",
};

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-600", A: "text-green-600", "A-": "text-green-500",
  "B+": "text-blue-600", B: "text-blue-500", "B-": "text-blue-400",
  "C+": "text-yellow-600", C: "text-yellow-500", "C-": "text-orange-500",
  D: "text-red-600",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const politicians = getPoliticiansByTopic(topic.id);
  const bills = getBillsByPolicyArea(topic.policy_area);
  const trend = getTopicTrend(topic.id);
  const gaps = getDiscourseGaps();
  const gap = gaps.find((g) => g.topic_id === topic.id);

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/dashboard/topics"
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Temas
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-500">{topic.name}</span>
        </div>

        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${topic.color_hex}22` }}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topic.color_hex }} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
              {topic.name}
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">{topic.description}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Menciones", value: topic.mention_count, icon: "record_voice_over" },
          { label: "Proyectos", value: topic.bill_count, icon: "description" },
          { label: "Discursos", value: topic.speech_count, icon: "forum" },
          { label: "Brecha", value: topic.discourse_gap_label, icon: "trending_up" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-dash rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-gray-400">
                {stat.icon}
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-semibold text-pure-black">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-7 glass-card-dash rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-pure-black mb-1">
            Brecha discurso vs. realidad
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Comparación entre menciones en recinto y proyectos que avanzaron
          </p>
          {gap ? (
            <TopicDetailCharts
              trend={trend}
              gapData={[
                { label: "Menciones en recinto", value: gap.mention_count, color: "#4A90D9" },
                { label: "Proyectos introducidos", value: gap.bills_introduced, color: "#7EC8A4" },
                { label: "Proyectos aprobados", value: gap.bills_passed, color: "#27AE60" },
                { label: "Leyes promulgadas", value: gap.laws_enacted, color: "#2ECC71" },
              ]}
            />
          ) : (
            <p className="text-sm text-gray-400">Sin datos disponibles</p>
          )}
        </div>

        <div className="col-span-5 glass-card-dash rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-pure-black mb-1">
            Evolución temporal
          </h2>
          <p className="text-xs text-gray-400 mb-4">Momentum del tema en los últimos 11 meses</p>
          <TopicDetailCharts trend={trend} gapData={[]} showTrendOnly />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 glass-card-dash rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-pure-black mb-4">
            Proyectos de ley relacionados
          </h2>
          {bills.length === 0 ? (
            <p className="text-sm text-gray-400">Sin proyectos en esta área</p>
          ) : (
            <div className="space-y-3">
              {bills.slice(0, 8).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-start justify-between gap-3 py-3 border-b border-black/5 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black line-clamp-1">{bill.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(bill.introduced_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${BILL_STATUS_STYLES[bill.status]}`}
                  >
                    {BILL_STATUS_LABELS[bill.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-5 glass-card-dash rounded-2xl p-6">
          <h2 className="font-serif text-lg font-medium text-pure-black mb-4">
            Quién habla de este tema
          </h2>
          {politicians.length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos de coherencia para este tema</p>
          ) : (
            <div className="space-y-3">
              {politicians.slice(0, 6).map((cs) => (
                <Link
                  key={cs.id}
                  href={`/dashboard/politicians/${cs.politician.id}`}
                  className="flex items-center justify-between py-2 border-b border-black/5 last:border-0 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cs.politician.photo_url}
                      alt={cs.politician.full_name}
                      className="w-8 h-8 rounded-full object-cover opacity-90"
                    />
                    <div>
                      <p className="text-sm font-medium text-pure-black">{cs.politician.full_name}</p>
                      <p className="text-[11px] text-gray-400">
                        {cs.speech_count} discursos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${GRADE_COLORS[cs.grade] ?? "text-gray-600"}`}>
                      {cs.grade}
                    </div>
                    <div className="text-[10px] text-gray-400">{cs.score.toFixed(1)}/10</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
