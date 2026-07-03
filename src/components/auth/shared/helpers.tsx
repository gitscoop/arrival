"use client";

import { toast } from "sonner";
import { useSignIn } from "@clerk/nextjs";
import { useEffect, useReducer, useRef } from "react";
import { useTrailingLatch } from "@/hooks/use-trailing-latch";

/*
  Shows the sign-in identifier, held through the trailing-latch window
  when `signIn.identifier` is briefly null before redirect.
 
  With password + multiple linked emails, Clerk may send the OTP to a
  different address than the one entered. When `resolveEmailCodeTarget` is
  true, shows the factor `safeIdentifier` so the correct inbox gets checked.
*/
export function PersistentSafeIdentifier({
  resolveEmailCodeTarget,
}: {
  resolveEmailCodeTarget?: boolean;
} = {}) {
  const { signIn } = useSignIn();

  const [snapshot, dispatchSnapshot] = useReducer(
    (_: string, next: string) => next,
    "",
  );

  let display: string | null = null;

  if (signIn?.identifier) {
    display = signIn.identifier;

    if (resolveEmailCodeTarget) {
      const factors = signIn.supportedFirstFactors;

      if (factors) {
        const hasPassword = factors.some((f) => f.strategy === "password");

        const emailCodeFactors = factors.filter(
          (f): f is Extract<typeof f, { strategy: "email_code" }> =>
            f.strategy === "email_code",
        );

        if (hasPassword && emailCodeFactors.length > 1) {
          display = emailCodeFactors[0].safeIdentifier;
        }
      }
    }
  }

  /* 
    Updates `snapshot` whenever a live value is available
  */
  useEffect(() => {
    if (display !== null) {
      dispatchSnapshot(display);
    }
  }, [display]);

  return <>{display ?? snapshot}</>;
}

/*
  Toasts new Clerk field errors and calls `onGlobalError` to clear loading latches
*/
export function FieldErrorToast({
  message,
  onGlobalError,
  isSuppressed = false,
  dedupeKey = 0,
}: {
  message: string | undefined;
  onGlobalError?: () => void;
  isSuppressed?: boolean;
  dedupeKey?: string | number;
}) {
  const prevToastKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const toastKey = message ? `${dedupeKey}:${message}` : undefined;

    if (isSuppressed) {
      prevToastKeyRef.current = toastKey;
      return;
    }

    if (message && toastKey !== prevToastKeyRef.current) {
      toast.error(message);
      onGlobalError?.();
    }

    prevToastKeyRef.current = toastKey;
  }, [dedupeKey, isSuppressed, message, onGlobalError]);

  return null;
}

/*
  Thin component wrapper around `useTrailingLatch` for call-sites that live
  inside Clerk Elements render props where hooks cannot be called directly.

  Keeps the form disabled briefly after Clerk's global loading ends,
  preventing the interactive flash before the auth redirect appears.

  On terminal steps (sign-in complete): stays latched, redirect will unmount
  On non-terminal steps (step transition): releases after the timeout
  On errors: cleared instantly via `onGlobalError` callbacks in `FieldErrorToast`
*/
export function TrailingLatchController({
  isGlobalLoading,
  signInStatus,
  setLatch: onLatchChange,
}: {
  isGlobalLoading: boolean;
  signInStatus: string | null | undefined;
  setLatch: (val: boolean) => void;
}) {
  const { isLatch } = useTrailingLatch({ isGlobalLoading, signInStatus });

  useEffect(() => {
    onLatchChange(isLatch);
  }, [isLatch, onLatchChange]);

  return null;
}
