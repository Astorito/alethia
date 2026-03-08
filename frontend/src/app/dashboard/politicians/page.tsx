"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PoliticianCard } from "@/components/politicians/politician-card";
import { Filters } from "@/components/politicians/filters";
import { filterPoliticians, getAllParties, getAllProvinces } from "@/lib/data";

const BASE = "/dashboard/politicians";

export default function DashboardPoliticiansPage() {
  const [filters, setFilters] = useState({
    party: "",
    province: "",
    search: "",
    sortBy: "score" as "name" | "score" | "activity",
    sortDir: "desc" as "asc" | "desc",
  });

  const politicians = useMemo(() => filterPoliticians(filters), [filters]);
  const parties = getAllParties();
  const provinces = getAllProvinces();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Legisladores"
        description="Explora el perfil de coherencia de cada legislador argentino"
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              parties={parties}
              provinces={provinces}
            />
          </div>
          <div className="mb-6">
            <p className="text-gray-500">
              {politicians.length} legislador{politicians.length !== 1 ? "es" : ""} encontrado{politicians.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {politicians.map((politician) => (
              <Link key={politician.id} href={`${BASE}/${politician.id}`}>
                <PoliticianCard politician={politician} />
              </Link>
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
      </div>
    </div>
  );
}
