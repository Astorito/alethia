"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { PoliticianCarousel } from "@/components/politicians/politician-carousel";
import { PoliticianCard } from "@/components/politicians/politician-card";
import { filterPoliticians, getAllParties, getAllProvinces } from "@/lib/data-supabase";
import type { PoliticianWithParty } from "@/lib/types";

const BASE = "/dashboard/politicians";

export default function DashboardPoliticiansPage() {
  const router = useRouter();
  const [politicians, setPoliticians] = useState<PoliticianWithParty[]>([]);
  const [parties, setParties] = useState<{ id: string; short_name: string }[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamber, setSelectedChamber] = useState<"deputies" | "senate">("deputies");

  const [filters, setFilters] = useState({
    party: "",
    province: "",
    search: "",
    sortBy: "score" as "name" | "score" | "activity",
    sortDir: "desc" as "asc" | "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pols, parts, provs] = await Promise.all([
          filterPoliticians({ chamber: selectedChamber }),
          getAllParties(),
          getAllProvinces(),
        ]);
        setPoliticians(pols);
        setParties(parts);
        setProvinces(provs);
      } catch (error) {
        console.error("Error loading politicians:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedChamber]);

  const filteredPoliticians = useMemo(() => {
    return politicians.filter((p) => {
      if (filters.party && p.party?.short_name !== filters.party) return false;
      if (filters.province && p.province !== filters.province) return false;
      if (filters.search && !p.full_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      const dir = filters.sortDir === "asc" ? 1 : -1;
      switch (filters.sortBy) {
        case "name": return a.full_name.localeCompare(b.full_name) * dir;
        case "activity": return ((a.activity_score || 0) - (b.activity_score || 0)) * dir;
        case "score": default: return ((a.consistency_score || 0) - (b.consistency_score || 0)) * dir;
      }
    });
  }, [politicians, filters]);

  const handleSelect = (politician: PoliticianWithParty) => router.push(`${BASE}/${politician.id}`);
  const updateFilters = (updates: Partial<typeof filters>) => setFilters({ ...filters, ...updates });
  const clearFilters = () => setFilters({ party: "", province: "", search: "", sortBy: "score", sortDir: "desc" });
  const hasActiveFilters = filters.party || filters.province || filters.search;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando legisladores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">

          {/* Title + Chamber switch */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div>
              <h1 className="font-serif text-xl font-semibold text-pure-black">Legisladores</h1>
              <p className="text-xs text-gray-400">{filteredPoliticians.length} encontrados</p>
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedChamber("deputies")}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  selectedChamber === "deputies" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Diputados
              </button>
              <button
                onClick={() => setSelectedChamber("senate")}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  selectedChamber === "senate" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Senadores
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar legisladores..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-pure-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {filters.search && (
                <button onClick={() => updateFilters({ search: "" })} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* View mode */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode("carousel")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "carousel" ? "bg-white text-pure-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <span className="material-symbols-outlined text-[16px]">view_carousel</span>
            </button>
            <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "grid" ? "bg-white text-pure-black shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${showFilters || hasActiveFilters ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {[filters.party, filters.province, filters.search].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Partido</label>
                <select value={filters.party} onChange={(e) => updateFilters({ party: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Todos los partidos</option>
                  {parties.map((party) => (<option key={party.id} value={party.short_name || party.id}>{party.short_name || party.id}</option>))}
                </select>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Provincia</label>
                <select value={filters.province} onChange={(e) => updateFilters({ province: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Todas las provincias</option>
                  {provinces.map((province) => (<option key={province} value={province}>{province}</option>))}
                </select>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Ordenar por</label>
                <div className="flex gap-2">
                  <select value={filters.sortBy} onChange={(e) => updateFilters({ sortBy: e.target.value as typeof filters.sortBy })} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="score">Coherencia</option>
                    <option value="activity">Actividad</option>
                    <option value="name">Nombre</option>
                  </select>
                  <button onClick={() => updateFilters({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700">
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <X className="h-4 w-4" /> Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.search && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Búsqueda: {filters.search}<button onClick={() => updateFilters({ search: "" })}><X className="h-3 w-3" /></button></span>)}
            {filters.party && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Partido: {filters.party}<button onClick={() => updateFilters({ party: "" })}><X className="h-3 w-3" /></button></span>)}
            {filters.province && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">Provincia: {filters.province}<button onClick={() => updateFilters({ province: "" })}><X className="h-3 w-3" /></button></span>)}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === "carousel" ? (
          <PoliticianCarousel politicians={filteredPoliticians} onSelect={handleSelect} />
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredPoliticians.map((politician) => (
                <div key={politician.id} onClick={() => handleSelect(politician)} className="cursor-pointer">
                  <PoliticianCard politician={politician} />
                </div>
              ))}
            </div>
            {filteredPoliticians.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No se encontraron legisladores con los filtros aplicados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}