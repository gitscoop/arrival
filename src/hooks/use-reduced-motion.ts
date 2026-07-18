"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getReducedMotionPreference() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/*
  Reflects `prefers-reduced-motion` — false during SSR, live-updated on the client.
*/
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    getReducedMotionPreference,
  );

  /*
    Corrects the SSR-safe default after mount and tracks live preference changes
  */
  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return reducedMotion;
}
