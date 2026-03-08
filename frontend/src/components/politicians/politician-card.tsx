import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getGradeColor, getGradeBgColor } from "@/lib/utils";
import type { PoliticianWithParty } from "@/lib/types";

interface PoliticianCardProps {
  politician: PoliticianWithParty;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  const gradeColor = getGradeColor(politician.consistency_grade);
  const gradeBgColor = getGradeBgColor(politician.consistency_grade);

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5 hover:border-black/10 hover:bg-white/80 transition-all cursor-pointer group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img
            src={politician.photo_url}
            alt={politician.full_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-black/10"
          />
          {politician.party && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white"
              style={{ backgroundColor: politician.party.color_hex }}
            />
          )}
        </div>
        <div>
          <h3 className="text-pure-black font-semibold text-lg leading-tight">
            {politician.full_name}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {politician.current_role?.role_title || "Legislador"}
          </p>
        </div>
        {politician.party && (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${politician.party.color_hex}20`,
              color: politician.party.color_hex,
              borderColor: `${politician.party.color_hex}40`,
            }}
          >
            {politician.party.short_name}
          </Badge>
        )}
        <p className="text-gray-400 text-xs">{politician.province}</p>
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Coherencia</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${gradeColor}`}>
                {politician.consistency_score}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${gradeBgColor}`}>
                {politician.consistency_grade}
              </span>
            </div>
          </div>
          <ProgressBar value={politician.consistency_score} className="h-1.5" />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Actividad</span>
            <span>{politician.activity_score.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
