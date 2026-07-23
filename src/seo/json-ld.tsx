import { config } from "@/lib/config";
import { PRODUCT_DESCRIPTION } from "@/seo/metadata";

const { url: appUrl, name: appName } = config.app;

// ─── Site-wide (root layout) ──────────────────────────────────────────────────

export function SiteSchema() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: appName,
      url: appUrl,
      sameAs: Object.values(config.app.social),
      contactPoint: {
        "@type": "ContactPoint",
        email: config.app.contactEmail,
        contactType: "customer support",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: appName,
      url: appUrl,
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Homepage only ────────────────────────────────────────────────────────────

export function AppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appName,
    applicationCategory: "DeveloperApplication",
    description: PRODUCT_DESCRIPTION,
    url: appUrl,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
