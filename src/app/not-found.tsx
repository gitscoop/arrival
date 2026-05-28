import Link from "next/link";
import type { Metadata } from "next";
import { config } from "@/lib/config";
import { notFoundMetadata } from "@/seo/metadata";

import { Container } from "@/components/container";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = notFoundMetadata;

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex h-svh items-center justify-center"
    >
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-sm tracking-widest text-muted-foreground md:text-base">
          404
        </p>

        <h1 className="max-w-lg font-serif text-4xl tracking-tight text-balance italic md:text-6xl">
          This page doesn&apos;t exist.
        </h1>

        <Link
          href={config.routes.home}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          go home
        </Link>
      </Container>
    </main>
  );
}
