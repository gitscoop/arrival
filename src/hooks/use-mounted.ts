"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/*
  Returns `true` only after client mount — avoids hydration mismatches for client-only UI.
*/
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
