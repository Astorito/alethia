"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { PoliticianWithParty } from "@/lib/types";

interface PoliticianCarouselProps {
  politicians: PoliticianWithParty[];
  onSelect: (politician: PoliticianWithParty) => void;
}

// ── Config ────────────────────────────────────────────────────
const CFG = {
  cardW: 160,         // px  (3:5 portrait ratio)
  cardH: 267,         // px
  cardGap: 14,        // px  gap between projected edges
  cardRadius: 14,     // px  border-radius
  poolSize: 15,       // must be odd — mesh instances in DOM
  centralZ: 60,       // px  z-boost for centre card
  sideZStep: 18,      // px  z-recession per card outward
  maxRotDeg: 72,      // max Y-rotation for far cards
  rotCurve: 1.1,      // exponential curve speed
  springK: 0.028,     // global scroll spring — más suave para ver el movimiento
  springD: 0.78,      // global scroll spring damping
  cardSpringK: 0.055, // per-card spring — más suave
  cardSpringD: 0.82,  // per-card spring damping
  opacityStep: 0.055, // opacity fade per card slot outward
  snapDelay: 500,     // ms antes de snap al entero más cercano
};

function rotForDist(d: number): number {
  if (d === 0) return 0;
  const maxRad = (Math.PI / 2) * (CFG.maxRotDeg / 90);
  return maxRad * (1 - Math.exp(-d * CFG.rotCurve));
}

function computeSlotPositions(): number[] {
  const half = Math.floor(CFG.poolSize / 2);
  const pos = new Array(CFG.poolSize).fill(0);
  let curX = 0;
  for (let d = 0; d <= half; d++) {
    const visW = CFG.cardW * Math.cos(rotForDist(d));
    if (d === 0) {
      pos[half] = 0;
      curX = visW / 2;
    } else {
      curX += CFG.cardGap + visW / 2;
      pos[half + d] = curX;
      curX += visW / 2;
    }
  }
  for (let d = 1; d <= half; d++) pos[half - d] = -pos[half + d];
  return pos;
}

const SLOT_POSITIONS = computeSlotPositions();

interface SpringState {
  x: number; z: number; rotY: number; opacity: number;
  vx: number; vz: number; vr: number;
}

