"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { Separator } from "@/components/ui/separator";

const { waitlist, terms, privacy } = config.routes;

export function LegalFooter() {
  const pathname = usePathname();

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <footer className="mt-auto">
      <Container>
        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {config.app.name}
          </p>

          <nav
            aria-label="Legal"
            className="flex items-center gap-6 text-sm text-muted-foreground"
          >
            {[
              { href: waitlist, label: "Waitlist" },
              { href: terms, label: "Terms" },
              { href: privacy, label: "Privacy" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                aria-current={pathname === href ? "page" : undefined}
                className="hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
