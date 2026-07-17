import { config } from "@/lib/config";
import type { LegalSection } from "@/types/legal";

export const TERMS_LAST_UPDATED = new Date("2026-07-03");

export const termsSections: LegalSection<string>[] = [
  {
    id: "terms-acceptance",
    number: "01",
    title: "Terms Acceptance",
    content: `
    By accessing ${config.app.name} (whether by joining the waitlist, receiving a private beta invitation, or using the Service in any capacity), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms").

    If you do not agree, do not submit your email, accept an invitation, or use the Service in any form.
    `,
  },
  {
    id: "platform-status",
    number: "02",
    title: "Platform Status",
    content: `
    <ShortSummary>
      The Service is in pre-launch. The waitlist is open, beta is invite-only, and the product is actively being built.
    </ShortSummary>

    ${config.app.name} is in active pre-launch development. The platform is **not yet publicly available** and is progressing through the following phases:

    <ul className="my-4 list-disc gap-2 pl-5 marker:text-foreground/40">
      <li><strong>Phase 1 — Waitlist:</strong> Open to anyone. Submitting an email address reserves a place in the queue and signals interest. No account is created at this stage.</li>
      <li><strong>Phase 2 — Private Beta:</strong> Select waitlist members will receive invitations to access an early, incomplete version of the platform. Features are experimental, stability is not guaranteed, and the product is under active development.</li>
      <li><strong>Phase 3 — General Availability:</strong> A future, stable, public release. Timeline is not guaranteed.</li>
    </ul>

    These Terms apply to all phases. Additional beta-specific terms in §04 apply only during Phase 2.
    `,
  },
  {
    id: "waitlist-rules",
    number: "03",
    title: "Waitlist Rules",
    content: `
    <ShortSummary>
      Joining the waitlist reserves your spot but does not guarantee future access or create an account.
    </ShortSummary>

    Submitting an email address to the waitlist:

    - Creates a waitlist entry with status \`pending\`, managed via third-party authentication infrastructure
    - Does **not** create an account or grant access to any feature
    - Does **not** constitute a contract, obligation, or guarantee of future access
    - May result in receiving occasional product updates or launch announcements to the submitted address

    Joining the waitlist is entirely voluntary. There is no guarantee that any waitlist participant will ever receive an invitation. The order or criteria for invitation decisions is at sole discretion and may change at any time without notice.

    <p>To be removed from the waitlist at any time, contact&nbsp;<CopyableEmail email="${config.app.contactEmail}" />.</p>
    `,
  },
  {
    id: "private-beta",
    number: "04",
    title: "Private Beta",
    content: `
    <ShortSummary>
      Beta access is a privilege for an unfinished product. Expect bugs, changes, and know that your data may be wiped at any time. Public sharing is encouraged!
    </ShortSummary>

    Private beta access is invite-only and governed by the following additional terms. By accepting a beta invitation, you agree to these conditions on top of the rest of these Terms.

    <p className="mt-6"><strong>Nature of beta access:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>Beta access is provided as a privilege, not a right</li>
      <li>Access may be granted, revoked, paused, or permanently ended at any time, with or without notice or reason</li>
      <li>The number of active beta users may be limited at any time</li>
    </ul>

    <p className="mt-6"><strong>Unfinished product:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>The Service during beta is incomplete, unstable, and actively changing</li>
      <li>Features may be added, removed, or significantly altered between sessions without notice</li>
      <li>Bugs, outages, data inconsistencies, and broken functionality are expected and are part of the testing process</li>
    </ul>

    <p className="mt-6"><strong>Data during beta:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>Data generated or stored during the beta period (including submitted repository scoops, diagrams, and chat history) <strong>may be wiped at any time</strong>, including at the end of the beta phase</li>
      <li>There is no obligation to migrate, export, or preserve any beta-period data into a future version of the platform</li>
      <li>Beta users are solely responsible for maintaining independent copies of any content they consider important</li>
    </ul>

    <p className="mt-6"><strong>No SLA or uptime commitment:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>No service level agreement, uptime guarantee, or support obligation applies during the beta phase</li>
      <li>Response to bug reports or feedback is offered voluntarily and at discretion, not as a contractual obligation</li>
    </ul>

    <p className="mt-6"><strong>Sharing Guidelines:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>You are welcome and encouraged to publicly share, stream, or discuss your experience with the beta</li>
      <li>When sharing screenshots, generated scoops, or feedback publicly, you acknowledge that the Service is in an early, unfinished state</li>
      <li>While public discussion is encouraged, any critical security vulnerabilities must be reported privately rather than disclosed publicly</li>
    </ul>

    <p className="mt-6"><strong>Feedback:</strong></p>
    <ul className="my-2 list-disc gap-1.5 pl-5 marker:text-foreground/40">
      <li>Feedback, bug reports, feature suggestions, and observations submitted during beta are voluntarily given</li>
      <li>Any such feedback becomes the sole property of ${config.app.name} and may be used without restriction, compensation, or attribution</li>
      <li>Submitting feedback grants an irrevocable, royalty-free, worldwide license to use, implement, and build upon it in any form</li>
    </ul>
    `,
  },
  {
    id: "platform-features",
    number: "05",
    title: "Platform Features",
    content: `
    <ShortSummary>
      The Service automatically generates scoops, diagrams, and AI chat contexts from public GitHub repository URLs. A platform account is required, but GitHub credentials are not.
    </ShortSummary>

    ${config.app.name} is an AI-powered documentation platform that accepts a public GitHub repository URL and generates a continuously updated, structured scoop. While a platform account is required to use the Service, **no GitHub authentication or repository credentials are required** to process public repositories. Core capabilities include:

    <ul className="my-4 list-disc gap-2 pl-5 marker:text-foreground/40">
      <li><strong>Automated documentation</strong> — The Service scans a submitted repository URL and generates structured documentation, regenerating it after each detected change or commit</li>
      <li><strong>AI-powered chat</strong> — An integrated chat interface answers questions about a submitted repository using the generated scoop as context</li>
      <li><strong>Diagram generation</strong> — Architecture, class, and sequence diagrams are automatically derived from the structure of the submitted repository's source code</li>
      <li><strong>Code hyperlinking</strong> — Scoop entries and chat responses link directly to the relevant files, classes, and functions within the submitted repository</li>
    </ul>

    These features are available in varying degrees of completeness depending on the current platform phase. During beta, any or all of these features may be partially implemented, experimental, or non-functional.

    The Service is available as a hosted product and as a self-hostable distribution. These Terms govern **only** the hosted version at [${config.app.url}](${config.app.url}).
    `,
  },
  {
    id: "eligibility",
    number: "06",
    title: "Eligibility",
    content: `
    <ShortSummary>
      You must be at least 18 years old to use the Service and are responsible for keeping your account secure.
    </ShortSummary>

    To receive beta access, an account is created via a secure invitation flow managed by a third-party authentication provider. By accepting an invitation and creating an account, you represent that:

    - You are at least 18 years of age, or the age of legal majority in your jurisdiction, whichever is higher
    - You will not attempt to bypass the waitlist or invitation system using unauthorized or automated means
    - You are solely responsible for maintaining the security of your credentials and all activity under your account
    - You will not share, transfer, or sell your beta access to any other individual

    ${config.app.name} reserves the right to refuse, revoke, or disable access for any reason, without notice or liability.
    `,
  },
  {
    id: "url-processing",
    number: "07",
    title: "URL Processing",
    content: `
    <ShortSummary>
      Only public repositories are supported. You must have the right to submit the URL, and no raw code is permanently stored. No GitHub authentication is required.
    </ShortSummary>

    The Service processes publicly accessible GitHub repositories submitted via URL. No repository authentication, GitHub OAuth tokens, or source control credentials are required or requested for public repositories. By submitting a repository URL, you acknowledge and agree that:

    - The Service reads and processes source code that is already publicly available under the submitted repository's own open-source license
    - You are not attempting to circumvent access controls, bypass restrictions, or process a repository that is private, access-gated, or not intended for public access
    - You confirm that submitting the URL does not violate the terms of any third-party platform (including GitHub's Acceptable Use Policies) or any applicable law
    - Processing a repository does not imply endorsement of, affiliation with, or responsibility for its contents

    The Service does not permanently store raw source code beyond what is operationally necessary for documentation generation and scoop maintenance. Generated scoops may be cached to improve performance and can be cleared upon request.

    **Private repository support** — Authenticated integration with private repositories is a planned future feature. When available, it will be governed by additional terms covering credential scope, data handling, and access revocation.
    `,
  },
  {
    id: "generated-output",
    number: "08",
    title: "Generated Output",
    content: `
    <ShortSummary>
      AI-generated output may be inaccurate. Do not use it as the sole source of truth for critical or security-sensitive decisions.
    </ShortSummary>

    ${config.app.name} uses third-party AI models and language processing infrastructure to generate documentation, diagrams, and chat responses. You acknowledge that:

    - AI-generated output may be incomplete, inaccurate, outdated, or structurally incorrect
    - Documentation, diagrams, and chat responses do not constitute professional, technical, legal, or security advice
    - No representations are made about the correctness of any auto-generated architecture, logic flows, or code interpretation
    - You are solely responsible for reviewing, validating, and deciding whether to act on any AI-generated content
    - ${config.app.name} is not liable for any outcome resulting from decisions made based on AI-generated output

    AI-generated content must not be used as a sole source of truth for production systems, security-sensitive infrastructure, compliance assessments, or legal matters.
    `,
  },
  {
    id: "ip-rights",
    number: "09",
    title: "IP Rights",
    content: `
    <ShortSummary>
      You retain all rights to your code. The Service is granted permission to process it, while the platform's own IP remains protected.
    </ShortSummary>

    **Repository code:** All intellectual property rights in any source code processed by the Service remain with the respective repository owners. ${config.app.name} claims no ownership over submitted repositories or the documentation generated from them. Public repositories are processed in accordance with their own open-source licenses. Ensuring that any use of generated output complies with the relevant repository license is the submitting user's responsibility.

    **License to operate:** By submitting a repository URL, you grant ${config.app.name} a limited, non-exclusive, royalty-free license to access, read, process, and use the repository's publicly available contents solely to provide the Service's features. For public repositories, this license is consistent with the repository's existing public accessibility. This license terminates when the generated scoop is deleted or the account is closed.

    **Platform IP:** The ${config.app.name} name, logo, and visual identity are trademarks and are not covered by the license in the repository's \`LICENSE\` file. You may not use them in any way that implies endorsement or affiliation without explicit written permission.

    Access to the source code is governed by the license in the repository's \`LICENSE\` file, which controls all rights to use, copy, modify, and redistribute. These Terms separately govern the **hosted Service** (the running, operated product at [${config.app.url}](${config.app.url})); no source license grants the right to scrape, resell access to, or systematically reproduce it.
    `,
  },
  {
    id: "usage-rules",
    number: "10",
    title: "Usage Rules",
    content: `
    <ShortSummary>
      Do not misuse the Service, attempt to bypass security controls, or use it for illegal purposes.
    </ShortSummary>

    You agree not to use the Service to:

    - Violate any applicable laws, regulations, or third-party rights
    - Submit URLs to private, access-restricted, or access-gated repositories to circumvent access controls
    - Attempt to extract, scrape, or reverse-engineer the Service's system prompts, processing logic, or infrastructure
    - Conduct automated abuse, denial-of-service attacks, or unauthorized access attempts against the Service or any third-party platform
    - Circumvent rate limits, authentication, or access controls
    - Share, resell, or transfer beta access credentials to any third party
    - Copy, distribute, or build upon the source code without complying with the license in the repository's \`LICENSE\` file

    Breaches may result in immediate and permanent account termination without notice.
    `,
  },
  {
    id: "codebase-license",
    number: "11",
    title: "Codebase License",
    content: `
    The core codebase is made available under the license in the repository's \`LICENSE\` file, which governs use, copying, modification, and distribution of the source code independently of these Terms.

    These Terms govern exclusively the hosted instance of the Service at [${config.app.url}](${config.app.url}). Self-hosting ${config.app.name} is done entirely under that license, without any warranty, support, or obligation from the original operator.
    `,
  },
  {
    id: "external-providers",
    number: "12",
    title: "External Providers",
    content: `
    The Service relies on third-party infrastructure, including:

    - **AI model providers** for documentation generation and chat
    - **Version control platforms** as the source of publicly accessible repository data
    - **Authentication infrastructure providers** for waitlist and account management
    - **Hosting and compute providers** for platform infrastructure

    These services operate under their own terms and privacy policies. ${config.app.name} is not responsible for the practices, availability, or data handling of any third-party service.
    `,
  },
  {
    id: "privacy",
    number: "13",
    title: "Privacy",
    content: `
    The collection and handling of personal data is governed by the ${config.app.name} [Privacy Policy](${config.app.url}${config.routes.privacy}). By using the Service (including joining the waitlist), you agree to the Privacy Policy, which is incorporated into these Terms by reference.

    Waitlist participants provide only an email address. That address may be used to notify you of invitation status, product updates, and launch announcements. It will not be sold or shared with third parties for marketing purposes.
    `,
  },
  {
    id: "risk-assumption",
    number: "14",
    title: "Risk Assumption",
    content: `
    <ShortSummary>
      The Service is provided "as is" without warranties of any kind. Liability is strictly limited.
    </ShortSummary>

    <div className="gap-4 rounded-lg bg-muted/50 p-4 font-mono text-xs tracking-tight">
      <div>
        <div className="mb-4">
          THE SERVICE, INCLUDING ALL BETA FEATURES, AI-GENERATED OUTPUT, DOCUMENTATION, AND DIAGRAMS, IS PROVIDED ON AN&nbsp;<strong>"AS IS"</strong> AND <strong>"AS AVAILABLE"</strong> BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, ALL WARRANTIES OF ANY KIND ARE EXPRESSLY DISCLAIMED, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.
        </div>
        <p className="mb-2">NO WARRANTY IS MADE THAT:</p>
        <ul className="list-disc gap-1 pl-5 marker:text-foreground/40">
          <li>THE SERVICE WILL OPERATE UNINTERRUPTED, SECURELY, OR WITHOUT ERROR</li>
          <li>AI-GENERATED DOCUMENTATION, DIAGRAMS, OR CHAT RESPONSES WILL BE ACCURATE OR COMPLETE</li>
          <li>DATA STORED DURING THE BETA PERIOD WILL BE RETAINED OR RECOVERABLE</li>
          <li>THE SERVICE WILL CONTINUE TO EXIST BEYOND THE CURRENT PHASE</li>
          <li>ANY PARTICULAR FEATURE WILL BE AVAILABLE IN A FUTURE VERSION</li>
        </ul>
      </div>
      <div>
        <div className="mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ${config.app.name.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF DATA, LOSS OF BUSINESS, OR LOSS OF ANTICIPATED SAVINGS) ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
        </div>
        <div>
          BECAUSE THE SERVICE IS CURRENTLY FREE DURING THE WAITLIST AND BETA PHASES, THE TOTAL LIABILITY FOR ALL CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED <strong>$0 USD</strong> DURING ANY PERIOD IN WHICH NO FEES HAVE BEEN CHARGED. ONCE PAID PLANS ARE INTRODUCED, LIABILITY SHALL NOT EXCEED THE AMOUNT PAID IN THE THREE MONTHS PRECEDING THE CLAIM.
        </div>
      </div>
    </div>
    `,
  },
  {
    id: "termination",
    number: "15",
    title: "Termination",
    content: `
    <ShortSummary>
      You can leave at any time. Access can be terminated at any time, and your data may be deleted as a result.
    </ShortSummary>

    You may stop using the Service, clear submitted repository scoops, and delete your account at any time.

    ${config.app.name} reserves the right to terminate or suspend any account, waitlist entry, or beta access at any time, with or without cause or notice. Upon termination:

    - Your license to use the Service ends immediately
    - Data associated with your account, including generated scoops, may be deleted
    - No obligation exists to provide data exports, backups, or migration assistance during the beta phase

    §04 (Private Beta - Feedback), §09 (Intellectual Property), §10 (Usage Rules), §14 (Risk Assumption), and §16 (Arbitration) survive termination.
    `,
  },
  {
    id: "arbitration",
    number: "16",
    title: "Arbitration",
    content: `
    Any dispute arising from or relating to these Terms shall first be attempted to be resolved through good-faith direct communication. If unresolved, disputes shall be settled through binding arbitration on an individual basis. Class actions and class arbitrations are expressly waived.
    `,
  },
  {
    id: "service-changes",
    number: "17",
    title: "Service Changes",
    content: `
    These Terms may be updated at any time. Material changes will be communicated via email (if an address is on file) or via a notice on the Service. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.

    ${config.app.name} also reserves the right to change, pause, pivot, or permanently discontinue the Service, or any feature, at any time, for any reason, without notice or liability.
    `,
  },
  {
    id: "get-in-touch",
    number: "18",
    title: "Get in Touch",
    content: `
    <p>For any questions or inquiries regarding these Terms of Service, please contact:&nbsp;<CopyableEmail email="${config.app.contactEmail}" /></p>
    `,
  },
];
