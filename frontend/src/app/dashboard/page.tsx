import Link from "next/link";
import {
  getDashboardStats,
  getRecentBills,
  getAllPoliticians,
} from "@/lib/data-supabase";
import { DashboardActivityChart } from "./dashboard-activity-chart";

// Módulos de acceso rápido según el mapa de la plataforma
const quickAccessModules = [
  {
    name: "Agenda del día",
    href: "/dashboard/congress",
    icon: "calendar_today",
    description: "Sesiones y eventos",
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Intervenciones",
    href: "/dashboard/congress",
    icon: "record_voice_over",
    description: "Discursos en recinto",
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Votaciones",
    href: "/dashboard/analytics",
    icon: "how_to_vote",
    description: "Votos y alineación",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Legisladores activos",
    href: "/dashboard/politicians",
    icon: "groups",
    description: "Más participación",
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Votaciones importantes",
    href: "/dashboard/analytics",
    icon: "gavel",
    description: "Decisiones clave",
    color: "bg-red-50 text-red-600",
  },
  {
    name: "Mapa político",
    href: "/dashboard/analytics",
    icon: "account_tree",
    description: "Alianzas y redes",
    color: "bg-indigo-50 text-indigo-600",
  },
];

// Mock news data for the news section
const latestNews = [
  {
    id: "n1",
    title: "Senado aprueba reforma previsional con modificaciones",
    excerpt: "El proyecto fue aprobado por 38 votos a favor y 31 en contra. Se espera que pase a la Cámara de Diputados la próxima semana.",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44318f2?w=400&h=250&fit=crop",
    source: "Ámbito Financiero",
    date: "2024-12-15",
  },
  {
    id: "n2",
    title: "Diputados debaten nuevo régimen de contratos de trabajo",
    excerpt: "La iniciativa busca modernizar las normas laborales para adaptarse al trabajo remoto y las nuevas tecnologías.",
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=250&fit=crop",
    source: "La Nación",
    date: "2024-12-14",
  },
  {
    id: "n3",
    title: "Presidente anuncia inversión en infraestructura energética",
    excerpt: "El plan incluye obras en cinco provincias y busca garantizar el suministro eléctrico para los próximos años.",
    image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=250&fit=crop",
    source: "Clarín",
    date: "2024-12-13",
  },
  {
    id: "n4",
    title: "Nuevo proyecto de ley busca regular inteligencia artificial",
    excerpt: "La iniciativa propone un marco regulatorio para el desarrollo y uso de sistemas de IA en el país.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
    source: "Infobae",
    date: "2024-12-12",
  },
];

// Datos mock para actividad mensual (hasta tener datos reales)
const monthlyActivityMock = [
  { month: "Ene", sesiones: 12, discursos: 145, votos: 8 },
  { month: "Feb", sesiones: 14, discursos: 189, votos: 12 },
  { month: "Mar", sesiones: 16, discursos: 234, votos: 15 },
  { month: "Abr", sesiones: 13, discursos: 167, votos: 10 },
  { month: "May", sesiones: 15, discursos: 198, votos: 14 },
  { month: "Jun", sesiones: 18, discursos: 245, votos: 18 },
];