export function PoliticianCarousel({ politicians, onSelect }: PoliticianCarouselProps) {
  const total = Math.max(politicians.length, 1);
  const half = Math.floor(CFG.poolSize / 2);

  // Scroll physics state (all mutable refs for rAF loop)
  const scrollPos    = useRef(0);
  const scrollVel    = useRef(0);
  const scrollTarget = useRef(0);
  const springs      = useRef<SpringState[]>(
    Array.from({ length: CFG.poolSize }, () => ({
      x: 0, z: 0, rotY: 0, opacity: 1,
      vx: 0, vz: 0, vr: 0,
    }))
  );

  // Per-card DOM refs for direct mutation (no re-render per frame)
  const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(CFG.poolSize).fill(null));
  // Index of which politician each slot shows
  const slotIndex = useRef<number[]>(
    Array.from({ length: CFG.poolSize }, (_, i) => i % total)
  );

  // Touch / drag tracking
  const touchLast    = useRef(0);
  const touchHistory = useRef<{ v: number; t: number }[]>([]);
  const wheelTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDrag      = useRef(false); // guard: prevent click after drag

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Animation loop ───────────────────────────────────────────
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    // Global spring
    scrollVel.current += (scrollTarget.current - scrollPos.current) * CFG.springK;
    scrollVel.current *= CFG.springD;
    scrollPos.current += scrollVel.current;

    const sp = springs.current;

    for (let i = 0; i < CFG.poolSize; i++) {
      const offset  = i - half;
      const nearest = Math.round(scrollPos.current + offset);
      const texIdx  = ((nearest % total) + total) % total;

      // Update which politician this slot shows
      if (slotIndex.current[i] !== texIdx) {
        slotIndex.current[i] = texIdx;
        const card = cardRefs.current[i];
        if (card) {
          const politician = politicians[texIdx];
          // Update photo
          const img = card.querySelector<HTMLImageElement>(".card-photo");
          if (img && politician) img.src = politician.photo_url;
          // Update name
          const name = card.querySelector<HTMLElement>(".card-name");
          if (name && politician) name.textContent = politician.full_name;
          // Update party badge
          const badge = card.querySelector<HTMLElement>(".card-party");
          if (badge && politician?.party) {
            badge.textContent = politician.party.short_name;
            (badge as HTMLElement).style.background = politician.party.color_hex || "#444";
          }
          // Update score
          const score = card.querySelector<HTMLElement>(".card-score");
          if (score && politician) {
            score.textContent = String(politician.consistency_score ?? "–");
          }
        }
      }

      const dist = Math.abs(offset);
      const tX   = SLOT_POSITIONS[i];
      const tZ   = dist === 0 ? CFG.centralZ : -dist * CFG.sideZStep;
      const tRot = offset >= 0 ? rotForDist(dist) : -rotForDist(dist);
      const tOp  = Math.max(0, 1 - dist * CFG.opacityStep);

      // Per-card springs
      sp[i].vx  += (tX    - sp[i].x)    * CFG.cardSpringK; sp[i].vx  *= CFG.cardSpringD; sp[i].x    += sp[i].vx;
      sp[i].vz  += (tZ    - sp[i].z)    * CFG.cardSpringK; sp[i].vz  *= CFG.cardSpringD; sp[i].z    += sp[i].vz;
      sp[i].vr  += (-tRot - sp[i].rotY) * CFG.cardSpringK; sp[i].vr  *= CFG.cardSpringD; sp[i].rotY += sp[i].vr;
      sp[i].opacity += (tOp - sp[i].opacity) * 0.08;

      // Apply directly to DOM
      const el = cardRefs.current[i];
      if (el) {
        el.style.transform = `
          translateX(${sp[i].x}px)
          translateZ(${sp[i].z}px)
          rotateY(${sp[i].rotY}rad)
        `;
        el.style.opacity = String(sp[i].opacity);
        el.style.zIndex  = String(CFG.poolSize - dist);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [politicians, total, half]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // ── Event listeners ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      didDrag.current = true;
      scrollTarget.current += e.deltaY * 0.007;
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      // Snap al entero más cercano sólo después de que el usuario pare
      wheelTimer.current = setTimeout(() => {
        scrollTarget.current = Math.round(scrollTarget.current);
        // Resetear drag guard un poco después del snap
        setTimeout(() => { didDrag.current = false; }, 100);
      }, CFG.snapDelay);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchLast.current = e.touches[0].clientX;
      touchHistory.current = [];
      scrollVel.current = 0;
      didDrag.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = touchLast.current - e.touches[0].clientX;
      if (Math.abs(dx) > 3) didDrag.current = true;
      const dv = dx / el.clientWidth * 9;
      scrollTarget.current += dv;
      touchHistory.current.push({ v: dv, t: performance.now() });
      if (touchHistory.current.length > 6) touchHistory.current.shift();
      touchLast.current = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      const recent = touchHistory.current.filter(h => performance.now() - h.t < 100);
      const fling  = recent.length ? recent.reduce((a, b) => a + b.v, 0) / recent.length : 0;
      scrollTarget.current += fling * 6;
      setTimeout(() => {
        scrollTarget.current = Math.round(scrollTarget.current);
        setTimeout(() => { didDrag.current = false; }, 100);
      }, CFG.snapDelay);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // ── Click handler ────────────────────────────────────────────
  const handleCardClick = useCallback((slotIdx: number) => {
    if (didDrag.current) return; // ignorar clicks que son parte de un scroll
    const polIdx = slotIndex.current[slotIdx];
    if (politicians[polIdx]) onSelect(politicians[polIdx]);
  }, [politicians, onSelect]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ perspective: "900px", cursor: "grab" }}
    >
      {/* 3D scene anchor */}
      <div style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d" }}>
        {Array.from({ length: CFG.poolSize }, (_, i) => {
          const initPolIdx = i % total;
          const politician = politicians[initPolIdx] ?? null;

          return (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              onClick={() => handleCardClick(i)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: CFG.cardW,
                height: CFG.cardH,
                transform: `translateX(${SLOT_POSITIONS[i]}px) translateZ(0px) rotateY(0rad)`,
                transformOrigin: "center center",
                opacity: 1,
                borderRadius: CFG.cardRadius,
                overflow: "hidden",
                cursor: "pointer",
                willChange: "transform, opacity",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                translate: `-${CFG.cardW / 2}px -${CFG.cardH / 2}px`,
              }}
            >
              {/* Photo */}
              <img
                className="card-photo"
                src={politician?.photo_url ?? ""}
                alt={politician?.full_name ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                draggable={false}
              />

              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 52%, transparent 100%)",
              }} />

              {/* Party badge — top right */}
              {politician?.party && (
                <div
                  className="card-party"
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: politician.party.color_hex || "#444",
                    color: "white", fontSize: 8, fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "3px 7px", borderRadius: 999,
                    whiteSpace: "nowrap", maxWidth: CFG.cardW - 20,
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {politician.party.short_name}
                </div>
              )}

              {/* Name + score bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 11px" }}>
                <p className="card-name" style={{
                  color: "white", fontSize: 11, fontWeight: 700,
                  lineHeight: 1.3, margin: 0,
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                }}>
                  {politician?.full_name ?? ""}
                </p>
                {politician && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <span className="card-score" style={{
                      color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {politician.consistency_score ?? "–"}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9 }}>coherencia</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-xs text-gray-400 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-black/5">
          Scrolleá o deslizá para explorar · Clic para ver perfil
        </p>
      </div>
    </div>
  );
}