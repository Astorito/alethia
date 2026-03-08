"use client";

import { useState } from "react";

interface AlertData {
  id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  relativeTime: string;
  meta: { icon: string; bg: string; text: string; label: string };
}

interface Props {
  alerts: AlertData[];
}

export function AlertsClient({ alerts: initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "read") return a.read;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-black/4 rounded-xl p-1">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-white text-pure-black shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "Todas" : f === "unread" ? `No leídas (${unreadCount})` : "Leídas"}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-white/60 border border-black/8 hover:bg-white/80 transition-all text-gray-600"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card-dash rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">
            notifications_none
          </span>
          <p className="text-sm text-gray-400">No hay alertas en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`glass-card-dash rounded-2xl p-5 transition-all ${
                !alert.read ? "border-l-[3px] border-muted-blue" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${alert.meta.bg}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${alert.meta.text}`}>
                    {alert.meta.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${alert.meta.bg} ${alert.meta.text}`}
                      >
                        {alert.meta.label}
                      </span>
                      {!alert.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-blue inline-block" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {alert.relativeTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-pure-black mb-1">{alert.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{alert.description}</p>
                </div>
                {!alert.read && (
                  <button
                    onClick={() => markRead(alert.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors mt-0.5"
                    title="Marcar como leída"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
