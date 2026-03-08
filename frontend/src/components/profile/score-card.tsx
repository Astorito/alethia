import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getGradeColor, getGradeBgColor } from "@/lib/utils";
import type { PoliticianProfile } from "@/lib/types";

interface ScoreCardProps {
  politician: PoliticianProfile;
}

export function ScoreCard({ politician }: ScoreCardProps) {
  const gradeColor = getGradeColor(politician.consistency_grade);
  const gradeBgColor = getGradeBgColor(politician.consistency_grade);

  // Calculate topic scores for visualization
  const topicScores = politician.consistency_by_topic.slice(0, 5);

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${gradeBgColor}`}>
          <TrendingUp className={`h-6 w-6 ${gradeColor}`} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-pure-black">Score de Coherencia</h3>
          <p className="text-sm text-gray-500">
            Basado en discursos vs. votos por tema
          </p>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold mb-4 ${gradeColor}`}>
          {politician.consistency_score}
        </div>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${gradeBgColor} ${gradeColor}`}>
          Grade {politician.consistency_grade}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">Coherencia General</span>
          <span className={`text-sm font-medium ${gradeColor}`}>
            {politician.consistency_score}/10
          </span>
        </div>
        <ProgressBar value={politician.consistency_score} className="h-3" />
      </div>

      {/* Topic Breakdown */}
      {topicScores.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Coherencia por Tema
          </h4>
          <div className="space-y-3">
            {topicScores.map((topicScore) => {
              const topicColor = getGradeColor(topicScore.grade);
              return (
                <div key={topicScore.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">
                        {topicScore.policy_area || "General"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${topicColor}`}>
                          {topicScore.score}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getGradeBgColor(topicScore.grade)}`}>
                          {topicScore.grade}
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={topicScore.score} max={10} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-black/5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-muted-green">
              {politician.speeches.length}
            </div>
            <div className="text-xs text-gray-400">Discursos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-blue">
              {politician.votes.length}
            </div>
            <div className="text-xs text-gray-400">Votos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-red">
              {politician.contradictions.length}
            </div>
            <div className="text-xs text-gray-400">Contradicciones</div>
          </div>
        </div>
      </div>
    </div>
  );
}