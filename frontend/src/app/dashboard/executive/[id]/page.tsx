import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExecutiveAuthorities, getExecutiveDecrees } from "@/lib/data";
import { mandateRange } from "@/lib/utils";
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  FileText, 
  TrendingUp,
  Users,
  Award,
  Activity
} from "lucide-react";

interface MinisterPageProps {
  params: Promise<{ id: string }>;
}

export default async function MinisterPage({ params }: MinisterPageProps) {
  const { id } = await params;
  const authorities = getExecutiveAuthorities();
  const authority = authorities.find((a) => a.id === id);
  
  if (!authority) notFound();

  const decrees = getExecutiveDecrees()
    .filter((d) => d.summary.toLowerCase().includes(authority.ministry_or_area?.toLowerCase() || "") ||
                  d.summary.toLowerCase().includes(authority.full_name.toLowerCase()))
    .slice(0, 5);

  // Mock data for demonstration
  const stats = {
    decreesSigned: Math.floor(Math.random() * 50) + 20,
    projectsLed: Math.floor(Math.random() * 15) + 5,
    publicEvents: Math.floor(Math.random() * 30) + 10,
    approvalRating: Math.floor(Math.random() * 30) + 40, // 40-70%
  };

  const timelineEvents = [
    {
      year: new Date(authority.started_at).getFullYear(),
      title: `Asume como ${authority.role_title}`,
      description: authority.ministry_or_area || "",
      icon: "calendar_month",
    },
    {
      year: 2024,
      title: "Primera reforma estructural",
      description: "Implementación de nuevas políticas",
      icon: "trending_up",
    },
    {
      year: 2024,
      title: "Acuerdo interministerial",
      description: "Coordinación con otros ministerios",
      icon: "handshake",
    },
  ];

  // Mock: declaración jurada
  const djVariation = {
    yearPrev: 2022,
    yearCurr: 2023,
    prevAmount: Math.floor(Math.random() * 80 + 40) * 1_000_000,
    currAmount: Math.floor(Math.random() * 120 + 60) * 1_000_000,
  };
  const djDiff = djVariation.currAmount - djVariation.prevAmount;
  const djPct = ((djDiff / djVariation.prevAmount) * 100).toFixed(1);

  // Mock: presupuesto ministerio
  const budget = {
    total: Math.floor(Math.random() * 500 + 100) * 1_000_000_000,
    executed: Math.floor(Math.random() * 60 + 30),
    categories: [
      { label: "Personal", pct: 45 },
      { label: "Bienes y Servicios", pct: 28 },
      { label: "Transferencias", pct: 18 },
      { label: "Inversión", pct: 9 },
    ],
  };

  // Mock: noticias
  const mockNews = [
    {
      id: "n1",
      title: `${authority.full_name} anuncia nuevas medidas para el sector`,
      source: "Infobae",
      date: "2024-12-10",
      url: "#",
    },
    {
      id: "n2",
      title: `El ministerio confirma ajuste en el presupuesto 2025`,
      source: "La Nación",
      date: "2024-11-28",
      url: "#",
    },
    {
      id: "n3",
      title: `Reunión con organismos internacionales sobre política sectorial`,
      source: "Clarín",
      date: "2024-11-15",
      url: "#",
    },
    {
      id: "n4",
      title: `Informe de gestión: logros y desafíos del primer año`,
      source: "Ámbito",
      date: "2024-10-30",
      url: "#",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link 
          href="/dashboard/executive" 
          className="flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ejecutivo Nacional
        </Link>
        <span>/</span>
        <span className="text-pure-black">Perfil</span>
      </nav>

      {/* Header Card */}
      <div className="glass-card-dash rounded-3xl p-8 mb-8 border border-black/5">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-xl shrink-0">
            <Image
              src={authority.photo_url}
              alt={authority.full_name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full uppercase tracking-wide">
                {authority.role_title}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activo
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-pure-black mb-2">
              {authority.full_name}
            </h1>

            <p className="text-lg text-gray-500 mb-4">
              {authority.ministry_or_area || authority.role_title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Mandato {mandateRange(authority.started_at, authority.ended_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Poder Ejecutivo Nacional</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 shrink-0">
            <button className="flex items-center gap-2 px-6 py-3 bg-pure-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              Seguir Actividad
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-black/10 text-pure-black rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Descargar Reporte
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 pt-8 border-t border-black/5 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase">Decretos</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{stats.decreesSigned}</p>
            <p className="text-xs text-gray-400">Firmados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase">Proyectos</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{stats.projectsLed}</p>
            <p className="text-xs text-gray-400">Liderados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase">Eventos</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-pure-black">{stats.publicEvents}</p>
            <p className="text-xs text-gray-400">Públicos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase">Aprobación</span>
            </div>
            <p className="text-3xl font-mono font-semibold text-blue-600">{stats.approvalRating}%</p>
            <p className="text-xs text-gray-400">Estimada</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Timeline */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-6">Trayectoria en el Cargo</h2>
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">{event.icon}</span>
                    </div>
                    {index < timelineEvents.length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-600">{event.year}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{event.description}</span>
                    </div>
                    <h3 className="font-medium text-pure-black">{event.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Responsibilities */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-4">Responsabilidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Políticas públicas sectoriales",
                "Coordinación interministerial",
                "Gestión presupuestaria",
                "Relaciones institucionales",
                "Supervisión de organismos descentralizados",
                "Representación internacional",
              ].map((resp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                  <span className="material-symbols-outlined text-gray-400 text-[18px] mt-0.5">check_circle</span>
                  <span className="text-sm text-gray-600">{resp}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Declaración Jurada */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-5">Declaración Jurada Patrimonial</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-gray-50/60 border border-black/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{djVariation.yearPrev}</p>
                <p className="text-2xl font-mono font-semibold text-pure-black">
                  ${(djVariation.prevAmount / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-400 mt-1">Patrimonio declarado</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/60 border border-black/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{djVariation.yearCurr}</p>
                <p className="text-2xl font-mono font-semibold text-pure-black">
                  ${(djVariation.currAmount / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-400 mt-1">Patrimonio declarado</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-4 rounded-xl ${djDiff >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
              <span className={`material-symbols-outlined text-[22px] ${djDiff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {djDiff >= 0 ? "trending_up" : "trending_down"}
              </span>
              <div>
                <p className={`font-semibold text-base ${djDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {djDiff >= 0 ? "+" : ""}{djPct}% en un año
                </p>
                <p className="text-xs text-gray-500">
                  Variación {djVariation.yearPrev}–{djVariation.yearCurr} · Fuente: OA
                </p>
              </div>
            </div>
          </section>

          {/* Presupuesto del Ministerio */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-5">Presupuesto del Ministerio</h2>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Total asignado 2024</p>
                <p className="text-3xl font-mono font-semibold text-pure-black">
                  ${(budget.total / 1_000_000_000).toFixed(1)}B
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Ejecución</p>
                <p className="text-2xl font-mono font-semibold text-blue-600">{budget.executed}%</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${budget.executed}%` }}
              />
            </div>
            <div className="space-y-2">
              {budget.categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-36 shrink-0">{cat.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${cat.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 font-mono w-8 text-right">{cat.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Últimas Noticias */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h2 className="font-serif text-xl font-semibold text-pure-black mb-4">Últimas Noticias</h2>
            <div className="space-y-3">
              {mockNews.map((news) => (
                <a
                  key={news.id}
                  href={news.url}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/70 transition-colors group"
                >
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 text-[20px] mt-0.5 transition-colors">article</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-pure-black group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {news.source} · {new Date(news.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 text-[16px] shrink-0 group-hover:text-blue-500 transition-colors">open_in_new</span>
                </a>
              ))}
            </div>
          </section>

          {/* Recent Decrees */}
          <section className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-pure-black">Decretos Relacionados</h2>
              <Link href="/dashboard/executive" className="text-xs text-blue-600 hover:underline">
                Ver todos →
              </Link>
            </div>
            {decrees.length > 0 ? (
              <div className="space-y-3">
                {decrees.map((decree) => (
                  <div key={decree.id} className="p-4 rounded-xl bg-gray-50/50 border border-black/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            decree.type === "dnu" ? "bg-purple-100 text-purple-700" :
                            decree.type === "decreto" ? "bg-blue-100 text-blue-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {decree.type === "dnu" ? "DNU" : decree.type === "decreto" ? "Decreto" : "Resolución"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{decree.number}</span>
                        </div>
                        <p className="text-sm text-pure-black line-clamp-2">{decree.summary}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(decree.date).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                No hay decretos relacionados registrados
              </p>
            )}
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h3 className="font-medium text-pure-black mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Discursos públicos</span>
                <span className="text-sm font-medium text-pure-black">12 este mes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reuniones interministeriales</span>
                <span className="text-sm font-medium text-pure-black">8 esta semana</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Proyectos en agenda</span>
                <span className="text-sm font-medium text-pure-black">5 activos</span>
              </div>
            </div>
          </div>

          {/* Related Authorities */}
          <div className="glass-card-dash rounded-2xl p-6 border border-black/5">
            <h3 className="font-medium text-pure-black mb-4">Autoridades Relacionadas</h3>
            <div className="space-y-3">
              {authorities
                .filter((a) => a.id !== authority.id && !a.role_title.toLowerCase().includes("president"))
                .slice(0, 3)
                .map((related) => (
                  <Link
                    key={related.id}
                    href={`/dashboard/executive/${related.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={related.photo_url}
                        alt={related.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pure-black truncate">{related.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{related.ministry_or_area}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Back to Executive */}
          <Link
            href="/dashboard/executive"
            className="flex items-center justify-center gap-2 w-full p-4 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Ejecutivo Nacional
          </Link>
        </div>
      </div>
    </div>
  );
}
