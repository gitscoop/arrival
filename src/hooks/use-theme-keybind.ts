"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/audio";
import { clickSoftSound } from "@/sounds/click-soft";

/*
  Binds `D` to a theme toggle — ignored in editable fields and while modifier keys are held.
*/
export function useThemeKeybind(onToggle: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return;

      if (e.key === "d" || e.key === "D") {
        void playSound(clickSoftSound.dataUri, { volume: 0.2 });
        onToggle();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);
}
