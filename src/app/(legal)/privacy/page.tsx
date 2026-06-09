import type { Metadata } from "next";
import { config } from "@/lib/config";
import { privacyMetadata } from "@/seo/metadata";
import { compileMDX } from "next-mdx-remote/rsc";
import type { LegalSection } from "@/types/legal";

import { mdxComponents } from "@/components/legal/renderer";
import { LegalPageTemplate } from "@/components/legal/page-template";

import { privacySections, PRIVACY_LAST_UPDATED } from "@/content/legal/privacy";

export const metadata: Metadata = privacyMetadata;

const privacyLastUpdated = PRIVACY_LAST_UPDATED.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function PrivacyPolicyPage() {
  const sections: LegalSection[] = await Promise.all(
    privacySections.map(async (section) => {
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
      title="Privacy Policy"
      lastUpdated={privacyLastUpdated}
      summary={
        <>
          {config.app.name} collects minimal data. During the waitlist phase,
          only an email address is stored. During private beta, basic account
          and usage data is collected. Public GitHub repositories submitted via
          URL are processed to generate scoops. No source code is permanently
          stored. User data is never used to train AI models. Third-party AI
          providers process inputs under their own data policies. You have the
          right to access, correct, and delete your data at any time.
        </>
      }
      sections={sections}
    />
  );
}
