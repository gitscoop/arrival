import { config } from "@/lib/config";
import { absoluteUrl } from "@/lib/utils";

import type { Metadata, MetadataRoute } from "next";

import { TERMS_LAST_UPDATED } from "@/content/legal/terms";
import { PRIVACY_LAST_UPDATED } from "@/content/legal/privacy";

const { signIn, signUp, waitlist, home, invitationAccept, terms, privacy } =
  config.routes;

const { url: appUrl, name: appName } = config.app;

export const PRODUCT_DESCRIPTION = `Drop in a public GitHub repository URL and get architecture diagrams, AI chat, and deep links to every file and function — all auto-updated on every commit.`;

// ─── Base (root layout) ───────────────────────────────────────────────────────

export const baseMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s - ${appName}`,
  },
  description: PRODUCT_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: appName,
    locale: "en_US",
    images: [
      {
        url: "/thumbnail.png",
        width: 1920,
        height: 1080,
        alt: appName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

// ─── Per-page ─────────────────────────────────────────────────────────────────

export const homepageMetadata: Metadata = {
  title: {
    absolute: `${appName} - Know any codebase before you touch it`,
  },
  openGraph: {
    title: `${appName} - Know any codebase before you touch it`,
    description: PRODUCT_DESCRIPTION,
    url: home,
  },
};

export const waitlistMetadata: Metadata = {
  title: "Join the Waitlist",
  description: `${appName} turns public GitHub repositories into auto-updating overviews with architecture diagrams, AI chat, and deep links. Join the waitlist for early access.`,
  openGraph: {
    title: `Join the Waitlist - ${appName}`,
    description: `${appName} turns public GitHub repositories into auto-updating overviews with architecture diagrams, AI chat, and deep links. Join the waitlist for early access.`,
    url: waitlist,
  },
};

export const privacyMetadata: Metadata = {
  title: "Privacy Policy",
  description: `What ${appName} collects, why, and how long it's kept — plus a firm commitment against AI training on your data and details on how submitted repository code is handled.`,
  openGraph: {
    title: `Privacy Policy - ${appName}`,
    description: `What ${appName} collects, why, and how long it's kept — plus a firm commitment against AI training on your data and details on how submitted repository code is handled.`,
    url: privacy,
  },
};

export const termsMetadata: Metadata = {
  title: "Terms of Service",
  description: `${appName}'s ground rules: what submitting a repository means, what beta access entitles you to, who owns generated scoops, and where liability ends.`,
  openGraph: {
    title: `Terms of Service - ${appName}`,
    description: `${appName}'s ground rules: what submitting a repository means, what beta access entitles you to, who owns generated scoops, and where liability ends.`,
    url: terms,
  },
};

export type AuthRoute = "sign-in" | "sign-up" | "invitation";

const AUTH_TITLES: Record<AuthRoute, string> = {
  "sign-in": "Sign In",
  "sign-up": "Sign Up",
  invitation: "Accept Invitation",
};

export function authMetadata(route?: AuthRoute): Metadata {
  return {
    ...(route && { title: AUTH_TITLES[route] }),
    robots: { index: false, follow: false },
  };
}

export const notFoundMetadata: Metadata = {
  title: "404 - Not Found",
  description: "This page doesn't exist.",
  robots: { index: false, follow: false },
};

// ─── Robots config ────────────────────────────────────────────────────────────

export const robotsConfig: MetadataRoute.Robots = {
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: [`${signIn}/`, `${signUp}/`, `${invitationAccept}`, "/api/"],
  },
  sitemap: absoluteUrl("/sitemap.xml"),
};

// ─── Sitemap URLs ─────────────────────────────────────────────────────────────

export const sitemapUrls: MetadataRoute.Sitemap = [
  {
    url: appUrl,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1.0,
  },
  {
    url: absoluteUrl(waitlist),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: absoluteUrl(privacy),
    lastModified: PRIVACY_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: absoluteUrl(terms),
    lastModified: TERMS_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];
