"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExecutiveAuthority } from "@/lib/types";

interface DepthDeckCarouselProps {
  authorities: ExecutiveAuthority[];
  onSelect: (authority: ExecutiveAuthority) => void;
}

const CARD_WIDTH = 260;
// How much each side card shifts from center — less than card width = overlap
const STEP = 200;
// How many cards to show on each side
const SIDE_COUNT = 2;

function getCardTransform(offset: number): {
  x: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
} {
  const abs = Math.abs(offset);

  if (abs === 0) {
    return { x: 0, scale: 1, opacity: 1, blur: 0, zIndex: 30 };
  }
  if (abs === 1) {
    return {
      x: offset * STEP,
      scale: 0.88,
      opacity: 0.72,
      blur: 1.5,
      zIndex: 20,
    };
  }
  if (abs === 2) {
    return {
      x: offset * STEP,
      scale: 0.76,
      opacity: 0.45,
      blur: 3.5,
      zIndex: 10,
    };
  }
  // Hidden
  return {
    x: offset < 0 ? -(STEP * 3.5) : STEP * 3.5,
    scale: 0.65,
    opacity: 0,
    blur: 8,
    zIndex: 0,
  };
}

export function DepthDeckCarousel({ authorities, onSelect }: DepthDeckCarouselProps) {
  const [active, setActive] = useState(0);
  const [startX, setStartX] = useState(0);

  const prev = () => setActive((i) => Math.max(0, i - 1));
  const next = () => setActive((i) => Math.min(authorities.length - 1, i + 1));

  const handleMouseDown = (e: React.MouseEvent) => setStartX(e.clientX);
  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = startX - e.clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
  };

  const handleTouchStart = (e: React.TouchEvent) =>
    setStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 40) next();
    else if (diff < -40) prev();
  };

  return (
    <div className="relative w-full select-none">
      {/* Prev */}
      <button
        onClick={prev}
        disabled={active === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          active === 0
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-110"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Next */}
      <button
        onClick={next}
        disabled={active >= authorities.length - 1}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
          active >= authorities.length - 1
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-110"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Stage */}
      <div
        className="relative h-[340px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {authorities.map((authority, index) => {
            const offset = index - active;
            if (Math.abs(offset) > SIDE_COUNT + 1) return null;

            const t = getCardTransform(offset);

            return (
              <motion.div
                key={authority.id}
                className="absolute"
                style={{ width: CARD_WIDTH, pointerEvents: t.opacity < 0.1 ? "none" : "auto" }}
                animate={{
                  x: t.x,
                  scale: t.scale,
                  opacity: t.opacity,
                  zIndex: t.zIndex,
                  filter: `blur(${t.blur}px)`,
                }}
                transition={{ type: "spring", stiffness: 320, damping: 35 }}
                onClick={() => {
                  if (offset === 0) onSelect(authority);
                  else setActive(index);
                }}
              >
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white ${
                    offset === 0
                      ? "shadow-2xl border-black/8 ring-1 ring-black/5"
                      : "shadow-md border-black/5"
                  }`}
                >
                  {/* Photo area */}
                  <div className="flex flex-col items-center pt-8 px-6 pb-6">
                    <div
                      className={`relative rounded-full overflow-hidden bg-gray-100 mb-4 ring-4 ring-white shadow-lg transition-transform duration-300 ${
                        offset === 0 ? "w-28 h-28" : "w-20 h-20"
                      }`}
                    >
                      <Image
                        src={authority.photo_url}
                        alt={authority.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h3
                      className={`font-serif font-semibold text-center text-pure-black leading-tight mb-1 ${
                        offset === 0 ? "text-lg" : "text-sm"
                      }`}
                    >
                      {authority.full_name}
                    </h3>

                    <p
                      className={`text-center text-gray-500 line-clamp-1 mb-2 ${
                        offset === 0 ? "text-sm" : "text-xs"
                      }`}
                    >
                      {authority.ministry_or_area || authority.role_title}
                    </p>

                    <p className="text-xs text-gray-400 font-mono">
                      {new Date(authority.started_at).getFullYear()}–
                      {authority.ended_at
                        ? new Date(authority.ended_at).getFullYear()
                        : "Presente"}
                    </p>
                  </div>

                  {/* Footer — only center card */}
                  {offset === 0 && (
                    <div className="border-t border-black/5 px-6 py-3 flex items-center justify-center gap-1">
                      <span className="text-xs text-blue-600 font-medium">
                        Ver perfil completo
                      </span>
                      <ChevronRight className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {authorities.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? "w-5 h-1.5 bg-gray-600"
                : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
