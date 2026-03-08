"use client";

import { useState, useMemo } from "react";
import { Search, Users, GitCompare, TrendingUp, Vote, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getGradeColor, getGradeBgColor } from "@/lib/utils";
import { getAllPoliticians, comparePoliticians } from "@/lib/data";
import type { PoliticianWithParty, PoliticianProfile } from "@/lib/types";

export function CompareView() {
  const [politicianAId, setPoliticianAId] = useState<string>("");
  const [politicianBId, setPoliticianBId] = useState<string>("");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const politicians = getAllPoliticians();

  const filteredPoliticiansA = useMemo(() => {
    if (!searchA) return politicians;
    return politicians.filter(p =>
      p.full_name.toLowerCase().includes(searchA.toLowerCase())
    );
  }, [politicians, searchA]);

  const filteredPoliticiansB = useMemo(() => {
    if (!searchB) return politicians.filter(p => p.id !== politicianAId);
    return politicians
      .filter(p => p.id !== politicianAId)
      .filter(p => p.full_name.toLowerCase().includes(searchB.toLowerCase()));
  }, [politicians, searchB, politicianAId]);

  const comparison = useMemo(() => {
    if (!politicianAId || !politicianBId) return null;
    return comparePoliticians(politicianAId, politicianBId);
  }, [politicianAId, politicianBId]);

  const politicianA = politicians.find(p => p.id === politicianAId);
  const politicianB = politicians.find(p => p.id === politicianBId);

  const renderPoliticianSelector = (
    label: string,
    value: string,
    onChange: (id: string) => void,
    searchValue: string,
    onSearchChange: (value: string) => void,
    filteredPoliticians: PoliticianWithParty[],
    disabledIds: string[] = []
  ) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar legislador..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/60 border border-black/10 rounded-xl text-pure-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-muted-blue focus:border-transparent"
        />
      </div>

      {/* Selected Politician */}
      {value && (
        <div className="p-4 glass-card-dash rounded-xl border border-black/5">
          {(() => {
            const politician = politicians.find(p => p.id === value);
            if (!politician) return null;

            return (
              <div className="flex items-center gap-3">
                <img
                  src={politician.photo_url}
                  alt={politician.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-black/10"
                />
                <div>
                  <h4 className="text-pure-black font-medium">{politician.full_name}</h4>
                  <p className="text-sm text-gray-400">
                    {politician.party?.short_name} • {politician.province}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Politician List */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredPoliticians
          .filter(p => !disabledIds.includes(p.id))
          .slice(0, 10)
          .map((politician) => (
            <button
              key={politician.id}
              onClick={() => onChange(politician.id)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                value === politician.id
                  ? "bg-pure-black text-warm-white border-pure-black"
                  : "bg-white/60 border-black/10 hover:bg-white/80 text-pure-black"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={politician.photo_url}
                  alt={politician.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-sm">{politician.full_name}</div>
                  <div className="text-xs text-gray-400">
                    {politician.party?.short_name} • {politician.consistency_score}
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  const renderPoliticianCard = (politician: PoliticianProfile | null, position: "left" | "right") => {
    if (!politician) {
      return (
        <div className="glass-card-dash p-8 rounded-2xl border border-black/5 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona un legislador para comparar</p>
          </div>
        </div>
      );
    }

    const gradeColor = getGradeColor(politician.consistency_grade);
    const gradeBgColor = getGradeBgColor(politician.consistency_grade);

    return (
      <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src={politician.photo_url}
            alt={politician.full_name}
            className="w-20 h-20 rounded-full object-cover border-4 border-black/10 mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-pure-black mb-2">{politician.full_name}</h3>
          <p className="text-gray-400 mb-3">{politician.current_role?.role_title}</p>
          {politician.party && (
            <Badge
              className="text-sm"
              style={{
                backgroundColor: `${politician.party.color_hex}20`,
                color: politician.party.color_hex,
                borderColor: `${politician.party.color_hex}40`
              }}
            >
              {politician.party.name}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${gradeColor}`}>
              {politician.consistency_score}
            </div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {politician.votes.length}
            </div>
            <div className="text-sm text-gray-400">Votos</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Coherencia</span>
            <span className={`text-sm font-medium ${gradeColor}`}>
              {politician.consistency_grade}
            </span>
          </div>
          <ProgressBar value={politician.consistency_score} className="h-3" />
        </div>

        {/* Contradictions */}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {politician.contradictions.length}
          </div>
          <div className="text-sm text-gray-400">Contradicciones</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Selector Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderPoliticianSelector(
          "Primer Legislador",
          politicianAId,
          setPoliticianAId,
          searchA,
          setSearchA,
          filteredPoliticiansA
        )}

        {renderPoliticianSelector(
          "Segundo Legislador",
          politicianBId,
          setPoliticianBId,
          searchB,
          setSearchB,
          filteredPoliticiansB,
          [politicianAId]
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-8">
          {/* VS Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 glass-card-dash px-6 py-3 rounded-full border border-black/5">
              <div className="text-2xl font-bold text-muted-gold">
                {comparison.a.consistency_score}
              </div>
              <GitCompare className="h-6 w-6 text-muted-gold" />
              <div className="text-2xl font-bold text-muted-gold">
                {comparison.b.consistency_score}
              </div>
            </div>
            <p className="text-gray-400 mt-2">
              Tasa de alineamiento: {(comparison.alignment_rate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Side by Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderPoliticianCard(comparison.a, "left")}
            {renderPoliticianCard(comparison.b, "right")}
          </div>

          {/* Shared Votes Analysis */}
          {comparison.shared_votes > 0 && (
            <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
              <div className="flex items-center gap-3 mb-4">
                <Vote className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-pure-black">
                  Votos Compartidos ({comparison.shared_votes})
                </h3>
              </div>
              <p className="text-gray-300">
                Han votado juntos en {comparison.shared_votes} ocasiones,
                con una tasa de alineamiento del {(comparison.alignment_rate * 100).toFixed(1)}%.
              </p>
            </div>
          )}

          {/* Difference Highlight */}
          <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-pure-black">Diferencia de Coherencia</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pure-black mb-1">
                  {Math.abs(comparison.a.consistency_score - comparison.b.consistency_score).toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Diferencia de Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pure-black mb-1">
                  {Math.abs(comparison.a.votes.length - comparison.b.votes.length)}
                </div>
                <div className="text-sm text-gray-400">Diferencia de Votos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pure-black mb-1">
                  {Math.abs(comparison.a.contradictions.length - comparison.b.contradictions.length)}
                </div>
                <div className="text-sm text-gray-400">Diferencia de Contradicciones</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}