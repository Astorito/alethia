"use client";

import { Header } from "@/components/layout/header";
import { CompareView } from "@/components/compare/compare-view";

export default function DashboardComparePage() {
  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Comparador de Legisladores"
        description="Compara dos legisladores lado a lado: scores, votos y patrones de coherencia"
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <CompareView />
        </div>
      </div>
    </div>
  );
}
