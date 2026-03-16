import Link from "next/link";
import { getDashboardStats, getRecentBills, getAllPoliticians } from "@/lib/data-supabase";

const TOPICS = [
  "Economía", "Seguridad", "Educación", "Salud",
  "Medioambiente", "Infraestructura", "Justicia", "Tecnología",
];

const NEWS = [
  {
    id: "n1",
    category: "Infraestructura",
    title: "Acuerdo bipartidario en proyecto de infraestructura digital",
    time: "Hace 2h",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44318f2?w=800&h=600&fit=crop",
  },
  {
    id: "n2",
    category: "Política Fiscal",
    title: "Análisis de cambios en alícuotas impositivas 2024",
    time: "Hace 5h",
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop",
  },
  {
    id: "n3",
    category: "Medioambiente",
    title: "Expansión de áreas protegidas en el norte patagónico",
    time: "Hace 1d",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop",
  },
];

// Heatmap data generator
function generateHeatmap(seed: number) {
  const cells = [];
  for (let i = 0; i < 52; i++) {
    const v = Math.sin(i * 0.3 + seed) * 0.5 + 0.5;
    const level = v > 0.8 ? 5 : v > 0.6 ? 4 : v > 0.4 ? 3 : v > 0.2 ? 2 : v > 0.1 ? 1 : 0;
    cells.push(level);
  }
  return cells;
}

