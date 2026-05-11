import "@/app/globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { PropsWithChildren } from "react";

import { SiteSchema } from "@/seo/json-ld";
import { baseMetadata } from "@/seo/metadata";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { VercelAnalytics } from "@/components/analytics";

import {
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontSerif.variable,
          fontMono.variable,
        )}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <SiteSchema />

        <Providers>
          {children}
          <Toaster />
        </Providers>

        <VercelAnalytics />
      </body>
    </html>
  );
}
