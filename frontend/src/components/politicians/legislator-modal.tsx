"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, MapPin, Award, Activity, Users } from "lucide-react";
import { getGradeColor, getGradeBgColor } from "@/lib/utils";
import type { PoliticianWithParty } from "@/lib/types";

interface LegislatorModalProps {
  politician: PoliticianWithParty | null;
  onClose: () => void;
}

export function LegislatorModal({ politician, onClose }: LegislatorModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (politician) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [politician]);

  if (!politician) return null;

  const gradeColor = getGradeColor(politician.consistency_grade);
  const gradeBgColor = getGradeBgColor(politician.consistency_grade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header with photo */}
        <div className="relative p-8 pb-6">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={politician.photo_url}
                  alt={politician.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {politician.party && (
                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-3 border-white shadow-md flex items-center justify-center"
                  style={{ backgroundColor: politician.party.color_hex }}
                >
                  <span className="text-white text-xs font-bold">
                    {politician.party.short_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              <h2 className="text-2xl font-serif font-semibold text-pure-black mb-1">
                {politician.full_name}
              </h2>
              <p className="text-gray-500 mb-3">
                {politician.current_role?.role_title || "Legislador"}
              </p>
              
              {/* Party badge */}
              {politician.party && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
                  style={{
                    backgroundColor: `${politician.party.color_hex}20`,
                    color: politician.party.color_hex,
                    border: `1px solid ${politician.party.color_hex}40`,
                  }}
                >
                  <Users className="h-4 w-4" />
                  {politician.party.name}
                </div>
              )}

              {/* Province */}
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                {politician.province}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-8 py-4 bg-gray-50/50 border-y border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            {/* Consistency Score */}
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Coherencia</span>
              </div>
              <div className={`text-3xl font-bold ${gradeColor}`}>
                {politician.consistency_score.toFixed(1)}
              </div>
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${gradeBgColor}`}>
                {politician.consistency_grade}
              </div>
            </div>

            {/* Activity Score */}
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Actividad</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {(politician.activity_score * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Presencia en sesiones
              </div>
            </div>

            {/* Speeches count (simulated) */}
            <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="material-symbols-outlined text-gray-400 text-[16px]">mic</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Discursos</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(politician.activity_score * 50)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Intervenciones
              </div>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">Bloque parlamentario</span>
              <span className="font-medium text-pure-black">
                {politician.party?.short_name || "Sin bloque"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">Distrito</span>
              <span className="font-medium text-pure-black">{politician.province}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500">Cargo</span>
              <span className="font-medium text-pure-black">
                {politician.current_role?.role_title || "Legislador"}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            <Link
              href={`/dashboard/politicians/${politician.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pure-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Ver perfil completo
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
