"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExecutiveAuthority } from "@/lib/types";

interface DepthDeckCarouselProps {
  authorities: ExecutiveAuthority[];
  onSelect: (authority: ExecutiveAuthority) => void;
}

export function DepthDeckCarousel({ authorities, onSelect }: DepthDeckCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemWidth = 280;
  const gap = 24;
  const visibleCount = 4;

  const maxIndex = Math.max(0, authorities.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const getCardStyle = (index: number) => {
    const relativeIndex = index - currentIndex;
    const isVisible = relativeIndex >= -1 && relativeIndex < visibleCount + 1;
    
    if (!isVisible) {
      return {
        opacity: 0,
        scale: 0.7,
        zIndex: 0,
        x: relativeIndex < 0 ? -400 : 400,
        filter: "blur(8px)",
      };
    }

    // Center the visible cards
    const centerIndex = (visibleCount - 1) / 2; // 1.5 for 4 visible cards
    const centerOffset = relativeIndex - centerIndex;
    
    // Depth effects - more pronounced
    const depthScale = 1 - Math.abs(centerOffset) * 0.08;
    const depthOpacity = relativeIndex >= 0 && relativeIndex < visibleCount 
      ? 1 - Math.abs(centerOffset) * 0.2 
      : 0.3;
    const depthBlur = Math.abs(centerOffset) * 2;
    const depthZIndex = 20 - Math.abs(Math.round(centerOffset * 5));
    
    // X position calculation to center the group
    // Start from center and offset by relative position
    const baseX = centerOffset * (itemWidth + gap);
    
    return {
      opacity: depthOpacity,
      scale: Math.max(0.85, depthScale),
      zIndex: depthZIndex,
      x: baseX,
      filter: `blur(${Math.min(depthBlur, 4)}px)`,
    };
  };

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          currentIndex === 0
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:scale-110"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex >= maxIndex}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          currentIndex >= maxIndex
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:scale-110"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative h-[340px] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {authorities.map((authority, index) => {
              const style = getCardStyle(index);
              
              return (
                <motion.div
                  key={authority.id}
                  className="absolute top-0 left-0 w-[280px]"
                  initial={false}
                  animate={{
                    x: style.x,
                    opacity: style.opacity,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    filter: style.filter,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  onClick={() => onSelect(authority)}
                  style={{ 
                    cursor: isDragging ? "grabbing" : "pointer",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="glass-card-dash p-6 rounded-2xl border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-300 group">
                    {/* Photo */}
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform">
                      <Image
                        src={authority.photo_url}
                        alt={authority.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className="font-serif text-lg font-semibold text-pure-black mb-1 truncate">
                        {authority.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                        {authority.ministry_or_area || authority.role_title}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {new Date(authority.started_at).getFullYear()}–{authority.ended_at ? new Date(authority.ended_at).getFullYear() : "Presente"}
                      </p>
                    </div>

                    {/* Hover indicator */}
                    <div className="mt-4 pt-4 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                        Ver perfil completo
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollbar indicator */}
      <div className="mt-4 mx-12 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gray-400 rounded-full"
          animate={{
            width: `${((currentIndex + visibleCount) / authorities.length) * 100}%`,
            x: `${(currentIndex / authorities.length) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: `${(visibleCount / authorities.length) * 100}%` }}
        />
      </div>

      {/* Card count indicator */}
      <div className="mt-2 text-center text-xs text-gray-400">
        {currentIndex + 1}–{Math.min(currentIndex + visibleCount, authorities.length)} de {authorities.length} ministros
      </div>
    </div>
  );
}
