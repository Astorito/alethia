import { getUserAlerts, getUnreadAlertsCount } from "@/lib/data";
import type { AlertType } from "@/lib/types";
import { AlertsClient } from "./alerts-client";

const ALERT_TYPE_META: Record<AlertType, { icon: string; bg: string; text: string; label: string }> = {
  contradiction: {
    icon: "warning",
    bg: "bg-red-100/60",
    text: "text-red-700",
    label: "Contradicción",
  },
  topic_surge: {
    icon: "trending_up",
    bg: "bg-blue-100/60",
    text: "text-blue-700",
    label: "Tendencia",
  },
  bill_advance: {
    icon: "description",
    bg: "bg-green-100/60",
    text: "text-green-700",
    label: "Proyecto",
  },
  vote: {
    icon: "how_to_vote",
    bg: "bg-purple-100/60",
    text: "text-purple-700",
    label: "Votación",
  },
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

export default function AlertsPage() {
  const alerts = getUserAlerts();
  const unreadCount = getUnreadAlertsCount();

  const alertsData = alerts.map((a) => ({
    ...a,
    meta: ALERT_TYPE_META[a.type] ?? ALERT_TYPE_META.vote,
    relativeTime: formatRelativeTime(a.date),
  }));

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Notificaciones
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Alertas
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? (
              <span>
                <span className="font-medium text-pure-black">{unreadCount}</span> alerta
                {unreadCount !== 1 ? "s" : ""} sin leer
              </span>
            ) : (
              "Todas las alertas leídas"
            )}
          </p>
        </div>
      </header>

      <AlertsClient alerts={alertsData} />
    </>
  );
}
