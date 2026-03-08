import { AlertTriangle, Calendar, MessageSquare, Vote } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Contradiction } from "@/lib/types";

interface ContradictionTimelineProps {
  contradictions: Contradiction[];
}

export function ContradictionTimeline({ contradictions }: ContradictionTimelineProps) {
  if (contradictions.length === 0) {
    return (
      <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-bold text-pure-black">Timeline de Contradicciones</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-green-400 text-4xl mb-4">✓</div>
          <p className="text-gray-600">
            No se detectaron contradicciones significativas en los últimos meses.
          </p>
        </div>
      </div>
    );
  }

  const sortedContradictions = [...contradictions].sort(
    (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-500/20 border-red-500/40";
      case "high":
        return "text-orange-400 bg-orange-500/20 border-orange-500/40";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/40";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/40";
    }
  };

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-400" />
        <h3 className="text-xl font-bold text-pure-black">Timeline de Contradicciones</h3>
        <div className="ml-auto">
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
            {contradictions.length} detectada{contradictions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedContradictions.map((contradiction, index) => (
          <div
            key={contradiction.id}
            className="relative flex gap-4 p-4 rounded-xl border border-black/5 bg-white/40"
          >
            {/* Timeline line */}
            {index < sortedContradictions.length - 1 && (
              <div className="absolute left-6 top-16 bottom-0 w-px bg-alethia-highlight/20" />
            )}

            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getSeverityColor(contradiction.severity)}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(contradiction.severity)}`}>
                  {contradiction.severity}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(contradiction.detected_at)}
                </span>
              </div>

              <p className="text-pure-black text-sm leading-relaxed mb-3">
                {contradiction.description}
              </p>

              {/* Vote vs Speech details */}
              <div className="flex gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Discurso: {contradiction.speech_stance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Vote className="h-3 w-3" />
                  <span>Voto: {contradiction.vote_position}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contradictions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-black/5">
          <p className="text-xs text-gray-400">
            Las contradicciones se detectan automáticamente comparando posturas expresadas en discursos
            con posiciones tomadas en votaciones parlamentarias.
          </p>
        </div>
      )}
    </div>
  );
}