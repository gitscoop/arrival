import type { Metadata } from "next";
import { config } from "@/lib/config";
import { termsMetadata } from "@/seo/metadata";
import { compileMDX } from "next-mdx-remote/rsc";
import type { LegalSection } from "@/types/legal";

import { mdxComponents } from "@/components/legal/renderer";
import { LegalPageTemplate } from "@/components/legal/page-template";

import { termsSections, TERMS_LAST_UPDATED } from "@/content/legal/terms";

export const metadata: Metadata = termsMetadata;

const termsLastUpdated = TERMS_LAST_UPDATED.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function TermsOfServicePage() {
  const sections: LegalSection[] = await Promise.all(
    termsSections.map(async (section) => {
      const { content } = await compileMDX({
        source: section.content,
        components: mdxComponents,
        options: { blockJS: false },
      });

      return {
        id: section.id,
        number: section.number,
        title: section.title,
        content,
      };
    }),
  );

  return (
    <LegalPageTemplate
      title="Terms of Service"
      lastUpdated={termsLastUpdated}
      summary={
        <>
          {config.app.name} is currently in pre-launch. Joining the waitlist
          means submitting an email address and nothing more. Private beta
          access is invite-only, limited in availability, and the product is
          unfinished. Paste any public GitHub repository URL and the platform
          generates a living scoop. No account or authentication is needed for
          public repos. Your code remains entirely yours. AI-generated output is
          provided as-is and should always be verified. The platform reserves
          the right to change, pause, or shut down at any time during this
          phase.
        </>
      }
      sections={sections}
    />
  );
}
