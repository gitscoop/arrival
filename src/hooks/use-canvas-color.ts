"use client";

import { useEffect, useRef, type RefObject } from "react";
import { detectDarkMode, resolveCssVariable } from "@/lib/utils";

type UseCanvasColorOptions = {
  /* particle color */
  color?: string;
  /* optional particle color for dark mode */
  darkColor?: string;
  /* optional CSS variable name for light particle color */
  colorLightVar?: string;
  /* optional CSS variable name for dark particle color */
  colorDarkVar?: string;
  /* shadow/glow color for bright particles */
  glowColor?: string;
  /* optional glow color for dark mode */
  darkGlowColor?: string;
  /* optional CSS variable name for light glow color */
  glowColorLightVar?: string;
  /* optional CSS variable name for dark glow color */
  glowColorDarkVar?: string;
  /* called when colors are recomputed on theme change */
  onColorChange?: () => void;
};

type UseCanvasColorResult = {
  colorRef: RefObject<string>;
  glowColorRef: RefObject<string>;
};

/*
  Resolves canvas particle and glow colors for the current theme:
  - Keeps `colorRef` and `glowColorRef` in sync via `MutationObserver` and `prefers-color-scheme`
  - Draw callbacks read refs directly instead of subscribing to theme themselves
  - Calls `onColorChange` on recompute so reduced-motion static frames repaint
*/
export function useCanvasColor({
  color,
  darkColor,
  colorLightVar,
  colorDarkVar,
  glowColor,
  darkGlowColor,
  glowColorLightVar,
  glowColorDarkVar,
  onColorChange,
}: UseCanvasColorOptions): UseCanvasColorResult {
  const colorRef = useRef<string>(color ?? "");
  const glowColorRef = useRef<string>(glowColor ?? "");

  /*
    - Resolves refs on mount and when color props change
    - Recomputes on theme toggle via `MutationObserver` and `prefers-color-scheme`
    - Calls `onColorChange` after each recompute
  */
  useEffect(() => {
    const root = document.documentElement;

    const compute = () => {
      const isDark = detectDarkMode();
      const computedBodyColor = getComputedStyle(document.body).color;

      const computedForegroundColor =
        resolveCssVariable(root, "--foreground") ?? "";

      if (isDark) {
        colorRef.current =
          resolveCssVariable(root, colorDarkVar) ||
          darkColor ||
          color ||
          computedBodyColor;

        glowColorRef.current =
          resolveCssVariable(root, glowColorDarkVar) ||
          darkGlowColor ||
          glowColor ||
          computedForegroundColor;
      } else {
        colorRef.current =
          resolveCssVariable(root, colorLightVar) || color || computedBodyColor;

        glowColorRef.current =
          resolveCssVariable(root, glowColorLightVar) ||
          glowColor ||
          computedForegroundColor;
      }

      onColorChange?.();
    };

    compute();

    const mql = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

    const handleMql = () => compute();
    mql?.addEventListener?.("change", handleMql);

    const mo = new MutationObserver(() => compute());

    mo.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      mql?.removeEventListener?.("change", handleMql);
      mo.disconnect();
    };
  }, [
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
    onColorChange,
  ]);

  return { colorRef, glowColorRef };
}
