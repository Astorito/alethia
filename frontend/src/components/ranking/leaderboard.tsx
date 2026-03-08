"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getGradeColor, getGradeBgColor } from "@/lib/utils";
import { getRanking } from "@/lib/data";
import type { PoliticianWithParty } from "@/lib/types";

interface LeaderboardProps {
  basePath?: string;
}

export function Leaderboard({ basePath = "/politicians" }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<"score" | "name" | "activity">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const politicians = getRanking();

  const sortedPoliticians = [...politicians].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortBy) {
      case "name":
        aVal = a.full_name;
        bVal = b.full_name;
        break;
      case "activity":
        aVal = a.activity_score;
        bVal = b.activity_score;
        break;
      case "score":
      default:
        aVal = a.consistency_score;
        bVal = b.consistency_score;
        break;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const toggleSort = (field: "score" | "name" | "activity") => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500 w-6 text-center">#{position}</span>;
    }
  };

  const getRankBg = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/40";
      default:
        return "glass-card-dash border-black/5";
    }
  };

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="bg-alethia-accent p-6 rounded-lg border border-alethia-highlight/20">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Ordenar por:</span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("score")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "score"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Score de Coherencia
              {sortBy === "score" && (
                sortDir === "desc" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => toggleSort("name")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "name"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Nombre
              {sortBy === "name" && <ArrowUpDown className="h-4 w-4" />}
            </button>
            <button
              onClick={() => toggleSort("activity")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "activity"
                  ? "bg-pure-black text-warm-white"
                  : "bg-black/5 text-gray-600 hover:bg-black/10"
              }`}
            >
              Actividad
              {sortBy === "activity" && (
                sortDir === "desc" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {sortedPoliticians.map((politician, index) => {
          const position = sortBy === "score" && sortDir === "desc" ? index + 1 : index + 1;
          const gradeColor = getGradeColor(politician.consistency_grade);
          const gradeBgColor = getGradeBgColor(politician.consistency_grade);

          return (
            <Link
              key={politician.id}
              href={`${basePath}/${politician.id}`}
              className={`block p-6 rounded-2xl border transition-all hover:border-black/10 hover:bg-white/80 ${getRankBg(position)}`}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0 flex items-center justify-center w-12">
                  {getRankIcon(position)}
                </div>

                {/* Photo */}
                <div className="flex-shrink-0">
                  <img
                    src={politician.photo_url}
                    alt={politician.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-alethia-highlight"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-pure-black font-semibold text-lg truncate">
                      {politician.full_name}
                    </h3>
                    {politician.party && (
                      <div
                        className="px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: politician.party.color_hex }}
                      >
                        {politician.party.short_name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{politician.current_role?.role_title || "Legislador"}</span>
                    <span>•</span>
                    <span>{politician.province}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 text-right">
                  {/* Consistency Score */}
                  <div>
                    <div className={`text-2xl font-bold ${gradeColor}`}>
                      {politician.consistency_score}
                    </div>
                    <div className={`text-sm ${gradeColor}`}>
                      {politician.consistency_grade}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-32">
                    <ProgressBar value={politician.consistency_score} className="h-2" />
                  </div>

                  {/* Activity */}
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-blue">
                      {politician.activity_score.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Actividad</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="glass-card-dash p-4 rounded-2xl border border-black/5">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>Top 3: Posiciones destacadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted-gold rounded"></div>
            <span>Score de Coherencia: 0-10</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted-blue rounded"></div>
            <span>Actividad: Nivel de participación</span>
          </div>
        </div>
      </div>
    </div>
  );
}