"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DepthDeckCarousel } from "@/components/executive/depth-deck-carousel";
import { getExecutiveAuthorities, getExecutiveDecrees } from "@/lib/data";
import type { ExecutiveAuthority, DecreeOrResolution } from "@/lib/types";
import { mandateRange } from "@/lib/utils";

const CONTEXT_METRICS = [
  { label: "Desempleo", value: "5.7%", color: "text-emerald-600", trend: "positive" },
  { label: "Pobreza", value: "41.7%", color: "text-emerald-600", trend: "positive" },
  { label: "Inflación", value: "211.4%", color: "text-red-600", trend: "negative" },
] as const;

function MiniSparkline({ positive }: { positive: boolean }) {
  const points = positive ? "0,4 2,2 4,3 6,1 8,2" : "0,1 2,3 4,2 6,4 8,3";
  return (
    <svg viewBox="0 0 8 4" className="w-full h-4 mt-1" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
        className={positive ? "text-emerald-500" : "text-red-500"}
      />
    </svg>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium text-pure-black">{title}</h2>
        {subtitle && <span className="text-[10px] uppercase tracking-widest text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function DecreeCard({ decree }: { decree: DecreeOrResolution }) {
  const typeLabels: Record<string, { label: string; color: string }> = {
    dnu: { label: "DNU", color: "bg-purple-100 text-purple-700" },
    decreto: { label: "Decreto", color: "bg-blue-100 text-blue-700" },
    resolucion: { label: "Resolución", color: "bg-green-100 text-green-700" },
  };

  const typeInfo = typeLabels[decree.type] || typeLabels.decreto;

  return (
    <div className="glass-card-dash p-4 rounded-2xl border border-black/5">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">{decree.number}</span>
      </div>
      <p className="text-sm text-pure-black line-clamp-2 mb-2">{decree.summary}</p>
      <p className="text-[10px] text-gray-400">
        {new Date(decree.date).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

export default function ExecutivePage() {
  const router = useRouter();
  const authorities = getExecutiveAuthorities();
  const decrees = getExecutiveDecrees();

  const president = authorities.find((a) =>
    a.role_title.toLowerCase().includes("president")
  );
  const vicePresident = authorities.find((a) =>
    a.role_title.toLowerCase().includes("vice")
  );
  const ministers = authorities.filter(
    (a) =>
      !a.role_title.toLowerCase().includes("president") &&
      !a.role_title.toLowerCase().includes("vice")
  );

  // Categorizar decretos
  const dnus = decrees.filter(d => d.type === "dnu").slice(0, 3);
  const regularDecrees = decrees.filter(d => d.type === "decreto").slice(0, 3);
  const resolutions = decrees.filter(d => d.type === "resolucion").slice(0, 3);

  return (
    <div className="p-6 md:p-8 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-pure-black">
          Ejecutivo Nacional
        </h1>
        <p className="text-sm text-pure-black/80 font-normal">
          Estructura jerárquica, decisiones y relación con el Congreso.
        </p>
      </div>

      {/* ── 1. PRESIDENTE ─────────────────────────────────── */}
      <Section title="Presidente" subtitle="Información y actividad">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Info del Presidente */}
          <div className="lg:col-span-5">
            {president && (
              <div className="glass-card-dash rounded-2xl p-6 border border-black/5">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={president.photo_url}
                      alt={president.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-0.5">
                      Jefe de Estado
                    </p>
                    <h2 className="font-serif text-xl font-semibold text-pure-black">
                      {president.full_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Mandato {mandateRange(president.started_at, president.ended_at)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                      Partido La Libertad Avanza
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 text-sm">Activo</span>
                      </span>
                    </p>
                  </div>
                </div>

                {/* Vicepresidente */}
                {vicePresident && (
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={vicePresident.photo_url}
                        alt={vicePresident.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Vicepresidente</p>
                      <p className="text-sm font-medium text-pure-black">{vicePresident.full_name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Métricas de Contexto */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-3 gap-4">
              {CONTEXT_METRICS.map((m) => (
                <div
                  key={m.label}
                  className="glass-card-dash rounded-2xl p-4 border border-black/5"
                >
                  <p className="text-sm text-pure-black font-normal">{m.label}</p>
                  <p className={`font-serif text-2xl font-light mt-1 ${m.color}`}>
                    {m.value}
                  </p>
                  <MiniSparkline positive={m.trend === "positive"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad del Presidente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card-dash p-4 rounded-2xl border border-black/5 text-center">
            <span className="material-symbols-outlined text-gray-400 text-[20px] mb-2">mic</span>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Discursos</p>
            <p className="text-2xl font-mono font-semibold text-pure-black">24</p>
            <p className="text-xs text-gray-400">Último mes</p>
          </div>
          <div className="glass-card-dash p-4 rounded-2xl border border-black/5 text-center">
            <span className="material-symbols-outlined text-gray-400 text-[20px] mb-2">campaign</span>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Anuncios</p>
            <p className="text-2xl font-mono font-semibold text-pure-black">12</p>
            <p className="text-xs text-gray-400">Oficiales</p>
          </div>
          <Link
            href="/dashboard/congress"
            className="glass-card-dash p-4 rounded-2xl border border-black/5 text-center hover:bg-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-blue-500 text-[20px] mb-2">handshake</span>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Relación Congreso</p>
            <p className="text-sm font-medium text-pure-black">Ver actividad</p>
            <p className="text-xs text-blue-500">Enlace →</p>
          </Link>
        </div>
      </Section>

      {/* ── 2. DECISIONES DEL EJECUTIVO ─────────────────────── */}
      <Section title="Decisiones del Ejecutivo" subtitle="Normativa y políticas públicas">
        {/* DNU (Decretos de Necesidad y Urgencia) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">DNUs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dnus.map((d) => (
              <DecreeCard key={d.id} decree={d} />
            ))}
            {dnus.length === 0 && (
              <p className="text-sm text-gray-400 col-span-3">Sin DNUs registrados</p>
            )}
          </div>
        </div>

        {/* Decretos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Decretos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regularDecrees.map((d) => (
              <DecreeCard key={d.id} decree={d} />
            ))}
            {regularDecrees.length === 0 && (
              <p className="text-sm text-gray-400 col-span-3">Sin decretos recientes</p>
            )}
          </div>
        </div>

        {/* Resoluciones */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Regulaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resolutions.map((d) => (
              <DecreeCard key={d.id} decree={d} />
            ))}
            {resolutions.length === 0 && (
              <p className="text-sm text-gray-400 col-span-3">Sin resoluciones recientes</p>
            )}
          </div>
        </div>

        {/* Políticas Públicas */}
        <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-gray-400 text-[18px]">policy</span>
            <h3 className="text-sm font-semibold text-pure-black">Políticas Públicas Activas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Economía", "Seguridad", "Salud", "Educación"].map((area) => (
              <div key={area} className="p-3 rounded-lg bg-black/5">
                <p className="text-sm font-medium text-pure-black">{area}</p>
                <p className="text-[10px] text-gray-400">5 iniciativas activas</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 3. GABINETE DE MINISTROS ────────────────────────── */}
      <Section title="Gabinete de Ministros" subtitle="Composición actual">
        <DepthDeckCarousel 
          authorities={ministers} 
          onSelect={(authority) => router.push(`/dashboard/executive/${authority.id}`)}
        />
      </Section>

      {/* ── 4. RELACIÓN CON EL CONGRESO ─────────────────────── */}
      <Section title="Relación con el Congreso" subtitle="Proyectos impulsados y alineación">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proyectos impulsados */}
          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[18px]">description</span>
                <h3 className="text-sm font-semibold text-pure-black">Proyectos impulsados</h3>
              </div>
              <Link href="/dashboard/topics" className="text-xs text-gray-400 hover:text-black">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { title: "Bases para la reconstrucción económica", status: "En debate", urgency: "Alta" },
                { title: "Reforma previsional", status: "Aprobado", urgency: "Media" },
                { title: "Ley de administración financiera", status: "En comisión", urgency: "Alta" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                  <div>
                    <p className="text-sm text-pure-black">{p.title}</p>
                    <p className="text-[10px] text-gray-400">Estado: {p.status}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    p.urgency === "Alta" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.urgency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alineación legislativa */}
          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">account_tree</span>
              <h3 className="text-sm font-semibold text-pure-black">Alineación Legislativa</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Apoyo en Diputados</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "68%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Apoyo en Senado</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Proyectos aprobados</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "82%" }} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/5">
              <Link
                href="/dashboard/congress"
                className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
              >
                Ver actividad en el Congreso
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. ÚLTIMAS NOTICIAS ─────────────────────────────── */}
      <Section title="Últimas Noticias" subtitle="Actividad reciente">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decrees.slice(0, 3).map((news) => (
            <div
              key={news.id}
              className="glass-card-dash rounded-2xl overflow-hidden border border-black/5"
            >
              <div className="aspect-[16/10] bg-gray-200 relative">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"
                  style={{ filter: "grayscale(1)" }}
                />
              </div>
              <div className="p-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  news.type === "dnu" ? "bg-purple-100 text-purple-700" :
                  news.type === "decreto" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {news.type === "dnu" ? "DNU" : news.type === "decreto" ? "Decreto" : "Resolución"}
                </span>
                <h3 className="font-semibold text-pure-black text-sm leading-snug line-clamp-2 mt-2">
                  {news.summary.length > 60 ? news.summary.slice(0, 60) + "…" : news.summary}
                </h3>
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  — Boletín Oficial • {new Date(news.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function MinisterCard({ auth }: { auth: ExecutiveAuthority }) {
  return (
    <div className="glass-card-dash rounded-2xl p-4 border border-black/5 min-w-[200px] shrink-0">
      <div className="flex items-start gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100">
          <Image
            src={auth.photo_url}
            alt={auth.full_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-pure-black text-sm truncate">
            {auth.full_name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {auth.ministry_or_area || auth.role_title}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {mandateRange(auth.started_at, auth.ended_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
