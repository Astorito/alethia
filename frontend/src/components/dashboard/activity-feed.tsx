import { Clock, Vote, MessageSquare, AlertTriangle } from "lucide-react";
import { getDashboardStats, getAllPoliticians } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function ActivityFeed() {
  const stats = getDashboardStats();
  const politicians = getAllPoliticians();

  // Generate recent activity from the data
  const recentActivity = [
    {
      id: "1",
      type: "contradiction",
      icon: AlertTriangle,
      title: "Nueva contradicción detectada",
      description: `${politicians[0]?.full_name} votó en contra de un proyecto que había apoyado públicamente`,
      time: "2 horas atrás",
      severity: "high",
    },
    {
      id: "2",
      type: "vote",
      icon: Vote,
      title: "Votación completada",
      description: `Sesión ${stats.total_sessions} finalizada con ${stats.total_votes} votos registrados`,
      time: "5 horas atrás",
    },
    {
      id: "3",
      type: "speech",
      icon: MessageSquare,
      title: "Nuevo discurso analizado",
      description: `${politicians[1]?.full_name} intervino sobre ${stats.top_gaps[0]?.topic.name}`,
      time: "1 día atrás",
    },
    {
      id: "4",
      type: "contradiction",
      icon: AlertTriangle,
      title: "Contradicción histórica",
      description: `${politicians[2]?.full_name} cambió posición en tema de ${stats.top_gaps[1]?.topic.name}`,
      time: "2 días atrás",
      severity: "medium",
    },
    {
      id: "5",
      type: "session",
      icon: Clock,
      title: "Sesión parlamentaria",
      description: "Nueva sesión ordinaria programada para mañana",
      time: "3 días atrás",
    },
  ];

  const getActivityColor = (type: string, severity?: string) => {
    switch (type) {
      case "contradiction":
        return severity === "high" ? "text-red-400" : "text-orange-400";
      case "vote":
        return "text-blue-400";
      case "speech":
        return "text-green-400";
      case "session":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-alethia-accent p-6 rounded-lg border border-alethia-highlight/20">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-6 w-6 text-gray-400" />
        <h3 className="text-xl font-bold text-white">Actividad Reciente</h3>
      </div>

      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-alethia-primary/30 border border-alethia-highlight/10">
            <div className={`p-2 rounded-lg bg-alethia-highlight/20 ${getActivityColor(activity.type, activity.severity)}`}>
              <activity.icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm">{activity.title}</h4>
              <p className="text-gray-300 text-sm mt-1">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
            </div>

            {activity.severity && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.severity === "high"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-orange-500/20 text-orange-400"
              }`}>
                {activity.severity === "high" ? "Alta" : "Media"}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-alethia-highlight/20">
        <p className="text-xs text-gray-400">
          {stats.total_contradictions} contradicciones detectadas en total
        </p>
      </div>
    </div>
  );
}