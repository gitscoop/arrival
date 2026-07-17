"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/*
  Reads `lastUsedAuthMethod` from localStorage and re-renders on cross-tab
  `storage` events. Returns `null` during SSR.
*/
export function useAuthMethod(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("lastUsedAuthMethod"),
    () => null,
  );
}
