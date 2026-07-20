"use client";

import { useEffect, useReducer, useRef } from "react";

interface UseTrailingLatchOptions {
  isGlobalLoading: boolean;
  signInStatus: string | null | undefined;
}

interface UseTrailingLatchReturn {
  isLatch: boolean;
  setLatch: (val: boolean) => void;
}

/*
  Keeps the latch active briefly after Clerk loading ends — prevents an
  interactive flash before redirect. Stays latched on sign-in complete;
  releases after timeout on step transitions.
*/
export function useTrailingLatch({
  isGlobalLoading,
  signInStatus,
}: UseTrailingLatchOptions): UseTrailingLatchReturn {
  const [isLatch, dispatch] = useReducer(
    (_: boolean, next: boolean) => next,
    isGlobalLoading,
  );

  const signInStatusRef = useRef(signInStatus);

  /*
    Tracks `signInStatus` for the deferred latch release check
  */
  useEffect(() => {
    signInStatusRef.current = signInStatus;
  }, [signInStatus]);

  /*
    Applies the trailing delay before releasing the latch
  */
  useEffect(() => {
    if (isGlobalLoading) {
      dispatch(true);
    } else {
      const timer = setTimeout(() => {
        if (signInStatusRef.current !== "complete") {
          dispatch(false);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isGlobalLoading]);

  return { isLatch, setLatch: dispatch };
}