const HEATMAP_COLORS = [
  "bg-emerald-50 border border-black/5",
  "bg-emerald-100",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-600",
  "bg-emerald-800",
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const politicians = await getAllPoliticians();
  const recentBills = await getRecentBills(6);

  const following = [...politicians]
    .sort((a, b) => (b.activity_score || 0) - (a.activity_score || 0))
    .slice(0, 5);

  const heatmapRows = [
    { label: "L", cells: generateHeatmap(0) },
    { label: "M", cells: generateHeatmap(1) },
    { label: "V", cells: generateHeatmap(2) },
  ];

  return (
    <div className="space-y-10">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Panorama legislativo en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-black/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <Link href="/dashboard/alerts" className="relative p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-black/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gray-500 rounded-full border border-white"></span>
          </Link>
        </div>
      </header>

      {/* ── Following ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Siguiendo</h2>
          <Link href="/dashboard/politicians" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            + Ver más
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {following.map((pol) => (
            <Link
              key={pol.id}
              href={`/dashboard/politicians/${pol.id}`}
              className="glass-card-dash p-3 rounded-xl flex items-center gap-3 hover:bg-white/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                {pol.photo_url ? (
                  <img src={pol.photo_url} alt={pol.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">{pol.full_name?.[0]}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-gray-800 truncate">{pol.full_name?.split(" ")[0]} {pol.full_name?.split(" ").slice(-1)[0]}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-tight truncate">{(pol as any).bloc?.split(" ").slice(0, 2).join(" ") || "—"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Live Session + Heatmap ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sesión en vivo */}
        <section className="glass-card-dash rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">En Vivo</span>
            </div>
            <span className="text-[9px] text-gray-400 font-mono">ID: SES-42-2024</span>
          </div>
          <div className="flex gap-5 items-start">
            <div className="w-40 aspect-video rounded-xl overflow-hidden border border-black/5 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop"
                alt="Sesión en vivo"
                className="w-full h-full object-cover grayscale-[0.3]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-base font-bold text-gray-900 leading-snug mb-2">
                Sesión Plenaria Ordinaria n.º 42
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                Debate sobre reforma del Presupuesto General 2024. Votación de enmiendas en curso.
              </p>
              <div className="mt-4 flex gap-3">
                <Link href="/dashboard/congress" className="flex items-center gap-1.5 bg-black/5 hover:bg-black/10 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-black/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">visibility</span> Ver sesión
                </Link>
                <Link href="/dashboard/congress" className="text-gray-400 hover:text-gray-700 text-[10px] font-bold px-3 py-1.5 transition-colors">
                  Transcripción
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Heatmap de actividad */}
        <section className="glass-card-dash rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-sm font-bold text-gray-900">Actividad Legislativa</h2>
            <span className="text-[9px] text-gray-400">Últimos 12 meses</span>
          </div>
          <div className="bg-white/20 p-4 rounded-xl border border-black/5">
            <div className="space-y-1.5">
              {heatmapRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="text-[7px] text-gray-400 w-3">{row.label}</span>
                  <div className="flex gap-[1.5px] flex-1">
                    {row.cells.map((level, i) => (
                      <div
                        key={i}
                        className={`w-[6px] h-[6px] rounded-[1px] flex-shrink-0 ${HEATMAP_COLORS[level]}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[8px] text-gray-400">Registro de sesiones y votaciones</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-gray-400">Menos</span>
                <div className="flex gap-0.5">
                  {[0,1,2,3,4,5].map(l => (
                    <div key={l} className={`w-2 h-2 rounded-sm ${HEATMAP_COLORS[l]}`} />
                  ))}
                </div>
                <span className="text-[8px] text-gray-400">Más</span>
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Legisladores", value: stats.total_politicians },
              { label: "Sesiones", value: stats.total_sessions },
              { label: "Votaciones", value: stats.total_votes },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-mono text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Noticias apiladas + Tópicos ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Stacked news deck */}
        <section className="w-full lg:w-1/2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-gray-900">Últimas Noticias</h2>
            <Link href="/dashboard/news" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors flex items-center gap-1">
              Ver archivo <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          {/* Stacked deck */}
          <div className="relative h-72 w-64 ml-4">
            {[...NEWS].reverse().map((news, i) => {
              const idx = NEWS.length - 1 - i;
              return (
                <div
                  key={news.id}
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-black/5 shadow-xl transition-all duration-400"
                  style={{
                    zIndex: idx + 10,
                    transform: `translateX(${idx * 12}px) translateY(${-idx * 8}px) scale(${1 - idx * 0.02})`,
                    opacity: 1 - idx * 0.1,
                  }}
                >
                  <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-1 block">{news.category}</span>
                    <h3 className="text-sm font-bold text-white leading-tight">{news.title}</h3>
                    {idx === NEWS.length - 1 && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[9px] text-white/60 font-mono">{news.time}</span>
                        <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tópicos */}
        <section className="w-full lg:w-1/2">
          <div className="mb-6 h-[27px]" />
          <div className="glass-card-dash p-8 rounded-2xl h-72 flex flex-col justify-center">
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Tópicos que sigo</h2>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <Link
                  key={topic}
                  href="/dashboard/topics"
                  className="flex items-center gap-1.5 bg-white/40 px-4 py-2 rounded-full text-xs font-medium border border-black/5 hover:bg-white/70 hover:border-black/10 cursor-pointer transition-all"
                >
                  <span className="text-gray-400 opacity-50">#</span>
                  {topic}
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">settings</span>
                Gestionar suscripciones
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Proyectos recientes ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-gray-900">Proyectos Recientes</h2>
          <Link href="/dashboard/topics" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="glass-card-dash rounded-2xl overflow-hidden">
          {recentBills.slice(0, 5).map((bill, i) => (
            <div key={bill.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-white/30 transition-colors ${i < 4 ? "border-b border-black/5" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{bill.title || "Sin título"}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">{bill.external_id || bill.number || "—"}</p>
              </div>
              <span className={`text-[9px] px-2.5 py-1 rounded-full flex-shrink-0 font-medium ${
                bill.status === "passed"    ? "bg-emerald-100 text-emerald-700" :
                bill.status === "rejected" ? "bg-red-100 text-red-600" :
                bill.status === "committee"? "bg-amber-100 text-amber-700" :
                bill.status === "floor"    ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-500"
              }`}>
                {bill.status === "passed"    ? "Aprobado"   :
                 bill.status === "rejected"  ? "Rechazado"  :
                 bill.status === "committee" ? "En comisión":
                 bill.status === "floor"     ? "En debate"  : "Ingresado"}
              </span>
            </div>
          ))}
          {recentBills.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">Sin proyectos registrados aún.</div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 pt-6 text-center">
        <p className="text-[10px] text-gray-400 font-mono">© 2025 Alethia · Datos fuente: registros oficiales</p>
      </footer>

    </div>
  );
}