"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function AuthMethodTracker() {
  const { isSignedIn, isLoaded } = useAuth();

  /*
    Promotes `pendingAuthMethod` to `lastUsedAuthMethod` once sign-in succeeds —
    the method is chosen at click time, remembered only after auth completes.
  */
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const pending = localStorage.getItem("pendingAuthMethod");

      if (pending) {
        localStorage.setItem("lastUsedAuthMethod", pending);
        localStorage.removeItem("pendingAuthMethod");
      }
    }
  }, [isSignedIn, isLoaded]);

  return null;
}
