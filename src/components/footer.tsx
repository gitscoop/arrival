"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

import { Container } from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

interface FooterProps {
  maxWidth?: "default" | "narrow";
}

export function Footer({ maxWidth = "default" }: FooterProps) {
  const { isLoaded, userId } = useAuth();
  const { isDisabled, onClick } = useNavigationLatch();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <footer className="relative z-10 py-4 md:py-6">
      <Container
        className={cn(
          "flex items-center justify-between gap-2 text-xs text-muted-foreground md:text-sm",
          maxWidth === "narrow" && "max-w-2xl px-8 md:px-22",
        )}
      >
        <p>
          built with taste by&nbsp;
          {[
            { href: "https://n14y.dev", label: "n14y.dev" },
            { href: "https://github.com/your/repo", label: "oss" },
          ].map(({ href, label }, i) => (
            <span key={href}>
              {i > 0 && (
                <span aria-hidden className="mx-2 opacity-40">
                  /
                </span>
              )}

              <a
                href={href}
                target="_blank"
                rel="noopener"
                className="no-underline underline-offset-4 hover:text-foreground hover:underline touch:underline"
              >
                {label}

                <span className="visually-hidden">
                  &nbsp;(opens in new tab)
                </span>
              </a>
            </span>
          ))}
        </p>

        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <Skeleton className="h-3.5 min-w-12" />
          ) : userId ? (
            <SignOutButton>
              <button
                type="button"
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                onClick={() => setIsSigningOut(true)}
                className={cn(
                  "hover:text-foreground",
                  isSigningOut && "pointer-events-none opacity-50",
                )}
              >
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="visually-hidden"
                >
                  {isSigningOut ? "Signing out…" : null}
                </span>
                sign out
              </button>
            </SignOutButton>
          ) : (
            <Link
              href={config.routes.signIn}
              aria-disabled={isDisabled || undefined}
              tabIndex={isDisabled ? -1 : undefined}
              onClick={onClick}
              className={cn(
                "hover:text-foreground",
                isDisabled && "pointer-events-none opacity-50",
              )}
            >
              sign in
            </Link>
          )}

          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
