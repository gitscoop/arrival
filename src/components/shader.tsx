"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

import { useCanvasColor } from "@/hooks/use-canvas-color";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCanvasAnimation } from "@/hooks/use-canvas-animation";

export type ParticleShaderConfig = {
  /* pixels of canvas area per particle; lower = denser grid */
  particleDensity: number;
  /* cursor interaction attraction radius in px */
  attractRadius: number;
  /* cursor interaction repulsion radius in px */
  repelRadius: number;
  /* force multiplier for cursor attraction */
  attractStrength: number;
  /* force multiplier for cursor repulsion */
  repelStrength: number;
  /* probability, between zero and one, that a particle will flicker */
  flickerChance: number;
  /* alpha oscillation amplitude when a particle is at rest */
  breatheIntensity: number;
  /* entry animation duration in ms */
  entryDuration: number;
  /* base velocity damping per frame (0–1; lower = more damping) */
  dampingBase: number;
  /* particle square size in CSS px */
  particleSize: number;
  /* overall opacity multiplier, between zero and one */
  particleOpacity: number;
};

export const DEFAULT_CONFIG: ParticleShaderConfig = {
  particleDensity: 800,
  attractRadius: 90,
  repelRadius: 50,
  attractStrength: 0.06,
  repelStrength: 1.2,
  flickerChance: 0.15,
  breatheIntensity: 0.08,
  entryDuration: 10,
  dampingBase: 0.7,
  particleSize: 1.5,
  particleOpacity: 1,
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  delay: number;
  alpha: number;
  flickerPhase: number;
  flickerSpeed: number;
  isFlickering: boolean;
  flickerStart: number;
};

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type ParticleShaderProps = {
  /* optional override for shader behavior config */
  config?: ParticleShaderConfig;
  /* optional extra classes for the root container */
  className?: string;
  /* optional particle color */
  color?: string;
  /* optional particle color for dark mode */
  darkColor?: string;
  /* optional CSS variable name for light particle color */
  colorLightVar?: string;
  /* optional CSS variable name for dark particle color */
  colorDarkVar?: string;
};

