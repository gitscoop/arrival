import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { authMetadata } from "@/seo/metadata";
import { ParticleShader } from "@/components/lazy";

export const metadata: Metadata = authMetadata();

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid h-svh w-full grid-rows-[1fr] overflow-hidden lg:grid-cols-2">
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 flex-col overflow-y-auto p-6 md:p-10"
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>

      <div className="relative hidden bg-muted/20 lg:block">
        <ParticleShader className="pointer-events-none" />
      </div>
    </div>
  );
}
