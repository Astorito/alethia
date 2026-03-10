"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PoliticianWithParty } from "@/lib/types";

interface PoliticianSphereProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

interface CardPosition {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
}

function getGoldenPositions(count: number, radius: number): CardPosition[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const positions: CardPosition[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 1 - t * 2; // 1 to -1
    const rxy = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;

    const x = Math.cos(theta) * rxy * radius;
    const z = Math.sin(theta) * rxy * radius;
    const yPos = y * radius * 0.55;

    const rotY = -Math.atan2(x, z) * (180 / Math.PI);
    const rotX = Math.atan2(yPos, Math.sqrt(x * x + z * z)) * (180 / Math.PI) * 0.4;

    positions.push({ x, y: yPos, z, rotateX: rotX, rotateY: rotY });
  }
  return positions;
}

export function PoliticianSphere({ politicians, onSelect }: PoliticianSphereProps) {
  const [rotX, setRotX] = useState(10);
  const [rotY, setRotY] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const rotRef = useRef({ x: 10, y: 0 });

  const RADIUS = 340;
  const displayPoliticians = politicians.slice(0, 30);

  // Inertia animation
  const animate = useCallback(() => {
    if (!isDragging.current) {
      velRef.current.y = velRef.current.y * 0.96 + 0.12; // auto-rotate + inertia
      velRef.current.x *= 0.95;

      rotRef.current.y += velRef.current.y;
      rotRef.current.x += velRef.current.x;
      rotRef.current.x = Math.max(-25, Math.min(25, rotRef.current.x));

      setRotY(rotRef.current.y);
      setRotX(rotRef.current.x);
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0 };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    velRef.current = { x: dy * 0.15, y: dx * 0.15 };
    rotRef.current.y += dx * 0.35;
    rotRef.current.x += dy * 0.2;
    rotRef.current.x = Math.max(-25, Math.min(25, rotRef.current.x));
    setRotY(rotRef.current.y);
    setRotX(rotRef.current.x);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    velRef.current = { x: 0, y: 0 };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastMouse.current.x;
    const dy = e.touches[0].clientY - lastMouse.current.y;
    velRef.current = { x: dy * 0.15, y: dx * 0.15 };
    rotRef.current.y += dx * 0.35;
    rotRef.current.x += dy * 0.2;
    rotRef.current.x = Math.max(-25, Math.min(25, rotRef.current.x));
    setRotY(rotRef.current.y);
    setRotX(rotRef.current.x);
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const positions = getGoldenPositions(displayPoliticians.length, RADIUS);

  // For each card, compute transformed Z after sphere rotation to determine opacity
  const cardsWithDepth = displayPoliticians.map((p, i) => {
    const pos = positions[i];
    const ry = rotY * (Math.PI / 180);
    const rx = rotX * (Math.PI / 180);

    // Rotate Z around Y axis
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x2 = pos.x * cosY + pos.z * sinY;
    const z2 = -pos.x * sinY + pos.z * cosY;

    // Rotate Z around X axis
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const z3 = pos.y * sinX + z2 * cosX;

    return { politician: p, pos, transformedZ: z3, index: i };
  });

  // Sort by depth (back to front)
  cardsWithDepth.sort((a, b) => a.transformedZ - b.transformedZ);

  return (
    <div
      className="w-full h-full min-h-[520px] relative flex items-center justify-center overflow-hidden select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
    >
      {/* 3D Scene */}
      <div
        style={{
          width: 0,
          height: 0,
          position: "relative",
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging.current ? "none" : "transform 0.05s linear",
          }}
        >
          {cardsWithDepth.map(({ politician, pos, transformedZ }) => {
            const maxZ = RADIUS;
            // Normalized depth: 1 = closest, 0 = farthest
            const depth = (transformedZ + maxZ) / (maxZ * 2);
            const opacity = 0.25 + depth * 0.75;
            const scale = 0.75 + depth * 0.35;
            const blur = (1 - depth) * 5;
            const isHovered = hoveredId === politician.id;

            return (
              <div
                key={politician.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${pos.rotateY}deg)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <div
                  onClick={() => onSelect(politician)}
                  onMouseEnter={() => setHoveredId(politician.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: "120px",
                    transform: `translate(-50%, -50%) scale(${isHovered ? scale * 1.2 : scale})`,
                    opacity: isHovered ? 1 : opacity,
                    filter: isHovered ? "none" : `blur(${blur}px)`,
                    transition: "transform 0.3s, opacity 0.3s, filter 0.3s",
                    cursor: "pointer",
                    zIndex: Math.round(depth * 100),
                  }}
                >
                  {/* Card */}
                  <div
                    style={{
                      background: isHovered ? "white" : `rgba(255,255,255,${0.6 + depth * 0.4})`,
                      borderRadius: "16px",
                      padding: "12px",
                      boxShadow: isHovered
                        ? "0 20px 60px rgba(0,0,0,0.2)"
                        : `0 ${4 + depth * 8}px ${8 + depth * 16}px rgba(0,0,0,${0.04 + depth * 0.08})`,
                      border: `1px solid rgba(0,0,0,${0.05 + depth * 0.05})`,
                      textAlign: "center",
                    }}
                  >
                    {/* Photo */}
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 8px",
                        border: politician.party?.color_hex
                          ? `3px solid ${politician.party.color_hex}`
                          : "3px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      }}
                    >
                      <img
                        src={politician.photo_url}
                        alt={politician.full_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Name */}
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        lineHeight: 1.3,
                        marginBottom: "4px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {politician.full_name}
                    </p>

                    {/* Party */}
                    {politician.party && (
                      <p
                        style={{
                          fontSize: "9px",
                          color: politician.party.color_hex,
                          fontWeight: 500,
                        }}
                      >
                        {politician.party.short_name}
                      </p>
                    )}
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
