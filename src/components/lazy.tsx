"use client";

/*
  Client-only dynamic imports: separate async chunks, no SSR.
  Import heavy components from here instead of their source files.
*/

import dynamic from "next/dynamic";

export const ParticleBackground = dynamic(
  () => import("@/components/background").then((m) => m.ParticleBackground),
  { ssr: false },
);

export const ParticleShader = dynamic(
  () => import("@/components/shader").then((m) => m.ParticleShader),
  { ssr: false },
);
