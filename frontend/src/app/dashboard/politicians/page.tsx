"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { PoliticianSphere } from "@/components/politicians/politician-sphere";
import { PoliticianCard } from "@/components/politicians/politician-card";
import { filterPoliticians, getAllParties, getAllProvinces } from "@/lib/data";
import type { PoliticianWithParty } from "@/lib/types";

const BASE = "/dashboard/politicians";

export default function DashboardPoliticiansPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    party: "",
    province: "",
    search: "",
    sortBy: "score" as "name" | "score" | "activity",
    sortDir: "desc" as "asc" | "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"sphere" | "grid">("sphere");

  const handleSelect = (politician: PoliticianWithParty) => {
    router.push(`${BASE}/${politician.id}`);
  };

  const politicians = useMemo(() => filterPoliticians(filters), [filters]);
  const parties = getAllParties();
  const provinces = getAllProvinces();

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters({ ...filters, ...updates });
  };

  const clearFilters = () => {
    setFilters({
      party: "",
      province: "",
      search: "",
      sortBy: "score",
      sortDir: "desc",
    });
  };

  const hasActiveFilters = filters.party || filters.province || filters.search;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Compact Header with Search */}
      <div className="px-6 py-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="font-serif text-xl font-semibold text-pure-black">Legisladores</h1>
            <p className="text-xs text-gray-400">
              {politicians.length} encontrados
            </p>
          </div>

          {/* Search bar - compact */}
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
                <button
                  onClick={() => updateFilters({ search: "" })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("sphere")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "sphere"
                  ? "bg-white text-pure-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-pure-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
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

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Party Filter */}
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Partido
                </label>
                <select
                  value={filters.party}
                  onChange={(e) => updateFilters({ party: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todos los partidos</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.short_name}>
                      {party.short_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province Filter */}
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Provincia
                </label>
                <select
                  value={filters.province}
                  onChange={(e) => updateFilters({ province: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Todas las provincias</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Ordenar por
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value as typeof filters.sortBy })}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="score">Coherencia</option>
                    <option value="activity">Actividad</option>
                    <option value="name">Nombre</option>
                  </select>
                  <button
                    onClick={() => updateFilters({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                Búsqueda: {filters.search}
                <button onClick={() => updateFilters({ search: "" })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.party && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                Partido: {filters.party}
                <button onClick={() => updateFilters({ party: "" })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.province && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                Provincia: {filters.province}
                <button onClick={() => updateFilters({ province: "" })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === "sphere" ? (
          <PoliticianSphere 
            politicians={politicians} 
            onSelect={handleSelect}
          />
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {politicians.map((politician) => (
                <div 
                  key={politician.id}
                  onClick={() => handleSelect(politician)}
                  className="cursor-pointer"
                >
                  <PoliticianCard politician={politician} />
                </div>
              ))}
            </div>
            {politicians.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No se encontraron legisladores con los filtros aplicados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
