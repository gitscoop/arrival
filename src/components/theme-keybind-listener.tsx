"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { useThemeKeybind } from "@/hooks/use-theme-keybind";

export function ThemeKeybindListener() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useThemeKeybind(toggle);
  return null;
}