export default async function DashboardPage() {
  // Cargar datos desde Supabase
  const stats = await getDashboardStats();
  const politicians = await getAllPoliticians();
  const recentBills = await getRecentBills(6);

  // Legisladores más activos (top 3 por activity_score)
  const mostActivePoliticians = [...politicians]
    .sort((a, b) => (b.activity_score || 0) - (a.activity_score || 0))
    .slice(0, 3);

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Panorama Legislativo
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Vista integral de la actividad política y legislativa
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link
            href="/dashboard/alerts"
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5 relative"
          >
            <span className="material-symbols-outlined">notifications</span>
          </Link>
        </div>
      </header>

      {/* Últimas Noticias */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Últimas Noticias
          </h2>
          <Link
            href="/dashboard/news"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
          >
            Ver más
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestNews.map((news) => (
            <a
              key={news.id}
              href="#"
              className="glass-card-dash rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium text-blue-600">{news.source}</span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(news.date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-pure-black mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {news.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {news.excerpt}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Accesos rápidos según mapa */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickAccessModules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="glass-card-dash p-4 rounded-xl hover:shadow-md transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg ${module.color} flex items-center justify-center mb-2`}>
                <span className="material-symbols-outlined text-[18px]">
                  {module.icon}
                </span>
              </div>
              <h4 className="text-sm font-medium text-pure-black mb-0.5">
                {module.name}
              </h4>
              <p className="text-[10px] text-gray-400">{module.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Legisladores
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[18px]">campaign</span>
          </div>
          <div>
            <span className="font-mono text-[40px] leading-none text-muted-blue tracking-tighter">
              {stats.total_politicians}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <span className="material-symbols-outlined text-[12px] text-muted-green">arrow_upward</span>
              <span>en base de datos</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Votaciones
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[18px]">how_to_vote</span>
          </div>
          <div>
            <span className="font-mono text-[40px] leading-none text-muted-red tracking-tighter">
              {String(stats.total_votes).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <span>Registradas</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Sesiones
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[18px]">gavel</span>
          </div>
          <div>
            <span className="font-mono text-[40px] leading-none text-gray-600 tracking-tighter">
              {stats.total_sessions}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <span>Registradas</span>
            </div>
          </div>
        </div>
        <div className="glass-card-dash p-6 rounded-2xl flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              Proyectos
            </span>
            <span className="material-symbols-outlined text-gray-300 text-[18px]">description</span>
          </div>
          <div>
            <span className="font-mono text-[40px] leading-none text-muted-green tracking-tighter">
              {recentBills.length > 0 ? "1000+" : "0"}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <span>En base de datos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Columna izquierda: Actividad + Lo que pasó hoy */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Gráfico de actividad */}
          <div className="glass-card-dash rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-xl text-gray-800">Actividad legislativa mensual</h3>
                <p className="text-xs text-gray-400 mt-0.5">Sesiones, discursos y votaciones 2024</p>
              </div>
              <Link
                href="/dashboard/analytics#activity"
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                Ver análisis →
              </Link>
            </div>
            <DashboardActivityChart data={monthlyActivityMock} />
          </div>

          {/* Grid de 2 columnas: Eventos y Legisladores activos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legisladores más activos */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-serif text-lg text-gray-800">Más activos</h3>
                <Link
                  href="/dashboard/ranking"
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  Ver ranking →
                </Link>
              </div>
              <div className="space-y-3">
                {mostActivePoliticians.map((politician) => (
                  <Link
                    key={politician.id}
                    href={`/dashboard/politicians/${politician.id}`}
                    className="glass-card-dash p-4 rounded-xl flex gap-3 items-center hover:bg-white/80 transition-colors group"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img
                        src={politician.photo_url || "/default-avatar.png"}
                        alt={politician.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors truncate">
                        {politician.full_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {politician.party && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: politician.party.color_hex || "#ccc" }}
                          />
                        )}
                        <span className="text-[10px] text-gray-400">
                          Actividad: {Math.round((politician.activity_score || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Proyectos recientes */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Proyectos recientes */}
          <div className="glass-card-dash p-6 rounded-2xl">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-serif text-lg text-gray-800">Proyectos recientes</h3>
              <Link
                href="/dashboard/topics"
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                Ver todo →
              </Link>
            </div>
            <div className="space-y-3">
              {recentBills.slice(0, 5).map((bill) => (
                <div key={bill.id} className="py-2 border-b border-black/5 last:border-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
                    {bill.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{bill.number || "Sin número"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      bill.status === "passed" ? "bg-green-100 text-green-700" :
                      bill.status === "rejected" ? "bg-red-100 text-red-700" :
                      bill.status === "committee" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {bill.status === "passed" ? "Aprobado" :
                       bill.status === "rejected" ? "Rechazado" :
                       bill.status === "committee" ? "En comisión" :
                       bill.status === "floor" ? "En debate" :
                       "Ingresado"}
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
