import { getCongressToday, getUpcomingSessions, getRecentBillMovements } from "@/lib/data";
import type { CongressEventType } from "@/lib/types";

const EVENT_TYPE_STYLES: Record<CongressEventType, { bg: string; text: string; label: string }> = {
  session: { bg: "bg-blue-100/60", text: "text-blue-700", label: "Sesión" },
  vote: { bg: "bg-purple-100/60", text: "text-purple-700", label: "Votación" },
  bill: { bg: "bg-green-100/60", text: "text-green-700", label: "Proyecto" },
  speech: { bg: "bg-orange-100/60", text: "text-orange-700", label: "Discurso" },
};

const BILL_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  committee: "En comisión",
  floor: "En plenario",
  passed: "Aprobado",
  enacted: "Promulgado",
  rejected: "Rechazado",
};

const BILL_STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100/60 text-gray-600",
  committee: "bg-blue-100/60 text-blue-700",
  floor: "bg-purple-100/60 text-purple-700",
  passed: "bg-green-100/60 text-green-700",
  enacted: "bg-emerald-100/60 text-emerald-700",
  rejected: "bg-red-100/60 text-red-700",
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date("2024-11-15T18:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "hace menos de 1h";
  if (diffH === 1) return "hace 1h";
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} día${diffD > 1 ? "s" : ""}`;
}

export default function CongressPage() {
  const events = getCongressToday();
  const upcoming = getUpcomingSessions();
  const recentBills = getRecentBillMovements();

  const today = new Date("2024-11-15");
  const dateLabel = today.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            En tiempo real
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Hoy en el Congreso
          </h1>
          <p className="text-sm text-gray-500 capitalize">{dateLabel}</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Timeline principal */}
        <div className="col-span-8">
          <h2 className="font-serif text-lg font-medium text-pure-black mb-5">
            Actividad de hoy
          </h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-black/8" />
            <div className="space-y-4">
              {events.map((event) => {
                const typeStyle = EVENT_TYPE_STYLES[event.type] ?? EVENT_TYPE_STYLES.session;
                return (
                  <div key={event.id} className="relative flex gap-4">
                    <div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${typeStyle.bg}`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${typeStyle.text}`}>
                        {event.icon}
                      </span>
                    </div>
                    <div className="glass-card-dash rounded-2xl p-4 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text}`}
                          >
                            {typeStyle.label}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatRelativeTime(event.date)}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-pure-black mb-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-span-4 space-y-6">
          {/* Próximas sesiones */}
          <div className="glass-card-dash rounded-2xl p-5">
            <h2 className="font-serif text-base font-medium text-pure-black mb-4">
              Próximas sesiones
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-400">Sin sesiones programadas</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((sess) => {
                  const date = new Date(sess.date + "T00:00:00");
                  return (
                    <div
                      key={sess.id}
                      className="flex items-start gap-3 py-2.5 border-b border-black/5 last:border-0"
                    >
                      <div className="text-center flex-shrink-0">
                        <div className="text-lg font-bold text-pure-black leading-none">
                          {date.getDate()}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase">
                          {date.toLocaleDateString("es-AR", { month: "short" })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-pure-black leading-snug">
                          {sess.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{sess.institution}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Proyectos en movimiento */}
          <div className="glass-card-dash rounded-2xl p-5">
            <h2 className="font-serif text-base font-medium text-pure-black mb-4">
              Proyectos en movimiento
            </h2>
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="py-2.5 border-b border-black/5 last:border-0"
                >
                  <p className="text-xs font-medium text-pure-black line-clamp-2 mb-1">
                    {bill.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {bill.policy_area}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${BILL_STATUS_STYLES[bill.status]}`}
                    >
                      {BILL_STATUS_LABELS[bill.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
