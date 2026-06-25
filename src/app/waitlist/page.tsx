import type { Metadata } from "next";
import { waitlistMetadata } from "@/seo/metadata";

import { Footer } from "@/components/footer";
import { Container } from "@/components/container";
import { ParticleBackground } from "@/components/lazy";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = waitlistMetadata;

export default function WaitlistPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex h-svh flex-col overflow-hidden text-foreground"
    >
      <ParticleBackground mode="ascii" className="pointer-events-none" />

      <div
        className="absolute inset-0 bg-[url('/background-light.webp')] bg-cover bg-center dark:bg-[url('/background-dark.webp')]"
        aria-hidden="true"
      />

      <Container className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h1 className="max-w-2xl cursor-default font-serif text-5xl tracking-tight text-balance text-foreground italic md:text-7xl">
          Good things come to those who wait.
        </h1>

        <div className="w-full md:max-w-md">
          <WaitlistForm />
        </div>
      </Container>

      <Footer maxWidth="narrow" />
    </main>
  );
}
