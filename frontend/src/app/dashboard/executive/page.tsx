import Image from "next/image";
import { getExecutiveAuthorities, getExecutiveDecrees } from "@/lib/data";
import type { DecreeType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function DecreeTypeBadge({ type }: { type: DecreeType }) {
  const styles: Record<DecreeType, string> = {
    dnu: "bg-red-100/60 text-red-700/80 border border-red-200/50",
    decreto: "bg-amber-100/60 text-amber-700/80 border border-amber-200/50",
    resolucion: "bg-blue-100/60 text-blue-700/80 border border-blue-200/50",
  };
  const labels: Record<DecreeType, string> = {
    dnu: "DNU",
    decreto: "Decreto",
    resolucion: "Resolución",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

export default function ExecutivePage() {
  const authorities = getExecutiveAuthorities();
  const decrees = getExecutiveDecrees();

  const president = authorities.find((a) =>
    a.role_title.toLowerCase().includes("president")
  );
  const ministers = authorities.filter(
    (a) => !a.role_title.toLowerCase().includes("president")
  );

  return (
    <div className="p-6 md:p-8 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-fraunces text-2xl md:text-3xl text-pure-black font-semibold">
          Ejecutivo Nacional
        </h1>
        <p className="text-sm text-gray-500">
          Autoridades del Poder Ejecutivo y normativa reciente
        </p>
      </div>

      {/* ── Sección: Autoridades ─────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-pure-black/80 tracking-wide uppercase text-xs">
          Autoridades
        </h2>

        {/* Presidente destacado */}
        {president && (
          <div className="glass-card-dash rounded-2xl p-5 flex items-center gap-5 border border-amber-200/40">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-amber-300/50 shrink-0">
              <Image
                src={president.photo_url}
                alt={president.full_name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100/60 text-amber-700/80 border border-amber-200/50">
                  Titular
                </span>
              </div>
              <h3 className="font-fraunces text-xl text-pure-black font-semibold mt-1">
                {president.full_name}
              </h3>
              <p className="text-sm text-gray-500">{president.role_title}</p>
              <p className="text-xs text-gray-400 mt-1">
                Desde {formatDate(president.started_at)}
              </p>
            </div>
          </div>
        )}

        {/* Grid de ministros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ministers.map((auth) => (
            <div
              key={auth.id}
              className="glass-card-dash rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-warm-white/60 shrink-0">
                <Image
                  src={auth.photo_url}
                  alt={auth.full_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-pure-black truncate">
                  {auth.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {auth.ministry_or_area ?? auth.role_title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Desde {formatDate(auth.started_at)}
                  {auth.ended_at && (
                    <span className="ml-1 text-red-400/70">
                      · Hasta {formatDate(auth.ended_at)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sección: Decretos y resoluciones ─────────────────── */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-pure-black/80 tracking-wide uppercase text-xs">
          Decretos y Resoluciones Recientes
        </h2>

        <div className="glass-card-dash rounded-2xl overflow-hidden">
          <div className="divide-y divide-warm-white/60">
            {decrees.map((decree) => (
              <div
                key={decree.id}
                className="px-5 py-4 flex items-start gap-4 hover:bg-warm-white/40 transition-colors"
              >
                {/* Fecha */}
                <div className="text-right shrink-0 w-16">
                  <p className="text-xs font-medium text-gray-500">
                    {new Date(decree.date).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(decree.date).getFullYear()}
                  </p>
                </div>

                {/* Contenido */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DecreeTypeBadge type={decree.type} />
                    <span className="text-xs font-mono text-gray-600">
                      {decree.number}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">
                    {decree.summary}
                  </p>
                </div>

                {/* Enlace placeholder */}
                <div className="shrink-0">
                  <span className="material-symbols-outlined text-gray-300 text-base select-none">
                    open_in_new
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