/*
  Canvas-based particle shader with entry fly-in, cursor interaction, flicker, and breathe effects:
  - Particles spawn off-screen and fly to random target positions
  - Cursor attracts/repels nearby particles
  - Handles high-DPI and resizes via `ResizeObserver`
  - Respects prefers-reduced-motion: spawns particles directly at their target
    positions and paints one frozen frame — no fly-in, no interaction, no loop
*/
export function ParticleShader({
  config = DEFAULT_CONFIG,
  className,
  color,
  darkColor,
  colorLightVar,
  colorDarkVar,
}: ParticleShaderProps) {
  const configRef = useRef(config);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const repaintRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const reducedMotion = useReducedMotion();

  const { colorRef } = useCanvasColor({
    color,
    darkColor,
    colorLightVar,
    colorDarkVar,
    onColorChange: () => repaintRef.current?.(),
  });

  /*
    Syncs `configRef` when the `config` prop changes so draw callbacks read current values
  */
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /*
    Sets canvas dimensions for the current DPR and regenerates the particle swarm.
    Called on mount, on resize, and when reduced-motion toggles.
  */
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));

    canvas.style.width = `${Math.floor(width)}px`;
    canvas.style.height = `${Math.floor(height)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cfg = configRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const area = width * height;

    /*
      Caps particle count at 1500 to limit per-frame work on slower devices
    */
    const particleCount = Math.min(
      Math.floor(area / cfg.particleDensity),
      1500,
    );

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const targetX = Math.random() * width;
      const targetY = Math.random() * height;

      const angle = Math.random() * Math.PI * 2;
      const minRadius = Math.max(width, height) * 0.6;
      const maxRadius = Math.max(width, height) * 1.2;
      const spawnRadius = minRadius + Math.random() * (maxRadius - minRadius);

      const startX = centerX + Math.cos(angle) * spawnRadius;
      const startY = centerY + Math.sin(angle) * spawnRadius;

      const distFromCenter = Math.sqrt(
        Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2),
      );

      const maxDist = Math.sqrt(
        Math.pow(width / 2, 2) + Math.pow(height / 2, 2),
      );

      const normalizedDist = distFromCenter / maxDist;
      const delay = normalizedDist * 0.3 + Math.random() * 0.1;

      particles.push({
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        targetX,
        targetY,
        startX,
        startY,
        delay,
        alpha: 0,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.5 + Math.random() * 2,
        isFlickering: Math.random() < cfg.flickerChance,
        flickerStart: 4000 + Math.random() * 2000,
      });
    }

    particlesRef.current = particles;
    startTimeRef.current = null;
  }, []);

  /*
    Draws one animated frame on each rAF tick (normal mode only).
    Rendering state is read from refs at call time, so each tick sees the latest values.
    Per frame: entry fly-in, cursor physics, flicker, and breathe.
  */
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    timestamp: number,
  ) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const cfg = configRef.current;
    const elapsed = timestamp - startTimeRef.current;
    const globalProgress = Math.min(elapsed / cfg.entryDuration, 1);

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    /*
      Frame setup: clear in logical coordinates (dpr-scaled context), then set
      `fillStyle` once — only `globalAlpha` changes inside the particle loop.
    */
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colorRef.current;

    const mouse = mouseRef.current;
    const particles = particlesRef.current;
    const pLen = particles.length;
    const size = cfg.particleSize;

    for (let i = 0; i < pLen; i++) {
      const p = particles[i];
      const pd = globalProgress - p.delay;

      const particleProgress =
        pd <= 0 ? 0 : pd >= 1 - p.delay ? 1 : pd / (1 - p.delay);

      if (particleProgress <= 0) continue;

      const easedProgress = easeOutQuart(particleProgress);
      const baseX = p.startX + (p.targetX - p.startX) * easedProgress;
      const baseY = p.startY + (p.targetY - p.startY) * easedProgress;

      if (mouse.active && particleProgress > 0.3) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;

        const dist2 = dx * dx + dy * dy;
        const attractR = cfg.attractRadius;

        if (dist2 < attractR * attractR && dist2 > 0) {
          const dist = Math.sqrt(dist2);
          const repelR = cfg.repelRadius;

          if (dist < repelR) {
            const force = (1 - dist / repelR) * cfg.repelStrength;
            const f = (force * repelR * 0.15) / dist;

            p.vx += dx * f;
            p.vy += dy * f;
          } else {
            const normalizedDist = (dist - repelR) / (attractR - repelR);
            const force = (1 - normalizedDist) * cfg.attractStrength;

            const range = attractR - repelR;
            const f = (force * range * 0.08) / dist;

            p.vx -= dx * f;
            p.vy -= dy * f;
          }
        }
      }

      const dtx = baseX - p.x;
      const dty = baseY - p.y;
      const distToTarget2 = dtx * dtx + dty * dty;

      const normalizedDist =
        distToTarget2 > 90000 ? 1 : Math.sqrt(distToTarget2) / 300;

      const easeInFactor = normalizedDist * normalizedDist * normalizedDist;
      const returnStrength = 0.008 + easeInFactor * 0.14;

      p.vx += dtx * returnStrength;
      p.vy += dty * returnStrength;

      const dampingFactor = cfg.dampingBase - easeInFactor * 0.08;

      p.vx *= dampingFactor;
      p.vy *= dampingFactor;

      p.x += p.vx;
      p.y += p.vy;

      let alpha = particleProgress * 2;
      if (alpha > 1) alpha = 1;

      if (p.isFlickering && elapsed > p.flickerStart && particleProgress >= 1) {
        const flickerCycle = Math.sin(
          (elapsed - p.flickerStart) * 0.003 * p.flickerSpeed + p.flickerPhase,
        );

        if (flickerCycle < -0.7) {
          alpha = easeInOutCubic((flickerCycle + 1) / 0.3) * 0.3;
        } else if (flickerCycle < -0.4) {
          alpha = 0.3 + ((flickerCycle + 0.7) / 0.3) * 0.7;
        }
      }

      if (particleProgress >= 1) {
        const breathe =
          Math.sin(elapsed * 0.001 + p.flickerPhase) * cfg.breatheIntensity;

        alpha += breathe;

        if (alpha < 0.2) alpha = 0.2;
        else if (alpha > 1) alpha = 1;
      }

      if (alpha < 0.01) {
        p.alpha = 0;
        continue;
      }

      p.alpha = alpha;

      /*
        Draws the particle at its current opacity, capped at fully visible.
      */
      ctx.globalAlpha = Math.min(1, (alpha * 1.5 + 0.1) * cfg.particleOpacity);
      ctx.fillRect(p.x, p.y, size, size);
    }
  };

  /*
    Draws a single frozen frame for reduced-motion mode. Particles appear at
    their target positions at resting opacity — no fly-in, cursor physics,
    flicker, breathe, or rAF loop.
  */
  const drawStatic = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const cfg = configRef.current;
    const dpr = window.devicePixelRatio || 1;

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colorRef.current;

    /*
      Opacity matches a settled particle from the animated path, capped at fully visible.
    */
    const staticGlobalAlpha = Math.min(1, 1.6 * cfg.particleOpacity);
    ctx.globalAlpha = staticGlobalAlpha;

    const particles = particlesRef.current;
    const size = cfg.particleSize;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillRect(p.targetX, p.targetY, size, size);
    }
  };

  const { repaint } = useCanvasAnimation({
    canvasRef,
    containerRef,
    reducedMotion,
    init,
    drawFrame,
    drawStatic,
  });

  /*
    Syncs repaint into a ref so `useCanvasColor` can redraw static frames on theme change
  */
  useEffect(() => {
    repaintRef.current = repaint;
  }, [repaint]);

  /*
    Pointer and touch events for cursor interaction.
    Skipped in reduced-motion mode — static frames don't use cursor physics.
  */
  useEffect(() => {
    if (reducedMotion) return;

    const getRelativeCoords = (clientX: number, clientY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: clientX, y: clientY };
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getRelativeCoords(e.clientX, e.clientY);
      mouseRef.current = { x, y, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as Element)?.closest?.("[data-controls-panel]")) return;
      const touch = e.touches[0];

      if (touch) {
        const { x, y } = getRelativeCoords(touch.clientX, touch.clientY);
        mouseRef.current = { x, y, active: true };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((e.target as Element)?.closest?.("[data-controls-panel]")) return;
      const touch = e.touches[0];

      if (touch) {
        const { x, y } = getRelativeCoords(touch.clientX, touch.clientY);
        mouseRef.current = { x, y, active: true };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
    >
      <canvas
        ref={canvasRef}
        className="block size-full"
        style={{
          background: "transparent",
          touchAction: "none",
        }}
      />
    </div>
  );
}
