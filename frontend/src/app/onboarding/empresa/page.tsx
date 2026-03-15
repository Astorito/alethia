"use client";
 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Bell, BarChart2, Users, Clock, Headphones, ArrowLeft } from "lucide-react";
 
const features = [
  {
    icon: FileText,
    title: "Gestión de Licitaciones",
    description: "Acceso prioritario y filtrado inteligente de oportunidades estratégicas de negocio.",
  },
  {
    icon: Bell,
    title: "Monitoreo Regulatorio",
    description: "Alertas en tiempo real sobre cambios normativos con impacto directo en su sector.",
  },
  {
    icon: BarChart2,
    title: "Reportes de Cumplimiento",
    description: "Automatización de documentación técnica para auditorías y revisiones.",
  },
  {
    icon: Users,
    title: "Consultoría Estratégica",
    description: "Asesoramiento personalizado en la interpretación de normativas complejas.",
  },
  {
    icon: Clock,
    title: "Histórico de Adjudicaciones",
    description: "Datos históricos detallados para análisis de competencia y optimización de propuestas.",
  },
  {
    icon: Headphones,
    title: "Soporte Prioritario",
    description: "Canal directo con expertos legales y técnicos para resolución de incidencias.",
  },
];
 
export default function OnboardingEmpresaPage() {
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
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-gray-400 mb-4 block">Soluciones Premium · Empresas</span>
          <h1 className="font-serif font-light text-3xl md:text-4xl text-gray-900 leading-snug mb-4 max-w-2xl mx-auto">
            Optimización integral de procesos regulatorios y licitaciones corporativas.
          </h1>
          <p className="text-sm text-gray-500 font-light max-w-lg mx-auto">
            Herramientas diseñadas para que su organización tome decisiones informadas y cumpla con los marcos normativos vigentes.
          </p>
        </div>
 
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-x-12 gap-y-10 mb-16 border-t border-b border-black/5 py-14">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-start">
              <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center mb-4">
                <f.icon className="h-4 w-4 text-gray-500" />
              </div>
              <h3 className="font-serif text-base text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
 
        {/* Contact form */}
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <h2 className="font-serif text-2xl text-gray-900 mb-2">Consulta Corporativa</h2>
            <p className="text-sm text-gray-500 font-light">Inicie una conversación con nuestro equipo de consultoría.</p>
          </div>
          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Nombre</label>
                <input type="text" placeholder="Juan Pérez" className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Email Corporativo</label>
                <input type="email" placeholder="contacto@empresa.com" className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Mensaje</label>
              <textarea rows={2} placeholder="¿Cómo podemos ayudar a su organización?" className="w-full bg-transparent border-0 border-b border-gray-200 pb-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors resize-none" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <button type="submit" className="text-sm font-medium border-b border-gray-900 pb-0.5 hover:opacity-50 transition-opacity">
                Enviar solicitud
              </button>
              <button type="button" onClick={() => router.push("/dashboard")} className="text-sm font-light text-gray-400 hover:text-gray-700 transition-colors">
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
            <a href="#" className="hover:text-gray-800 transition-colors">Términos</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}