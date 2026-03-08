import { TrendingUp, MessageSquare, FileCheck } from "lucide-react";
import { getDiscourseGaps } from "@/lib/data";

export function GapChart() {
  const gaps = getDiscourseGaps();

  // Find the max gap ratio for scaling
  const maxGap = Math.max(...gaps.map(g => g.gap_ratio));

  return (
    <div className="bg-alethia-accent p-6 rounded-lg border border-alethia-highlight/20">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-alethia-gold" />
        <h3 className="text-xl font-bold text-white">Top Discourse Gaps</h3>
      </div>

      <div className="space-y-4">
        {gaps.slice(0, 8).map((gap, index) => {
          const percentage = (gap.gap_ratio / maxGap) * 100;

          return (
            <div key={gap.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-alethia-highlight flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{gap.topic.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {gap.mention_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCheck className="h-3 w-3" />
                        {gap.laws_enacted}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-alethia-gold font-bold text-lg">
                    {gap.gap_label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {gap.gap_severity === 'critical' ? 'Crítico' :
                     gap.gap_severity === 'high' ? 'Alto' :
                     gap.gap_severity === 'medium' ? 'Medio' : 'Bajo'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-alethia-primary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-alethia-gold to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-alethia-highlight/20">
        <p className="text-xs text-gray-400">
          Mide la brecha entre menciones en discursos vs. leyes aprobadas.
          Cuanto mayor el gap, mayor la discrepancia.
        </p>
      </div>
    </div>
  );
}