"use client";

import { useState } from "react";
import { Share2, Download, Twitter } from "lucide-react";
import html2canvas from "html2canvas";
import type { PoliticianProfile } from "@/lib/types";

interface ShareCardProps {
  politician: PoliticianProfile;
}

export function ShareCard({ politician }: ShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("share-card-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#1A1A2E",
        scale: 2,
        width: 600,
        height: 400,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `alethia-${politician.full_name.toLowerCase().replace(/\s+/g, "-")}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnTwitter = () => {
    const text = `Conoce el perfil de coherencia de ${politician.full_name} en Alethia. Score: ${politician.consistency_score}/10 (${politician.consistency_grade})`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-bold text-pure-black">Compartir Perfil</h3>
      </div>

      <div className="flex gap-3">
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-pure-black text-warm-white rounded-full hover:bg-alethia-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-black/80"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? "Generando..." : "Descargar PNG"}
        </button>

        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Twitter className="h-4 w-4" />
          Compartir en X
        </button>
      </div>

      {/* Hidden share card content for image generation */}
      <div
        id="share-card-content"
        className="fixed left-[-9999px] top-[-9999px] w-[600px] h-[400px] bg-warm-white p-8 flex flex-col justify-between"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-2xl font-bold text-pure-black mb-2">Alethia</div>
          <div className="text-sm text-gray-300 mb-6">Plataforma de Inteligencia Política</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center gap-8">
          {/* Photo */}
          <div className="flex-shrink-0">
            <img
              src={politician.photo_url}
              alt={politician.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-black/10"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-pure-black mb-2">
              {politician.full_name}
            </h2>
            <p className="text-gray-300 mb-4">
              {politician.current_role?.role_title} • {politician.province}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-muted-gold mb-1">
                  {politician.consistency_score}
                </div>
                <div className="text-sm text-gray-300">Score de Coherencia</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pure-black mb-1">
                  {politician.consistency_grade}
                </div>
                <div className="text-sm text-gray-300">Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          Visita alethia.app para más información sobre transparencia legislativa
        </div>
      </div>
    </div>
  );
}