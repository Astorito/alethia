"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Leaderboard } from "@/components/ranking/leaderboard";
import { getAllPoliticians } from "@/lib/data-supabase";
import type { PoliticianWithParty } from "@/lib/types";

// Categorías del mapa
const rankingCategories = [
  { id: "activos", name: "Más activos", icon: "bolt", description: "Mayor participación" },
  { id: "asistencia", name: "Mayor asistencia", icon: "event_available", description: "Mejor presencia" },
  { id: "influyentes", name: "Más influyentes", icon: "social_leaderboard", description: "Impacto en votaciones" },
  { id: "patrimonio", name: "Crecimiento patrimonial", icon: "trending_up", description: "Evolución declarada" },
  { id: "independientes", name: "Más independientes", icon: "person_outline", description: "Votos contrarios al bloque" },
];

export default function DashboardRankingPage() {
  const [politicians, setPoliticians] = useState<PoliticianWithParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const pols = await getAllPoliticians();
        setPoliticians(pols);
      } catch (error) {
        console.error("Error loading ranking data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  // Calcular rankings específicos según categorías
  const mostActive = [...politicians]
    .sort((a, b) => (b.activity_score || 0) - (a.activity_score || 0))
    .slice(0, 5);

  const bestAttendance = [...politicians]
    .sort((a, b) => ((b.activity_score || 0) * 0.8 + (b.consistency_score || 0) * 0.2) - 
                    ((a.activity_score || 0) * 0.8 + (a.consistency_score || 0) * 0.2))
    .slice(0, 5);

  const mostIndependent = [...politicians]
    .sort((a, b) => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            Comparación y posiciones
          </p>
          <h1 className="font-serif text-3xl font-light text-pure-black tracking-tight mb-1">
            Ranking
          </h1>
          <p className="text-sm text-gray-500">
            Métricas comparativas de legisladores por diferentes criterios
          </p>
        </div>
      </header>

      {/* Categorías de ranking según el mapa */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {rankingCategories.map((cat) => (
          <button
            key={cat.id}
            className={`p-4 rounded-2xl text-left transition-all ${
              cat.id === "activos"
                ? "glass-card-dash border-black/10"
                : "bg-white/40 border border-black/5 hover:bg-white/60"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-gray-500 mb-2">{cat.icon}</span>
            <p className="text-sm font-medium text-pure-black">{cat.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{cat.description}</p>
          </button>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna izquierda: Ranking principal de coherencia */}
        <div className="col-span-12 lg:col-span-7">
          <div className="glass-card-dash rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-lg font-medium text-pure-black">Coherencia discurso-voto</h2>
                <p className="text-xs text-gray-400">Legisladores ordenados por score de consistencia</p>
              </div>
            </div>
            <Leaderboard basePath="/dashboard/politicians" />
          </div>
        </div>

        {/* Columna derecha: Rankings específicos */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Más activos */}
          <div className="glass-card-dash rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Más activos</h3>
            </div>
            <div className="space-y-3">
              {mostActive.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/politicians/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={p.photo_url || "/default-avatar.png"} alt={p.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black truncate">{p.full_name}</p>
                    <p className="text-[10px] text-gray-400">{Math.round((p.activity_score || 0) * 100)}% actividad</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mayor asistencia */}
          <div className="glass-card-dash rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">event_available</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Mayor asistencia</h3>
            </div>
            <div className="space-y-3">
              {bestAttendance.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/politicians/${p.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-300 w-6 text-center">{i + 1}</span>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={p.photo_url || "/default-avatar.png"} alt={p.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pure-black truncate">{p.full_name}</p>
                    <p className="text-[10px] text-gray-400">{Math.round((p.activity_score || 0) * 100)}% presencia</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Crecimiento patrimonial - Placeholder */}
          <div className="glass-card-dash rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-purple-500 text-[18px]">trending_up</span>
              <h3 className="font-serif text-base font-medium text-pure-black">Crecimiento patrimonial</h3>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 text-center">
              <span className="material-symbols-outlined text-gray-300 text-3xl mb-2 block">account_balance_wallet</span>
              <p className="text-sm text-gray-500">Datos en desarrollo</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Se mostrará la evolución de declaraciones juradas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
