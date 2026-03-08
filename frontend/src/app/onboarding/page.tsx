"use client";

import { useState } from "react";
import Link from "next/link";

type ProfileType = "ciudadano" | "empresa" | "ong";

const profiles: { id: ProfileType; title: string; description: string; icon: string }[] = [
  {
    id: "ciudadano",
    title: "Ciudadano",
    description:
      "Accede a información pública, realiza trámites personales y consulta expedientes con claridad.",
    icon: "person",
  },
  {
    id: "empresa",
    title: "Empresa",
    description:
      "Gestiona licitaciones, consulta regulaciones y mantén al día tus obligaciones de forma simple.",
    icon: "business",
  },
  {
    id: "ong",
    title: "ONG / Prensa",
    description:
      "Analiza datos abiertos, monitorea gastos públicos y genera reportes de impacto social.",
    icon: "diversity_3",
  },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<ProfileType>("ciudadano");

  return (
    <div className="min-h-screen flex flex-col font-display text-pure-black overflow-x-hidden bg-warm-white">
      <div className="ambient-light ambient-orb-1" />
      <div className="ambient-light ambient-orb-2" />

      <header className="flex items-center justify-between whitespace-nowrap px-8 lg:px-12 py-8 bg-transparent z-10 relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-8 text-black opacity-90">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-black opacity-90">
            Alethia
          </h2>
        </Link>
        <div className="flex gap-4">
          <button
            type="button"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors px-4 py-2"
          >
            Ayuda
          </button>
          <Link
            href="/"
            className="hidden sm:flex items-center justify-center rounded-full h-10 px-6 bg-white/40 text-black text-sm font-medium hover:bg-white/60 transition-colors border border-black/5"
          >
            Salir
          </Link>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-4 pb-0 z-10 relative">
        <div className="relative w-full rounded-3xl overflow-hidden bg-civic-cream/30 border border-black/5 shadow-sm p-8 md:p-12 mb-10 flex flex-col items-center justify-center">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="w-full max-w-md flex flex-col gap-3 mb-10 relative z-10">
            <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500/80">
              <span>Paso 1 de 3</span>
              <span>Propósito</span>
            </div>
            <div className="h-[2px] w-full bg-black/5 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-black/60 w-1/3 rounded-full" />
            </div>
          </div>
          <div className="text-center max-w-2xl relative z-10">
            <div className="inline-block mb-4 p-2 rounded-full bg-white/40 backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-[20px] text-gray-400">
                temple_hindu
              </span>
            </div>
            <h1 className="font-serif font-light text-[32px] md:text-[42px] leading-tight text-pure-black tracking-tight mb-4">
              ¿Cómo vas a usar Alethia?
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
              Selecciona el perfil que mejor resuene contigo para personalizar tu
              experiencia de calma y transparencia.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-start pb-16 px-6 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          {profiles.map((profile) => {
            const isSelected = selected === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelected(profile.id)}
                className={`group relative flex flex-col items-center p-8 rounded-2xl glass-card text-left cursor-pointer outline-none focus:ring-1 focus:ring-gray-300 ${
                  isSelected ? "glass-card-selected" : ""
                }`}
              >
                <div
                  className={`absolute top-4 right-4 transition-opacity duration-300 ${
                    isSelected ? "text-black opacity-100" : "text-gray-300 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] font-light">
                    {isSelected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </div>
                <div
                  className={`mb-6 p-4 rounded-full transition-colors icon-container ${
                    isSelected ? "bg-gray-50" : "bg-transparent group-hover:bg-white/60"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[32px] font-light ${
                      isSelected ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  >
                    {profile.icon}
                  </span>
                </div>
                <h3
                  className={`text-xl font-serif font-medium mb-2 transition-colors ${
                    isSelected ? "text-pure-black" : "text-gray-700 group-hover:text-pure-black"
                  }`}
                >
                  {profile.title}
                </h3>
                <p
                  className={`text-[14px] text-center leading-relaxed font-light transition-colors ${
                    isSelected ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                >
                  {profile.description}
                </p>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col items-center w-full max-w-sm gap-6">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center h-14 px-8 bg-pure-black text-warm-white text-[16px] font-medium rounded-full hover:bg-black/80 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-[0.99]"
          >
            Continuar
          </Link>
          <button
            type="button"
            className="text-sm font-light text-gray-400 hover:text-gray-800 transition-colors"
          >
            ¿No estás seguro?{" "}
            <span className="underline underline-offset-4 decoration-gray-200">
              Realizar test breve
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
