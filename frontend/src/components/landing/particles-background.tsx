"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  mass: number;
  glowMultiplier?: number;
  glowVelocity?: number;
  id: number;
}

const PARTICLE_COUNT = 90;
const PARTICLE_SIZE = 2.5;
const PARTICLE_OPACITY = 0.7;
const GLOW_INTENSITY = 6;
const MOVEMENT_SPEED = 0.35;
const MOUSE_INFLUENCE = 140;
const GRAVITY_STRENGTH = 60;
const PARTICLE_COLOR = "#1a1a1a";

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);

  const initializeParticles = useCallback((width: number, height: number) => {
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MOVEMENT_SPEED,
      vy: (Math.random() - 0.5) * MOVEMENT_SPEED,
      size: Math.random() * PARTICLE_SIZE + 0.8,
      opacity: PARTICLE_OPACITY,
      baseOpacity: PARTICLE_OPACITY,
      mass: Math.random() * 0.5 + 0.5,
      id: index,
    }));
  }, []);

  const updateParticles = useCallback((canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const mouse = mouseRef.current;

    particlesRef.current.forEach((particle) => {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_INFLUENCE && distance > 0) {
        const force = (MOUSE_INFLUENCE - distance) / MOUSE_INFLUENCE;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        const gravityForce = force * (GRAVITY_STRENGTH * 0.001);

        // attract
        particle.vx += normalizedDx * gravityForce;
        particle.vy += normalizedDy * gravityForce;

        particle.opacity = Math.min(0.95, particle.baseOpacity + force * 0.25);

        const targetGlow = 1 + force * 2.5;
        const currentGlow = particle.glowMultiplier ?? 1;
        particle.glowMultiplier = currentGlow + (targetGlow - currentGlow) * 0.15;
      } else {
        particle.opacity = Math.max(particle.baseOpacity * 0.6, particle.opacity - 0.015);

        const targetGlow = 1;
        const currentGlow = particle.glowMultiplier ?? 1;
        particle.glowMultiplier = Math.max(1, currentGlow + (targetGlow - currentGlow) * 0.08);
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Subtle random drift
      particle.vx += (Math.random() - 0.5) * 0.001;
      particle.vy += (Math.random() - 0.5) * 0.001;

      // Damping
      particle.vx *= 0.999;
      particle.vy *= 0.999;

      // Boundary wrapping
      if (particle.x < 0) particle.x = rect.width;
      if (particle.x > rect.width) particle.x = 0;
      if (particle.y < 0) particle.y = rect.height;
      if (particle.y > rect.height) particle.y = 0;
    });
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    particlesRef.current.forEach((particle) => {
      ctx.save();
      const glow = particle.glowMultiplier ?? 1;
      ctx.shadowColor = PARTICLE_COLOR;
      ctx.shadowBlur = GLOW_INTENSITY * glow * 2;
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = PARTICLE_COLOR;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * glow * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    updateParticles(canvas);
    drawParticles(ctx);
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (particlesRef.current.length > 0) {
      particlesRef.current.forEach((p) => {
        p.x = Math.random() * rect.width;
        p.y = Math.random() * rect.height;
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    particlesRef.current = initializeParticles(canvas.width || 800, canvas.height || 600);
  }, [initializeParticles]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resizeCanvas);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [handleMouseMove, resizeCanvas]);

  useEffect(() => {
    animate();
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ background: "transparent", pointerEvents: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
      />
    </div>
  );
}
