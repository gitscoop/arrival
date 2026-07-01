"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

interface ClerkCaptchaProps {
  className?: string;
}

export function ClerkCaptcha({ className }: ClerkCaptchaProps) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  return (
    <div
      id="clerk-captcha"
      role="group"
      aria-label="Security verification"
      data-cl-size="flexible"
      data-cl-theme={
        mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "auto"
      }
      className={className}
    />
  );
}
