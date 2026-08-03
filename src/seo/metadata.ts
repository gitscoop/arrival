import { config } from "@/lib/config";
import { absoluteUrl } from "@/lib/utils";

import type { Metadata, MetadataRoute } from "next";

import { TERMS_LAST_UPDATED } from "@/content/legal/terms";
import { PRIVACY_LAST_UPDATED } from "@/content/legal/privacy";

const { signIn, signUp, waitlist, home, invitationAccept, terms, privacy } =
  config.routes;

const { url: appUrl, name: appName } = config.app;

export const PRODUCT_DESCRIPTION = `Drop in a public GitHub repository URL and get architecture diagrams, AI chat, and deep links to every file and function — all auto-updated on every commit.`;

const socialImages = [
  {
    url: "/thumbnail.png",
    width: 1536,
    height: 1024,
    alt: appName,
  },
];

const sharedOpenGraph = {
  type: "website",
  siteName: appName,
  locale: "en_US",
  images: socialImages,
} satisfies NonNullable<Metadata["openGraph"]>;

function pageSocial({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      ...sharedOpenGraph,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImages,
    },
  };
}

// ─── Base (root layout) ───────────────────────────────────────────────────────

export const baseMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s - ${appName}`,
  },
  description: PRODUCT_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: sharedOpenGraph,
  twitter: {
    card: "summary_large_image",
    images: socialImages,
  },
};

// ─── Per-page ─────────────────────────────────────────────────────────────────

const homepageTitle = `${appName} - Know any codebase before you touch it`;

export const homepageMetadata: Metadata = {
  title: {
    absolute: homepageTitle,
  },
  ...pageSocial({
    title: homepageTitle,
    description: PRODUCT_DESCRIPTION,
    url: home,
  }),
};

const waitlistDescription = `${appName} turns public GitHub repositories into auto-updating overviews with architecture diagrams, AI chat, and deep links. Join the waitlist for early access.`;

export const waitlistMetadata: Metadata = {
  title: "Join the Waitlist",
  description: waitlistDescription,
  ...pageSocial({
    title: `Join the Waitlist - ${appName}`,
    description: waitlistDescription,
    url: waitlist,
  }),
};

const privacyDescription = `What ${appName} collects, why, and how long it's kept — plus a firm commitment against AI training on your data and details on how submitted repository code is handled.`;

export const privacyMetadata: Metadata = {
  title: "Privacy Policy",
  description: privacyDescription,
  ...pageSocial({
    title: `Privacy Policy - ${appName}`,
    description: privacyDescription,
    url: privacy,
  }),
};

const termsDescription = `${appName}'s ground rules: what submitting a repository means, what beta access entitles you to, who owns generated scoops, and where liability ends.`;

export const termsMetadata: Metadata = {
  title: "Terms of Service",
  description: termsDescription,
  ...pageSocial({
    title: `Terms of Service - ${appName}`,
    description: termsDescription,
    url: terms,
  }),
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
