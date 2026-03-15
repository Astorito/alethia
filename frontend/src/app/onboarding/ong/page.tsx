
Copiar

"use client";
 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Bell, FileText, Database, HelpCircle, Network, ArrowLeft } from "lucide-react";
 
const features = [
  {
    icon: TrendingUp,
    title: "Analítica Profunda",
    description: "Visualización avanzada y cruce de datos para detectar patrones de gasto público.",
  },
  {
    icon: Bell,
    title: "Alertas en Tiempo Real",
    description: "Monitorización de licitaciones y adjudicaciones según criterios específicos.",
  },
  {
    icon: FileText,
    title: "Reportes de Impacto",
    description: "Generación de informes profesionales listos para publicación periodística.",
  },
  {
    icon: Database,
    title: "Histórico de Transparencia",
    description: "Acceso a registros históricos consolidados para análisis evolutivo de fondos.",
  },
  {
    icon: HelpCircle,
    title: "Consultoría de Datos",
    description: "Soporte especializado para la interpretación de estructuras de datos complejas.",
  },
  {
    icon: Network,
    title: "Red de Verificación",
    description: "Conexión con otros entes de control para validar hallazgos e investigaciones.",
  },
];
 
export default function OnboardingOngPage() {
  const router = useRouter();
 
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FDFCF9" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-5 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-6 text-black opacity-80">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg font-medium tracking-tight text-black opacity-90 font-serif">Alethia</span>
        </Link>
        <Link href="/" className="text-sm font-light text-gray-400 hover:text-gray-800 transition-colors px-4 py-1.5 rounded-full border border-black/10 hover:border-black/20">
          Salir
        </Link>
      </header>
 
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 transition-colors mb-10">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
 
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-gray-400 mb-4 block">Perfil ONG · Prensa</span>
          <h1 className="font-serif font-light text-3xl md:text-4xl text-gray-900 leading-snug mb-4 max-w-2xl mx-auto">
            Acceso avanzado a datos públicos para organizaciones que impulsan la transparencia.
          </h1>
          <p className="text-sm text-gray-500 font-light max-w-lg mx-auto">
            Herramientas diseñadas para la investigación profunda y el monitoreo de recursos públicos.
          </p>
        </div>
 
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-x-12 gap-y-10 mb-16 border-t border-b border-black/5 py-14">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center mb-4">
                <f.icon className="h-4 w-4 text-gray-500" />
              </div>
              <h3 className="font-serif text-base text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed max-w-[220px]">{f.description}</p>
            </div>
          ))}
        </div>
 
        {/* Registration form */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl text-gray-900 mb-2">Comenzá hoy mismo</h2>
            <p className="text-sm text-gray-500 font-light">Completá tus datos para configurar tu panel Premium.</p>
          </div>
          <form className="space-y-8">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Nombre Completo</label>
              <input type="text" placeholder="Ej: María García" className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Organización / Medio</label>
              <input type="text" placeholder="Nombre de tu ONG o medio" className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Propósito</label>
              <textarea rows={2} placeholder="Describí brevemente tu uso..." className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors resize-none" />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button type="submit" className="w-full bg-gray-900 text-white py-3.5 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-black/80 transition-all">
                Enviar Solicitud
              </button>
              <button type="button" onClick={() => router.push("/dashboard")} className="w-full text-sm font-light text-gray-400 hover:text-gray-700 transition-colors py-2">
                Ir al dashboard →
              </button>
            </div>
          </form>
        </div>
      </main>
 
      <footer className="py-10 px-8 border-t border-black/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400">
          <span>© 2025 Alethia</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-800 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}