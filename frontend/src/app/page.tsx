import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative font-sans text-slate-900 selection:bg-primary/20">
      {/* Ethereal Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navigation */}
      <header className="relative w-full z-50 px-8 py-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-600 text-[24px]">
            public
          </span>
          <span className="font-display font-light text-xl tracking-tight text-slate-800">
            Alethia
          </span>
        </div>
        <Link
          href="/onboarding"
          className="font-sans text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Main Content (Hero) */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 w-full">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
          <h1 className="font-serif font-light text-[56px] md:text-[88px] leading-none text-slate-900 fade-in-up tracking-tight">
            Alethia
          </h1>
          <p className="font-sans font-normal text-lg md:text-[18px] text-slate-600 max-w-lg leading-relaxed fade-in-up fade-in-up-delay-1">
            Inteligencia artificial para una democracia más transparente
          </p>
          <div className="fade-in-up fade-in-up-delay-2 mt-4">
            <Link
              href="/onboarding"
              className="group relative inline-flex items-center justify-center px-8 py-3 rounded-full bg-[rgba(0,0,0,0.03)] hover:bg-[rgba(0,0,0,0.06)] border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium tracking-wide transition-all duration-500 ease-out"
            >
              <span>Comenzar</span>
              <span className="material-symbols-outlined text-[16px] ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-sans">
          Buenos Aires — Argentina
        </div>
      </footer>
    </div>
  );
}
