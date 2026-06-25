"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

import { useCanvasColor } from "@/hooks/use-canvas-color";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCanvasAnimation } from "@/hooks/use-canvas-animation";

export type ParticleBackgroundConfig = {
  /* distance between particle centers in pixels */
  gap: number;
  /* overall opacity */
  opacity: number;
  /* background radial fade opacity (0 = transparent background) */
  backgroundOpacity: number;
  /* minimum per-particle speed in rad/s */
  speedMin: number;
  /* maximum per-particle speed in rad/s */
  speedMax: number;
  /* overall speed multiplier */
  speedScale: number;
};

export const DEFAULT_CONFIG: ParticleBackgroundConfig = {
  gap: 25,
  opacity: 0.1,
  backgroundOpacity: 0,
  speedMin: 0.3,
  speedMax: 1.6,
  speedScale: 0.5,
};

type BaseParticleBackgroundProps = {
  /* optional override for background behavior config */
  config?: ParticleBackgroundConfig;
  /* optional extra classes for the root container */
  className?: string;
  /* particle color (will pulse by alpha) */
  color?: string;
  /* optional particle color for dark mode */
  darkColor?: string;
  /* shadow/glow color for bright particles */
  glowColor?: string;
  /* optional glow color for dark mode */
  darkGlowColor?: string;
  /* optional CSS variable name for light particle color */
  colorLightVar?: string;
  /* optional CSS variable name for dark particle color */
  colorDarkVar?: string;
  /* optional CSS variable name for light glow color */
  glowColorLightVar?: string;
  /* optional CSS variable name for dark glow color */
  glowColorDarkVar?: string;
};

type DotModeProps = BaseParticleBackgroundProps & {
  mode: "dot";
  dotRadius?: number;
};

type AsciiModeProps = BaseParticleBackgroundProps & {
  mode: "ascii";
  fontSize?: number;
  asciiChars?: string;
};

type ParticleBackgroundProps = DotModeProps | AsciiModeProps;

type Particle = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  char: string;
};

const DEFAULT_ASCII_CHARS =
  "!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFabcdef0123456789";

