"use client";

import Link from "next/link";
import { useRef } from "react";

// ── Mock data (reemplazar con Supabase cuando se raspe) ────────────────────────

const PRESIDENT = {
  name: "Javier Milei",
  role: "Presidente de la Nación Argentina",
  party: "La Libertad Avanza",
  mandate: "2023 – 2027",
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Javier_Milei_2023.jpg/800px-Javier_Milei_2023.jpg",
  vicePresident: { name: "Victoria Villarruel", photo: "" },
};

const APPROVAL_DATA = [85, 78, 72, 68, 62, 48.5];
const APPROVAL_LABELS = ["Dic 23", "Feb 24", "May 24", "Jul 24", "Sep 24", "Oct 24"];

const INDICATORS = [
  { label: "Inflación (m.a.m)", value: "13.2%", trend: "down", color: "text-emerald-600", bg: "bg-emerald-50", badge: "-7.4%" },
  { label: "Tasa de Pobreza",   value: "41.7%", trend: "up",   color: "text-red-600",     bg: "bg-red-50",     badge: "+1.5%" },
  { label: "Crecimiento PBI",   value: "-1.6%", trend: "up",   color: "text-red-600",     bg: "bg-red-50",     badge: "-0.2%" },
];

const CABINET = [
  { id: "1", name: "Manuel Adorni",              ministry: "Jefatura de Gabinete",    photo: "" },
  { id: "2", name: "Luis Andrés Caputo",         ministry: "Ministerio de Economía",  photo: "" },
  { id: "3", name: "Sandra Pettovello",          ministry: "Min. Capital Humano",     photo: "" },
  { id: "4", name: "Alejandra Monteoliva",       ministry: "Ministerio de Seguridad", photo: "" },
  { id: "5", name: "Carlos Alberto Presti",      ministry: "Ministerio de Defensa",   photo: "" },
  { id: "6", name: "Diego César Santilli",       ministry: "Ministerio del Interior", photo: "" },
  { id: "7", name: "Juan Bautista Mahiques",     ministry: "Ministerio de Justicia",  photo: "" },
  { id: "8", name: "Pablo Quirno Magrane",       ministry: "Relaciones Exteriores",   photo: "" },
  { id: "9", name: "Mario Iván Lugones",         ministry: "Ministerio de Salud",     photo: "" },
  { id: "10", name: "Federico Sturzenegger",     ministry: "Min. de Desregulación",   photo: "" },
];

const SPEECHES = [
  { quote: "No hay alternativa al ajuste y no hay alternativa al shock. ¡Viva la libertad!", time: "Hace 2 horas" },
  { quote: "Estamos terminando con la inflación para siempre. El esfuerzo de los argentinos valdrá la pena.", time: "Hace 5 horas" },
];

const SPEECH_TOPICS = [
  { label: "Economía",          pct: 64 },
  { label: "Seguridad",         pct: 18 },
  { label: "Instituciones",     pct: 12 },
  { label: "Política Exterior", pct: 6  },
];

const RECENT_ACTIONS = [
  { type: "DNU", typeColor: "bg-purple-100 text-purple-700", title: "Revisión Ley Ómnibus: Sección IV", date: "Oct 24, 2024", description: "Enmiendas a regulaciones del sector energético destinadas a aumentar cuotas de inversión y liberalizar acuerdos comerciales transfronterizos.", status: "Vigente", statusColor: "text-emerald-600" },
  { type: "Decreto", typeColor: "bg-blue-100 text-blue-700", title: "Expansión del Protocolo de Seguridad Federal", date: "Oct 21, 2024", description: "Implementación de nuevas tecnologías de vigilancia en nodos de transporte de alto tráfico.", status: "Implementando", statusColor: "text-amber-600" },
  { type: "Resolución", typeColor: "bg-green-100 text-green-700", title: "Reforma Previsional — Ajuste de Haberes", date: "Oct 18, 2024", description: "Actualización trimestral de haberes jubilatorios según índice de inflación.", status: "Aprobado", statusColor: "text-emerald-600" },
];

const CONGRESS_RELATION = {
  diputados: 68,
  senado: 45,
  aprobados: 82,
  label: "Polarizado",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-28 h-28" : size === "md" ? "w-16 h-16" : "w-9 h-9";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return src ? (
    <img src={src} alt={name} className={`${sz} rounded-full object-cover border-2 border-white/40 shadow-sm grayscale`} />
  ) : (
    <div className={`${sz} rounded-full bg-gray-200 border-2 border-white/40 shadow-sm flex items-center justify-center`}>
      <span className="text-gray-500 font-bold text-sm">{initials}</span>
    </div>
  );
}

