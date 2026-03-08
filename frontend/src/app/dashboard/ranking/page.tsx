import { Header } from "@/components/layout/header";
import { Leaderboard } from "@/components/ranking/leaderboard";

export default function DashboardRankingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Ranking de Coherencia"
        description="Legisladores ordenados por su score de coherencia entre discursos y votos"
      />
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Leaderboard basePath="/dashboard/politicians" />
        </div>
      </div>
    </div>
  );
}
