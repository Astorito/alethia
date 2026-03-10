"use client";

import { useState } from "react";
import type { PoliticianWithParty } from "@/lib/types";

interface PoliticianSphereProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

// Predefined mosaic layout: [col, row, size] — size: 1=small, 2=medium, 3=large
// Using a scattered grid pattern similar to the reference image
const MOSAIC_LAYOUT = [
  // col (unitless x), row (unitless y), size multiplier
  [0, 0, 1], [1, 0, 1.3], [2, 0, 1], [3, 0, 1.2], [4, 0, 1],
  [0.5, 1, 1.2], [1.5, 1, 1.6], [2.5, 1, 1.3], [3.5, 1, 1],
  [0, 2, 1], [1, 2, 1.3], [2, 2, 2.0], [3, 2, 1.3], [4, 2, 1],
  [0.5, 3, 1.2], [1.5, 3, 1.4], [2.5, 3, 1.6], [3.5, 3, 1.2],
  [0, 4, 1], [1, 4, 1.2], [2, 4, 1.3], [3, 4, 1.2], [4, 4, 1],
  [0.5, 5, 1], [1.5, 5, 1.3], [2.5, 5, 1.1], [3.5, 5, 1],
  [1, 6, 1], [2, 6, 1.2], [3, 6, 1],
];

// Each card gets a unique float animation delay
const FLOAT_DURATIONS = [3.2, 4.1, 3.7, 4.5, 3.0, 3.8, 4.2, 3.5, 4.0, 3.3];

export function PoliticianSphere({ politicians, onSelect }: PoliticianSphereProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const displayPoliticians = politicians.slice(0, MOSAIC_LAYOUT.length);

  const UNIT = 130; // px per grid unit
  const CARD_BASE = 90; // base card size in px

  return (
    <div className="w-full h-full min-h-[520px] relative overflow-auto">
      {/* Floating style injected once */}
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        .float-card-up { animation: float-up var(--dur, 3.5s) ease-in-out infinite; }
        .float-card-down { animation: float-down var(--dur, 3.5s) ease-in-out infinite; }
      `}</style>

      {/* Mosaic container - centered */}
      <div
        className="relative mx-auto"
        style={{
          width: UNIT * 5,
          height: UNIT * 7,
          minWidth: UNIT * 5,
        }}
      >
        {displayPoliticians.map((politician, i) => {
          const [col, row, size] = MOSAIC_LAYOUT[i];
          const cardSize = Math.round(CARD_BASE * size);
          const x = col * UNIT;
          const y = row * UNIT;
          const dur = FLOAT_DURATIONS[i % FLOAT_DURATIONS.length];
          const isEven = i % 2 === 0;
          const isHovered = hoveredId === politician.id;

          return (
            <div
              key={politician.id}
              className={isEven ? "float-card-up" : "float-card-down"}
              style={{
                position: "absolute",
                left: x,
                top: y,
                "--dur": `${dur}s`,
                animationDelay: `${(i * 0.3) % dur}s`,
                zIndex: isHovered ? 50 : Math.round(size * 10),
                transition: "z-index 0s",
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredId(politician.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(politician)}
            >
              <div
                style={{
                  width: cardSize,
                  height: cardSize + 36,
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: isHovered
                    ? "0 20px 50px rgba(0,0,0,0.22)"
                    : `0 ${4 + size * 4}px ${12 + size * 8}px rgba(0,0,0,${0.06 + size * 0.03})`,
                  transform: `scale(${isHovered ? 1.1 : 1})`,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {/* Photo fills most of the card */}
                <div style={{ width: "100%", height: cardSize, overflow: "hidden", position: "relative" }}>
                  <img
                    src={politician.photo_url}
                    alt={politician.full_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Party badge on top-right */}
                  {politician.party && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: politician.party.color_hex || "#555",
                        color: "white",
                        fontSize: 8,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 999,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        maxWidth: cardSize - 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {politician.party.short_name}
                    </div>
                  )}
                </div>

                {/* Name strip at bottom */}
                <div
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                    background: "white",
                  }}
                >
                  <p
                    style={{
                      fontSize: Math.max(9, Math.round(10 * size)),
                      fontWeight: 600,
                      color: "#1a1a1a",
                      textAlign: "center",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {politician.full_name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="sticky bottom-3 flex justify-center pointer-events-none">
        <p className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
          Clic en una tarjeta para ver el perfil completo
        </p>
      </div>
    </div>
  );
}
