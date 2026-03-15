"use client";
 
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
 
type ProfileType = "ciudadano" | "empresa" | "ong";
 
const profiles: { id: ProfileType; title: string; description: string }[] = [
  {
    id: "ciudadano",
    title: "Ciudadano",
    description: "Accedé a información pública, seguí legisladores y consultá expedientes con claridad.",
  },
  {
    id: "empresa",
    title: "Empresa",
    description: "Gestioná licitaciones, consultá regulaciones y mantené al día tus obligaciones.",
  },
  {
    id: "ong",
    title: "ONG / Prensa",
    description: "Analizá datos abiertos, monitoreá gastos públicos y generá reportes de impacto.",
  },
];
 
export default function OnboardingPage() {
  const [selected, setSelected] = useState<ProfileType>("ciudadano");
  const router = useRouter();
 
  function handleContinue() {
    if (selected === "empresa") router.push("/onboarding/empresa");
    else if (selected === "ong") router.push("/onboarding/ong");
    else router.push("/dashboard");
  }
 
  return (
    <div
      className="h-screen flex flex-col font-display text-pure-black overflow-hidden"
      style={{ background: "#FDFCF9" }}
    >
      <div className="ambient-light ambient-orb-1" />
      <div className="ambient-light ambient-orb-2" />
 
      {/* Header */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-5 z-10 relative flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-6 text-black opacity-80">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-lg font-medium tracking-tight text-black opacity-90 font-serif">Alethia</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-light text-gray-400 hover:text-gray-800 transition-colors px-4 py-1.5 rounded-full border border-black/8 hover:border-black/20"
        >
          Salir
        </Link>
      </header>
 
      {/* Contenido central */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 z-10 relative gap-8">
        <h1 className="font-serif font-light text-[28px] md:text-[36px] leading-tight text-pure-black tracking-tight text-center">
          ¿Cómo vas a usar Alethia?
        </h1>
 
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
          {profiles.map((profile) => {
            const isSelected = selected === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelected(profile.id)}
                className={`group relative flex flex-col items-center text-center p-7 rounded-2xl glass-card outline-none focus:ring-1 focus:ring-gray-300 transition-all duration-300 ${
                  isSelected ? "glass-card-selected" : ""
                }`}
              >
                <div className={`absolute top-3.5 right-3.5 transition-all duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {isSelected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </div>
                <h3 className={`text-lg font-serif font-medium mb-2 transition-colors ${isSelected ? "text-pure-black" : "text-gray-600 group-hover:text-pure-black"}`}>
                  {profile.title}
                </h3>
                <p className={`text-[13px] leading-relaxed font-light transition-colors ${isSelected ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"}`}>
                  {profile.description}
                </p>
              </button>
            );
          })}
        </div>
 
        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center justify-center h-12 px-10 bg-pure-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Continuar
          </button>
          <button
            type="button"
            className="text-xs font-light text-gray-400 hover:text-gray-700 transition-colors"
          >
            ¿No estás seguro?{" "}
            <span className="underline underline-offset-4 decoration-gray-300">Realizar test breve</span>
          </button>
        </div>
      </main>
    </div>
  );
}
 