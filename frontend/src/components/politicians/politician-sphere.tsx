"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PoliticianWithParty } from "@/lib/types";

interface PoliticianSphereProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

// Golden angle spiral positions on a sphere
function getSpherePositions(count: number, radius: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const y = 1 - t * 2;
    const rxy = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    return {
      x: Math.cos(theta) * rxy * radius,
      y: y * radius * 0.6,
      z: Math.sin(theta) * rxy * radius,
    };
  });
}

// Card dimensions: 3:5 ratio
const CARD_W = 110;
const CARD_H = Math.round(CARD_W * (5 / 3)); // ~183px

export function PoliticianSphere({ politicians, onSelect }: PoliticianSphereProps) {
  const [rotX, setRotX] = useState(8);
  const [rotY, setRotY] = useState(0);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 8, y: 0 });
  const animRef = useRef<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 20% smaller radius (was 320, now 256) and 50 cards with tighter packing
  const RADIUS = 256;
  const displayPoliticians = politicians.slice(0, 50);
  const positions = getSpherePositions(displayPoliticians.length, RADIUS);

  // Auto-rotate with inertia
  // No auto-rotate: only inertia decay when not dragging
  const animate = useCallback(() => {
    if (!isDragging.current) {
      // Inertia only, no auto-rotation
      velRef.current.y *= 0.92;
      velRef.current.x *= 0.92;
      if (Math.abs(velRef.current.y) > 0.01 || Math.abs(velRef.current.x) > 0.01) {
        rotRef.current.y += velRef.current.y;
        rotRef.current.x += velRef.current.x;
        rotRef.current.x = Math.max(-30, Math.min(30, rotRef.current.x));
        setRotY(rotRef.current.y);
        setRotX(rotRef.current.x);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const startDrag = (x: number, y: number) => {
    isDragging.current = true;
    lastPos.current = { x, y };
    velRef.current = { x: 0, y: 0 };
  };

  const moveDrag = (x: number, y: number) => {
    if (!isDragging.current) return;
    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    velRef.current = { x: dy * 0.12, y: dx * 0.12 };
    rotRef.current.y += dx * 0.4;
    rotRef.current.x += dy * 0.25;
    rotRef.current.x = Math.max(-30, Math.min(30, rotRef.current.x));
    setRotY(rotRef.current.y);
    setRotX(rotRef.current.x);
    lastPos.current = { x, y };
  };

  const endDrag = () => { isDragging.current = false; };

  // Compute transformed Z for each card (to determine depth/opacity)
  const cardsWithDepth = displayPoliticians.map((p, i) => {
    const pos = positions[i];
    const ry = rotRef.current.y * (Math.PI / 180);
    const rx = rotRef.current.x * (Math.PI / 180);
    // Rotate around Y
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x2 = pos.x * cosY + pos.z * sinY;
    const z2 = -pos.x * sinY + pos.z * cosY;
    // Rotate around X
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const z3 = pos.y * sinX + z2 * cosX;
    return { politician: p, pos, depth: z3 }; // higher depth = closer to camera
  });

  // Sort back-to-front for correct paint order
  const sorted = [...cardsWithDepth].sort((a, b) => a.depth - b.depth);

  // Map depth to opacity: front=0.85, mid=0.60, back=0.40
  const maxZ = RADIUS;
  const getOpacity = (depth: number) => {
    const norm = (depth + maxZ) / (maxZ * 2); // 0=back, 1=front
    if (norm >= 0.7) return 0.85;   // front: 15% transparent
    if (norm >= 0.35) return 0.60;  // middle: 40% transparent
    return 0.40;                    // back: 60% transparent
  };

  const getBlur = (depth: number) => {
    const norm = (depth + maxZ) / (maxZ * 2);
    if (norm >= 0.7) return 0;
    if (norm >= 0.35) return 1;
    return 2.5;
  };

  return (
    <div
      className="w-full h-full min-h-[520px] relative flex items-center justify-center overflow-hidden select-none"
      style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={endDrag}
    >
      {/* Float keyframes — very subtle */}
      <style>{`
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* 3D sphere scene */}
      <div style={{ width: 0, height: 0, position: "relative" }}>
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {sorted.map(({ politician, pos, depth }) => {
            const norm = (depth + maxZ) / (maxZ * 2);
            const opacity = hoveredId === politician.id ? 1 : getOpacity(depth);
            const blur = hoveredId === politician.id ? 0 : getBlur(depth);
            const scale = 0.78 + norm * 0.28; // 0.78 back → 1.06 front
            const floatDelay = (politician.id.charCodeAt(0) % 10) * 0.4;

            return (
              <div
                key={politician.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  zIndex: Math.round(norm * 100),
                }}
              >
                {/* Subtle float wrapper */}
                <div
                  style={{
                    animation: `subtle-float ${3.5 + (floatDelay % 1.5)}s ease-in-out infinite`,
                    animationDelay: `${floatDelay}s`,
                  }}
                >
                  <div
                    onClick={() => onSelect(politician)}
                    onMouseEnter={() => setHoveredId(politician.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      width: CARD_W,
                      height: CARD_H,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      opacity,
                      filter: blur > 0 ? `blur(${blur}px)` : "none",
                      transition: "opacity 0.3s, filter 0.3s, transform 0.3s",
                      cursor: "pointer",
                      borderRadius: 14,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: hoveredId === politician.id
                        ? "0 16px 40px rgba(0,0,0,0.28)"
                        : `0 ${2 + norm * 10}px ${6 + norm * 20}px rgba(0,0,0,${0.08 + norm * 0.14})`,
                    }}
                  >
                    {/* Full-bleed photo */}
                    <img
                      src={politician.photo_url}
                      alt={politician.full_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                      draggable={false}
                    />

                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
                      }}
                    />

                    {/* Party badge — top right */}
                    {politician.party && (
                      <div
                        style={{
                          position: "absolute",
                          top: 7,
                          right: 7,
                          background: politician.party.color_hex || "#444",
                          color: "white",
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "3px 7px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                          maxWidth: CARD_W - 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {politician.party.short_name}
                      </div>
                    )}

                    {/* Name — bottom overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "8px 8px 9px",
                      }}
                    >
                      <p
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontWeight: 600,
                          lineHeight: 1.25,
                          margin: 0,
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-xs text-gray-400 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5">
          Arrastrá para rotar · Clic para ver perfil
        </p>
      </div>
    </div>
  );
}
