import Link from "next/link";
import { getDashboardStats, getRecentBills, getAllPoliticians } from "@/lib/data-supabase";

const quickAccessModules = [
  { name: "Agenda del día", href: "/dashboard/congress", icon: "calendar_today", description: "Sesiones y eventos" },
  { name: "Intervenciones", href: "/dashboard/congress", icon: "record_voice_over", description: "Discursos en recinto" },
  { name: "Votaciones", href: "/dashboard/analytics", icon: "how_to_vote", description: "Votos y alineación" },
  { name: "Legisladores", href: "/dashboard/politicians", icon: "groups", description: "Más participación" },
  { name: "Proyectos", href: "/dashboard/topics", icon: "gavel", description: "Decisiones clave" },
  { name: "Mapa político", href: "/dashboard/analytics", icon: "account_tree", description: "Alianzas y redes" },
];

const latestNews = [
  { id: "n1", title: "Senado aprueba reforma previsional con modificaciones", excerpt: "El proyecto fue aprobado por 38 votos a favor y 31 en contra.", image: "https://images.unsplash.com/photo-1541872703-74c5e44318f2?w=400&h=250&fit=crop", source: "Ámbito", date: "2024-12-15" },
  { id: "n2", title: "Diputados debaten nuevo régimen de contratos de trabajo", excerpt: "La iniciativa busca modernizar las normas laborales para el trabajo remoto.", image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=250&fit=crop", source: "La Nación", date: "2024-12-14" },
  { id: "n3", title: "Presidente anuncia inversión en infraestructura energética", excerpt: "El plan incluye obras en cinco provincias.", image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=250&fit=crop", source: "Clarín", date: "2024-12-13" },
  { id: "n4", title: "Nuevo proyecto de ley busca regular inteligencia artificial", excerpt: "La iniciativa propone un marco regulatorio para sistemas de IA.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop", source: "Infobae", date: "2024-12-12" },
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const politicians = await getAllPoliticians();
  const recentBills = await getRecentBills(6);

  const mostActivePoliticians = [...politicians]
    .sort((a, b) => (b.activity_score || 0) - (a.activity_score || 0))
    .slice(0, 5);

  const statsCards = [
    { label: "Legisladores", value: stats.total_politicians, icon: "groups", color: "text-blue-600" },
    { label: "Votaciones", value: stats.total_votes, icon: "how_to_vote", color: "text-red-500" },
    { label: "Sesiones", value: stats.total_sessions, icon: "gavel", color: "text-gray-600" },
    { label: "Proyectos", value: recentBills.length > 0 ? "1000+" : "0", icon: "description", color: "text-emerald-600" },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Panorama Legislativo</p>
          <h1 className="font-serif text-3xl font-light text-gray-900 tracking-tight">
            Buenos días, Argentina
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <button className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-full hover:bg-black/5">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <Link href="/dashboard/alerts" className="p-2 text-gray-400 hover:text-gray-800 transition-colors rounded-full hover:bg-black/5 relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
          </Link>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((s) => (
          <div key={s.label} className="glass-card-dash p-5 rounded-2xl flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{s.label}</span>
              <span className={`material-symbols-outlined text-[18px] ${s.color} opacity-40`}>{s.icon}</span>
            </div>
            <div>
              <span className={`font-mono text-[36px] leading-none tracking-tighter ${s.color}`}>{s.value}</span>
              <p className="text-[10px] text-gray-400 mt-1">en base de datos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">

        {/* Noticias — 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Últimas Noticias</h2>
            <Link href="/dashboard/news" className="text-[10px] text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-1">
              Ver más <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {latestNews.map((news, i) => (
              <a key={news.id} href="#" className={`glass-card-dash rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col ${i === 0 ? "col-span-2 flex-row h-44" : ""}`}>
                <div className={`relative overflow-hidden flex-shrink-0 ${i === 0 ? "w-64 h-full" : "h-28 w-full"}`}>
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider">{news.source}</span>
                      <span className="text-[9px] text-gray-300">·</span>
                      <span className="text-[9px] text-gray-400">{new Date(news.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                    </div>
                    <h3 className={`font-medium text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug ${i === 0 ? "text-sm" : "text-xs"}`}>{news.title}</h3>
                  </div>
                  {i === 0 && <p className="text-xs text-gray-500 line-clamp-2 mt-2">{news.excerpt}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Legisladores activos — 4 cols */}
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Más activos</h2>
            <Link href="/dashboard/politicians" className="text-[10px] text-gray-400 hover:text-gray-800 transition-colors">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {mostActivePoliticians.map((pol, i) => (
              <Link
                key={pol.id}
                href={`/dashboard/politicians/${pol.id}`}
                className="glass-card-dash p-3 rounded-xl flex gap-3 items-center hover:bg-white/40 transition-all group"
              >
                <span className="text-[10px] font-mono text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/5">
                  <img src={pol.photo_url || "/default-avatar.png"} alt={pol.full_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate group-hover:text-gray-900">{pol.full_name}</p>
                  <p className="text-[9px] text-gray-400 truncate">{(pol as any).bloc || "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-gray-500">{Math.round((pol.activity_score || 0) * 100)}%</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Accesos rápidos — 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickAccessModules.map((m) => (
              <Link key={m.name} href={m.href} className="glass-card-dash p-4 rounded-xl hover:bg-white/40 transition-all group text-center">
                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center mb-2 mx-auto group-hover:bg-black/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-gray-500">{m.icon}</span>
                </div>
                <p className="text-[10px] font-medium text-gray-700 leading-tight">{m.name}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{m.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Proyectos recientes — 7 cols */}
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Proyectos recientes</h2>
            <Link href="/dashboard/topics" className="text-[10px] text-gray-400 hover:text-gray-800 transition-colors">Ver todo →</Link>
          </div>
          <div className="glass-card-dash rounded-2xl overflow-hidden">
            {recentBills.slice(0, 5).map((bill, i) => (
              <div key={bill.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/30 transition-colors ${i < 4 ? "border-b border-black/5" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{bill.title || "Sin título"}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5 font-mono">{bill.external_id || bill.number || "—"}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                  bill.status === "passed" ? "bg-emerald-100 text-emerald-700" :
                  bill.status === "rejected" ? "bg-red-100 text-red-600" :
                  bill.status === "committee" ? "bg-amber-100 text-amber-700" :
                  bill.status === "floor" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {bill.status === "passed" ? "Aprobado" :
                   bill.status === "rejected" ? "Rechazado" :
                   bill.status === "committee" ? "En comisión" :
                   bill.status === "floor" ? "En debate" : "Ingresado"}
                </span>
              </div>
            ))}
            {recentBills.length === 0 && (
              <div className="px-5 py-8 text-center text-xs text-gray-400">Sin proyectos registrados aún.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}