/*
  Canvas-based particle background that randomly glows and dims:
  - Supports "dot" mode (filled circles) and "ascii" mode (random characters)
  - Uses a stable grid of particles
  - Each particle gets its own phase + speed producing organic shimmering
  - Handles high-DPI and resizes via `ResizeObserver`
  - Particle color resolved via optional CSS variable props, prop values, or hardcoded fallback
  - Mode-specific props are enforced at the type level via discriminated union
  - Respects prefers-reduced-motion: shows a frozen particle field instead of
    animating, so the decorative background is still visible
*/
export function ParticleBackground(props: ParticleBackgroundProps) {
  const {
    mode,
    config = DEFAULT_CONFIG,
    className,
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
  } = props;

  const { gap, opacity, backgroundOpacity, speedMin, speedMax, speedScale } =
    config;

  // narrows down mode-specific props
  const dotRadius = props.mode === "dot" ? (props.dotRadius ?? 1.6) : 0;
  const fontSize = props.mode === "ascii" ? props.fontSize : undefined;
  const asciiChars = props.mode === "ascii" ? props.asciiChars : undefined;

  const particlesRef = useRef<Particle[]>([]);
  const repaintRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = useReducedMotion();

  /*
    Ref-backed config for draw callbacks: fresh values on each paint without
    restarting the animation loop. Updated by the effect below when props change.
  */
  const configRef = useRef({
    gap,
    dotRadius,
    opacity,
    backgroundOpacity,
    speedMin,
    speedMax,
    speedScale,
    mode,
    fontSize,
    asciiChars: asciiChars ?? DEFAULT_ASCII_CHARS,
  });

  useEffect(() => {
    configRef.current = {
      gap,
      dotRadius,
      opacity,
      backgroundOpacity,
      speedMin,
      speedMax,
      speedScale,
      mode,
      fontSize,
      asciiChars: asciiChars ?? DEFAULT_ASCII_CHARS,
    };
  }, [
    asciiChars,
    backgroundOpacity,
    dotRadius,
    fontSize,
    gap,
    mode,
    opacity,
    speedMax,
    speedMin,
    speedScale,
  ]);

  const { colorRef, glowColorRef } = useCanvasColor({
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
    onColorChange: () => repaintRef.current?.(),
  });

  /*
    Sets canvas dimensions for the current DPR and regenerates the particle set.
    Called on mount, on resize, when `initDeps` change, and when reduced-motion toggles.
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

    const cols = Math.ceil(width / cfg.gap) + 2;
    const rows = Math.ceil(height / cfg.gap) + 2;

    const min = Math.min(cfg.speedMin, cfg.speedMax);
    const max = Math.max(cfg.speedMin, cfg.speedMax);

    const span = Math.max(max - min, 0);
    const particles: Particle[] = [];

    for (let i = -1; i < cols; i++) {
      for (let j = -1; j < rows; j++) {
        /*
          Offsets every other row by half a gap for a hex-like grid
        */
        const x = i * cfg.gap + (j % 2 === 0 ? 0 : cfg.gap * 0.5);
        const y = j * cfg.gap;

        /*
          Ascii mode: picks one random character from the pool at particle generation time
        */
        const char =
          cfg.mode === "ascii"
            ? cfg.asciiChars[Math.floor(Math.random() * cfg.asciiChars.length)]
            : "";

        particles.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          speed: min + Math.random() * span,
          char,
        });
      }
    }

    particlesRef.current = particles;
  }, []);

  /*
    Draws one animated frame on each rAF tick (normal mode only).
    Rendering state is read from refs at call time, so each tick sees the latest values.
  */
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    now: number,
  ) => {
    const cfg = configRef.current;
    const dpr = window.devicePixelRatio || 1;

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = cfg.opacity;

    /*
      Optional subtle background fade for depth (defaults to 0 = transparent)
    */
    if (cfg.backgroundOpacity > 0) {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        Math.min(width, height) * 0.1,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.7,
      );

      grad.addColorStop(0, "rgba(0,0,0,0)");

      grad.addColorStop(
        1,
        `rgba(0,0,0,${Math.min(Math.max(cfg.backgroundOpacity, 0), 1)})`,
      );

      ctx.fillStyle = grad as unknown as CanvasGradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    ctx.fillStyle = colorRef.current;

    /*
      Ascii mode: configures font once before the loop for performance
    */
    if (cfg.mode === "ascii") {
      const resolvedFontSize = cfg.fontSize ?? cfg.gap * 0.3;

      ctx.font = `${resolvedFontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }

    const time = (now / 1000) * Math.max(cfg.speedScale, 0);
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /*
        Per-particle brightness: a triangle wave loops 0.25 → 0.8 → 0.25,
        staggered by each particle's phase and speed.
      */
      const mod = (time * p.speed + p.phase) % 2;
      const lin = mod < 1 ? mod : 2 - mod;
      const a = 0.25 + 0.55 * lin;

      /*
        Applies shadow glow on the brightest part of the pulse (alpha > 0.6)
      */
      if (a > 0.6) {
        const glow = (a - 0.6) / 0.4;

        ctx.shadowColor = glowColorRef.current;
        ctx.shadowBlur = 6 * glow;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = a * cfg.opacity;

      if (cfg.mode === "ascii") {
        ctx.fillText(p.char, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  /*
    Draws a single frozen frame for reduced-motion mode. Particles appear at
    their grid positions with a fixed mid-range alpha — no time dependency,
    no glow, no rAF loop.
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
    ctx.save();

    ctx.fillStyle = colorRef.current;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    if (cfg.mode === "ascii") {
      const resolvedFontSize = cfg.fontSize ?? cfg.gap * 0.3;

      ctx.font = `${resolvedFontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }

    /*
      Fixed alpha near the animated range midpoint (0.25..0.8) for visually natural density
    */
    const STATIC_ALPHA = 0.5;

    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = STATIC_ALPHA * cfg.opacity;

      if (cfg.mode === "ascii") {
        ctx.fillText(p.char, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  const { repaint } = useCanvasAnimation({
    canvasRef,
    containerRef,
    reducedMotion,
    init,
    drawFrame,
    drawStatic,
    initDeps: [gap, mode, asciiChars, speedMin, speedMax],
  });

  /*
    Syncs repaint into a ref so `useCanvasColor` can redraw static frames on theme change
  */
  useEffect(() => {
    repaintRef.current = repaint;
  }, [repaint]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