function ProgressBar({ value, color = "bg-black" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExecutivePage() {
  const cabinetRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-12 pb-12">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Poder Ejecutivo</p>
        <h1 className="font-serif text-3xl font-light text-gray-900">Ejecutivo Nacional</h1>
      </div>

      {/* ── 1. PRESIDENTE ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Card presidente */}
        <div className="lg:col-span-7 glass-card-dash rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative shrink-0">
            <Avatar src={PRESIDENT.photo} name={PRESIDENT.name} size="lg" />
            <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Activo</span>
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-1">{PRESIDENT.name}</h2>
            <p className="text-gray-500 text-base mb-4">{PRESIDENT.role}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="text-xs text-gray-600 bg-white/30 px-3 py-1.5 rounded-full border border-black/5">
                Vicepresidente: <span className="font-semibold text-gray-800">{PRESIDENT.vicePresident.name}</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mandato: {PRESIDENT.mandate}</span>
            </div>
          </div>
        </div>

        {/* Aprobación */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl font-bold text-gray-900">Aprobación</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Oct 2024</span>
          </div>
          <div className="glass-card-dash p-5 rounded-3xl">
            <div className="flex items-end gap-1.5 h-28 mb-4">
              {APPROVAL_DATA.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full relative group">
                  <div
                    className={`w-full rounded-t-md transition-all ${i === APPROVAL_DATA.length - 1 ? "bg-gray-900" : "bg-black/10"}`}
                    style={{ height: `${v}%` }}
                  />
                  {i === APPROVAL_DATA.length - 1 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap">{v}%</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider border-t border-black/5 pt-3 font-mono">
              {APPROVAL_LABELS.map(l => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. INDICADORES + VOCES + CONGRESO ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Indicadores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xl font-bold text-gray-900">Indicadores</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tiempo Real</span>
          </div>
          {INDICATORS.map(ind => (
            <div key={ind.label} className="glass-card-dash p-5 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{ind.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.trend === "down" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>{ind.badge}</span>
              </div>
              <p className={`font-mono text-3xl font-bold ${ind.color} mb-3`}>{ind.value}</p>
              <ProgressBar value={ind.trend === "down" ? 65 : 80} color={ind.trend === "down" ? "bg-emerald-500" : "bg-red-500"} />
            </div>
          ))}
        </div>

        {/* Últimas voces + Foco discursos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Últimas voces */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif text-xl font-bold text-gray-900 px-1">Últimas Voces</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPEECHES.map((s, i) => (
                <div key={i} className="glass-card-dash p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={PRESIDENT.photo} name={PRESIDENT.name} size="sm" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">{s.time}</span>
                  </div>
                  <p className="text-sm text-gray-800 italic leading-relaxed">"{s.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Relación con el Congreso */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-gray-900 px-1">Relación con el Congreso</h3>
            <div className="glass-card-dash p-5 rounded-3xl h-full flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3"
                      strokeDasharray={`${CONGRESS_RELATION.diputados * 0.32} 100`}
                      strokeLinecap="round" className="text-gray-900" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold font-mono">{CONGRESS_RELATION.diputados}%</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Diputados", value: CONGRESS_RELATION.diputados },
                    { label: "Senado",    value: CONGRESS_RELATION.senado },
                    { label: "Aprobados", value: CONGRESS_RELATION.aprobados },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-baseline">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.label}</span>
                      <span className="font-bold text-base font-mono">{r.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-black/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Estado: {CONGRESS_RELATION.label}</p>
                </div>
                <p className="text-xs text-gray-500 leading-snug">Alta dependencia de alianzas provinciales y bloques regionales.</p>
                <Link href="/dashboard/congress" className="text-[10px] text-gray-400 hover:text-gray-800 flex items-center gap-1 mt-3 transition-colors">
                  Ver actividad legislativa <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Foco de discursos */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-gray-900 px-1">Foco de Discursos</h3>
            <div className="glass-card-dash p-5 rounded-3xl h-full space-y-5">
              {SPEECH_TOPICS.map(t => (
                <div key={t.label} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.label}</span>
                    <span className="text-[10px] font-bold font-mono text-gray-900">{t.pct}%</span>
                  </div>
                  <ProgressBar value={t.pct} color={t.pct > 50 ? "bg-gray-900" : t.pct > 15 ? "bg-gray-500" : "bg-gray-300"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. GABINETE ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-3xl font-bold text-gray-900">El Gabinete</h3>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Equipo de Liderazgo</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => cabinetRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
              className="w-8 h-8 rounded-full glass-card-dash flex items-center justify-center hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={() => cabinetRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
              className="w-8 h-8 rounded-full glass-card-dash flex items-center justify-center hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
        <div ref={cabinetRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {CABINET.map((m, i) => (
            <div key={m.id} className={`flex-none w-64 glass-card-dash p-6 rounded-3xl flex flex-col items-center text-center transition-transform hover:scale-[1.02] ${i === 0 ? "border-l-4 border-gray-900" : ""}`}>
              <Avatar src={m.photo} name={m.name} size="md" />
              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-4 mb-1">{m.ministry}</p>
              <h4 className="font-bold text-gray-900 text-base leading-tight">{m.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. ACCIONES RECIENTES ─────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="font-serif text-3xl font-bold text-gray-900">Acciones Recientes</h3>
          <div className="h-px bg-black/10 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card grande */}
          <div className="md:col-span-8 glass-card-dash p-8 rounded-3xl">
            <div className="flex justify-between items-start mb-5">
              <div className="space-y-2">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${RECENT_ACTIONS[0].typeColor}`}>{RECENT_ACTIONS[0].type}</span>
                <h4 className="font-serif text-2xl font-bold text-gray-900">{RECENT_ACTIONS[0].title}</h4>
              </div>
              <span className="text-xs text-gray-400 font-mono font-bold flex-shrink-0 ml-4">{RECENT_ACTIONS[0].date}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{RECENT_ACTIONS[0].description}</p>
            <button className="px-6 py-2 border border-black/10 rounded-full text-xs font-bold hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">
              Ver Decreto Completo
            </button>
          </div>
          {/* Cards pequeñas */}
          <div className="md:col-span-4 space-y-4">
            {RECENT_ACTIONS.slice(1).map((a, i) => (
              <div key={i} className="glass-card-dash p-6 rounded-3xl flex flex-col justify-between h-[calc(50%-8px)]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${a.typeColor}`}>{a.type}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{a.date.split(",")[0]}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug mb-2">{a.title}</h4>
                  <p className="text-xs text-gray-500 leading-snug line-clamp-2">{a.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className={`text-xs font-bold uppercase tracking-tighter ${a.statusColor}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}