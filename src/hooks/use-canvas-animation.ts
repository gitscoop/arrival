"use client";

import {
  useEffect,
  useRef,
  useCallback,
  type DependencyList,
  type RefObject,
} from "react";

type UseCanvasAnimationOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  init: () => void;
  drawFrame: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    now: number,
  ) => void;
  drawStatic: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => void;
  initDeps?: DependencyList;
};

/*
  Canvas particle animation lifecycle:
  - Runs `init` on mount, container resize, `initDeps` change, and `reducedMotion` toggle
  - Normal mode: `requestAnimationFrame` loop calling `drawFrame`
  - Reduced motion: `drawStatic` after init and on resize; `repaint` on theme change — no rAF loop
*/
export function useCanvasAnimation({
  canvasRef,
  containerRef,
  reducedMotion,
  init,
  drawFrame,
  drawStatic,
  initDeps = [],
}: UseCanvasAnimationOptions): { repaint: () => void } {
  const rafRef = useRef<number>(0);
  const drawFrameRef = useRef(drawFrame);
  const drawStaticRef = useRef(drawStatic);

  /*
    Syncs `drawFrame` and `drawStatic` into refs so the rAF loop and `repaint`
    always call the latest callbacks without restarting the loop.
  */
  useEffect(() => {
    drawFrameRef.current = drawFrame;
    drawStaticRef.current = drawStatic;
  }, [drawFrame, drawStatic]);

  /*
    Runs `init` on mount and whenever `init`, `initDeps`, or `reducedMotion` change.
    `ResizeObserver` re-runs `init` on container resize and paints `drawStatic` in
    reduced motion so both render paths start from a valid canvas state.
  */
  useEffect(() => {
    init();

    const canvas = canvasRef.current;
    const container = containerRef.current;

    /*
      Reduced motion: paints `drawStatic` once after `init`
    */
    if (reducedMotion && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawStaticRef.current(ctx, canvas);
    }

    if (!container) return;

    const ro = new ResizeObserver(() => {
      init();

      /*
        Reduced motion: repaints `drawStatic` after resize so the frozen field matches the re-initialized particle set
      */
      if (reducedMotion && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) drawStaticRef.current(ctx, canvas);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [init, reducedMotion, ...initDeps]);

  /*
    rAF loop — only active in normal (non-reduced-motion) mode
  */
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stopped = false;

    const tick = (now: number) => {
      if (stopped) return;
      drawFrameRef.current(ctx, canvas, now);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const repaint = useCallback(() => {
    if (!reducedMotion) return;
    const canvas = canvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (ctx) drawStaticRef.current(ctx, canvas);
  }, [reducedMotion, canvasRef]);

  return { repaint };
}
