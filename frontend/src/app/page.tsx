import Link from "next/link";
import { ParticlesBackground } from "@/components/landing/particles-background";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{ background: "#FFFFFF" }}
    >
      {/* Fondo de partículas */}
      <ParticlesBackground />

      {/* Navegación */}
      <header className="relative z-10 w-full px-8 py-6 md:px-12 flex items-center justify-between">
        <div className="w-20" />
        <Link
          href="/onboarding"
          className="text-sm font-light text-gray-400 hover:text-gray-800 transition-colors duration-300 tracking-wide"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero: solo "alethia" */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-10">
          <h1
            className="fade-in-up"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 100,
              fontSize: "clamp(51px, 11.2vw, 128px)",
              letterSpacing: "-0.03em",
              color: "#1a1a1a",
              lineHeight: 1,
              userSelect: "none",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>ale</span>
            <span style={{ filter: "blur(3.5px)", opacity: 0.85 }}>t</span>
            <span style={{ filter: "blur(3.5px)", opacity: 0.85 }}>h</span>
            <span>ia</span>
          </h1>

          <p
            className="fade-in-up fade-in-up-delay-1 text-center"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 300,
              fontSize: "14px",
              letterSpacing: "0.18em",
              color: "#9ca3af",
              textTransform: "uppercase",
            }}
          >
            Transparencia legislativa inteligente
          </p>

          <div className="fade-in-up fade-in-up-delay-2">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border border-gray-200 text-gray-500 text-sm font-light tracking-widest uppercase hover:border-gray-400 hover:text-gray-800 transition-all duration-500"
            >
              Comenzar
              <span className="material-symbols-outlined text-[14px] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center">
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 300,
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#d1d5db",
            textTransform: "uppercase",
          }}
        >
          Buenos Aires — Argentina
        </span>
      </footer>
    </div>
  );
}
