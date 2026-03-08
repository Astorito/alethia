"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Party } from "@/lib/types";

interface FiltersProps {
  filters: {
    party: string;
    province: string;
    search: string;
    sortBy: "name" | "score" | "activity";
    sortDir: "asc" | "desc";
  };
  onFiltersChange: (filters: FiltersProps["filters"]) => void;
  parties: Party[];
  provinces: string[];
}

export function Filters({ filters, onFiltersChange, parties, provinces }: FiltersProps) {
  const updateFilters = (updates: Partial<FiltersProps["filters"]>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      party: "",
      province: "",
      search: "",
      sortBy: "score",
      sortDir: "desc",
    });
  };

  const toggleSort = (field: "name" | "score" | "activity") => {
    if (filters.sortBy === field) {
      updateFilters({
        sortDir: filters.sortDir === "asc" ? "desc" : "asc"
      });
    } else {
      updateFilters({
        sortBy: field,
        sortDir: "desc"
      });
    }
  };

  const hasActiveFilters = filters.party || filters.province || filters.search;

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-pure-black">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted-blue hover:text-muted-blue/80 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ej: Fernández, López..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-black/10 rounded-xl text-pure-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-muted-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Party Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Partido
          </label>
          <select
            value={filters.party}
            onChange={(e) => updateFilters({ party: e.target.value })}
            className="w-full px-4 py-2 bg-white/60 border border-black/10 rounded-xl text-pure-black focus:outline-none focus:ring-2 focus:ring-muted-blue focus:border-transparent"
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Provincia
          </label>
          <select
            value={filters.province}
            onChange={(e) => updateFilters({ province: e.target.value })}
            className="w-full px-4 py-2 bg-white/60 border border-black/10 rounded-xl text-pure-black focus:outline-none focus:ring-2 focus:ring-muted-blue focus:border-transparent"
          >
            <option value="">Todas las provincias</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-6 pt-6 border-t border-black/5">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Ordenar por:</span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("score")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filters.sortBy === "score"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Score
              {filters.sortBy === "score" && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => toggleSort("name")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filters.sortBy === "name"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Nombre
              {filters.sortBy === "name" && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => toggleSort("activity")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filters.sortBy === "activity"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Actividad
              {filters.sortBy === "activity" && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: {filters.search}
            </Badge>
          )}
          {filters.party && (
            <Badge variant="secondary" className="text-xs">
              Partido: {filters.party}
            </Badge>
          )}
          {filters.province && (
            <Badge variant="secondary" className="text-xs">
              Provincia: {filters.province}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}