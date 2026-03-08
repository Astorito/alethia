import { Users, FileText, Vote, BarChart3 } from "lucide-react";
import { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Legisladores",
      value: stats.total_politicians,
      icon: Users,
      description: "Analizados",
      color: "text-blue-400",
    },
    {
      title: "Sesiones",
      value: stats.total_sessions,
      icon: FileText,
      description: "Parlamentarias",
      color: "text-green-400",
    },
    {
      title: "Votaciones",
      value: stats.total_votes,
      icon: Vote,
      description: "Registradas",
      color: "text-purple-400",
    },
    {
      title: "Score Promedio",
      value: stats.avg_consistency,
      icon: BarChart3,
      description: "Coherencia",
      color: "text-alethia-gold",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-alethia-accent p-6 rounded-lg border border-alethia-highlight/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">{card.title}</p>
              <p className={`text-3xl font-bold mt-2 ${card.color}`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{card.description}</p>
            </div>
            <div className={`p-3 rounded-lg bg-alethia-highlight/20 ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}