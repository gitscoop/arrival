import type { Metadata } from "next";
import { config } from "@/lib/config";

import { AppSchema } from "@/seo/json-ld";
import { homepageMetadata } from "@/seo/metadata";

import { Footer } from "@/components/footer";
import { Container } from "@/components/container";

export const metadata: Metadata = homepageMetadata;

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="flex h-svh flex-col">
      <Container className="flex flex-1 items-center justify-center">
        <h1 className="text-center font-sans text-7xl font-bold tracking-tight">
          {config.app.name}
        </h1>
      </Container>

      <AppSchema />
      <Footer maxWidth="narrow" />
    </main>
  );
}
