import { config } from "@/lib/config";
import type { LegalSection } from "@/types/legal";

export const PRIVACY_LAST_UPDATED = new Date("2026-07-03");

export const privacySections: LegalSection<string>[] = [
  {
    id: "policy-scope",
    number: "01",
    title: "Policy Scope",
    content: `
    This Privacy Policy describes how ${config.app.name} (the "Service") collects, uses, stores, and shares information about individuals who interact with it - including those who join the waitlist, receive private beta access, or use the Service in any capacity.

    The Service is currently in pre-launch and operating across two phases:

    - **Waitlist phase** — Open to anyone. Only an email address is collected.
    - **Private beta phase** — Invite-only. Account and usage data are collected as described in §03.

    This policy applies to both phases and will be updated as the Service evolves toward general availability.
    `,
  },
  {
    id: "exclusions",
    number: "02",
    title: "Exclusions",
    content: `
    <ShortSummary>
      ${config.app.name} does not collect sensitive personal data, payment information, or source code from public repositories.
    </ShortSummary>

    To be unambiguous about what ${config.app.name} does **not** collect:

    - No sensitive personal information (race, ethnicity, religion, health data, biometrics)
    - No payment or billing information during the waitlist or beta phases
    - No raw source code stored permanently from submitted repositories
    - No data purchased or obtained from third-party data brokers
    - No content from private repositories (private repository support is a planned future feature)
    `,
  },
  {
    id: "information-gathered",
    number: "03",
    title: "Information Gathered",
    content: `
    <ShortSummary>
      The waitlist collects an email address and limited technical data for security and abuse prevention. In beta, basic account info, submitted URLs, generated content, and standard usage logs are collected.
    </ShortSummary>

    <p className="mt-2"><strong>During the Waitlist Phase</strong></p>

    When joining the waitlist, the following information may be collected:

    - **Email address** — used solely to manage waitlist position, communicate invitation status, and send occasional product updates
    - **Technical identifiers** — IP address and browser signals used only for bot detection, abuse prevention, and rate limiting

    This data is stored and managed through third-party authentication and infrastructure providers. Joining the waitlist does not create an account.

    <p className="mt-6"><strong>During the Private Beta Phase</strong></p>

    Upon accepting a beta invitation and creating an account, the following information may be collected:

    - **Account data** — email address, username, and authentication credentials (managed via a third-party provider)
    - **Repository URLs submitted** — the GitHub repository URLs you enter into the Service
    - **Generated content** — scoops, diagrams, and chat histories produced from submitted repositories
    - **Usage data** — features accessed, actions taken within the Service, session frequency and duration

    <p className="mt-6"><strong>Automatically Collected Information</strong></p>

    Certain technical information is collected automatically when the Service is accessed:

    - **Log data** — IP address, browser type, operating system, referring URLs, and timestamps
    - **Device data** — device type, screen resolution, and language preferences
    - **Performance data** — error reports, crash logs, and response times used for debugging

    This data does not identify you individually but may be combined with other data to diagnose issues or improve the Service.
    `,
  },
  {
    id: "information-utilization",
    number: "04",
    title: "Information Utilization",
    content: `
    <ShortSummary>
      Data is used to operate the Service, manage access, generate documentation, and communicate — nothing else.
    </ShortSummary>

    Information collected is used for the following purposes only:

    - **Waitlist management** — to process waitlist entries and send invitation emails via third-party infrastructure
    - **Account operation** — to authenticate users, maintain sessions, and manage beta access
    - **Service delivery** — to process submitted repository URLs, generate scoops, diagrams, and AI-powered chat responses
    - **Product communication** — to notify users of invitation status, platform updates, and material changes to terms or policies
    - **Security and abuse prevention** — to detect and prevent fraudulent, unauthorized, or abusive use of the Service
    - **Performance improvement** — to identify bugs, diagnose errors, and improve platform stability during beta

    Information is not used for advertising, behavioral profiling, or sold to any third party for commercial purposes.
    `,
  },
  {
    id: "repository-processing",
    number: "05",
    title: "Repository Processing",
    content: `
    <ShortSummary>
      Submitted public GitHub repository URLs are read and processed to generate documentation. No raw source code is permanently stored.
    </ShortSummary>

    The core function of ${config.app.name} is to accept a publicly accessible GitHub repository URL and generate structured documentation from it. The following applies to this processing:

    - The Service accesses repository contents via GitHub's public APIs or public access endpoints
    - Only repositories that are publicly accessible without authentication are processed
    - Source code is read and analyzed transiently for the purpose of generating scoops, diagrams, and AI context
    - Raw source code is **not** permanently stored beyond what is operationally necessary for generation and caching
    - Generated scoops and diagrams are stored and associated with the submitted URL for retrieval purposes
    - Cached documentation may be retained to avoid redundant processing and can be deleted upon request

    By submitting a repository URL, users represent that they are not directing the Service to process any repository in violation of that repository's license, its owner's intent, or any applicable platform policy.

    Public repository contents are already publicly accessible. ${config.app.name} does not acquire any rights to such code and processes it solely to provide the Service's documentation features.
    `,
  },
  {
    id: "ai-processing",
    number: "06",
    title: "AI Processing",
    content: `
    <ShortSummary>
      Repository content and queries are sent to third-party AI providers to generate output. These providers have their own data handling policies.
    </ShortSummary>

    ${config.app.name} uses third-party AI model providers (which may include OpenAI, Anthropic, and Google) to generate documentation, diagrams, and chat responses. By using the Service, you acknowledge that:

    - Repository content excerpts, user queries, and contextual data may be transmitted to third-party AI providers as inputs
    - Third-party AI providers process this data under their own terms of service and privacy policies
    - API-tier usage with major AI providers defaults to **no training** on submitted data (inputs are not used to improve provider models)
    - AI providers may retain input and output data for limited periods (typically up to 30 days) for abuse detection and operational purposes, per their own policies
    - ${config.app.name} does not control how third-party AI providers handle transmitted data beyond what their published policies specify

    Links to relevant third-party privacy policies:

    - [OpenAI Privacy Policy](https://openai.com/privacy)
    - [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
    - [Google Privacy Policy](https://policies.google.com/privacy)
    `,
  },
  {
    id: "model-training",
    number: "07",
    title: "Model Training",
    content: `
    <ShortSummary>
      User data, submitted repositories, and generated content are never used to train, fine-tune, or improve any AI model.
    </ShortSummary>

    <div className="my-4 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
      <p className="text-foreground">This is an explicit and unconditional commitment:</p>
      <ul className="mt-4 list-disc gap-1.5 pl-5 marker:text-emerald-600/60">
        <li>${config.app.name} does&nbsp;<strong>not</strong> use submitted repository contents, generated scoops, chat history, or any user data to train, fine-tune, or otherwise improve any AI or machine learning model</li>
        <li>${config.app.name} does&nbsp;<strong>not</strong>&nbsp;share user data with any third party for the purpose of AI or ML model training</li>
        <li>Generated documentation and outputs are used solely to serve the individual user who initiated the request</li>
      </ul>
    </div>

    If this policy were ever to change, affected users would be notified in advance and given the ability to opt out before any such change takes effect.
    `,
  },
  {
    id: "external-sharing",
    number: "08",
    title: "External Sharing",
    content: `
    <ShortSummary>
      Data is only shared with the infrastructure providers that make the Service operate. It is never sold.
    </ShortSummary>

    ${config.app.name} does not sell, rent, or trade personal information. Data may be shared with the following categories of third parties solely to operate the Service:

    <DataTable
      headers={["Third Party", "Purpose", "Data Shared"]}
      rows={[
        ["Authentication providers", "Waitlist management, authentication", "Email address, account credentials"],
        ["AI model providers", "Documentation and chat generation", "Repository content excerpts, user queries"],
        ["Hosting & infrastructure providers", "Compute, storage, CDN", "Logs, generated content"],
        ["Analytics providers", "Aggregate traffic analytics", "Anonymized usage events (no IP stored)"],
      ]}
    />

    Beyond the above, data may be disclosed in the following limited circumstances:

    - **Legal compliance** — if required by a valid legal process, court order, or applicable law
    - **Safety** — if disclosure is necessary to prevent imminent harm to any person
    - **Business transfer** — in the event of a merger, acquisition, or asset sale, users will be notified and the new operator will be bound by this policy or users will be given the option to delete their data
    `,
  },
  {
    id: "cookies",
    number: "09",
    title: "Cookies",
    content: `
    <ShortSummary>
      Essential cookies are used to operate the Service. No advertising or cross-site tracking cookies are used.
    </ShortSummary>

    ${config.app.name} uses cookies and similar technologies for the following purposes:

    - **Essential cookies** — required for authentication sessions, security tokens, and core Service functionality. These cannot be disabled without breaking the Service.
    - **Functional cookies** — used to remember preferences such as theme settings or dismissed notices
    - **Usage Analytics** — ${config.app.name} uses a cookieless analytics system. It does **not** set any analytics cookies. Visitor identification is done via an ephemeral per-request hash that is automatically discarded after 24 hours and cannot be used to identify individuals across sessions or sites

    ${config.app.name} does **not** use advertising cookies, retargeting pixels, or any cross-site tracking technology.

    Most browsers allow you to control cookies through their settings. Disabling essential cookies may prevent the Service from functioning correctly.

    **Do Not Track (DNT):** ${config.app.name} respects DNT signals where technically feasible. No cross-site behavioral tracking is performed regardless of DNT signal status.
    `,
  },
  {
    id: "storage-duration",
    number: "10",
    title: "Storage Duration",
    content: `
    <ShortSummary>
      Data is kept only as long as necessary for each phase. Beta data may be wiped. Waitlist emails are deleted upon request.
    </ShortSummary>

    Retention periods vary by data type and platform phase:

    <DataTable
      headers={["Data Type", "Retention Period"]}
      rows={[
        ["Waitlist email", "Until the waitlist closes, the user requests removal, or 12 months of inactivity"],
        ["Account data (beta)", "Until the account is terminated, or when the beta phase ends"],
        ["Generated scoops & diagrams", "Until the user deletes them, the account is terminated, or beta data is wiped"],
        ["Chat history", "Until the user clears it or the account is terminated"],
        ["Log and usage data", "Subject to the default retention policies of our infrastructure providers"],
        ["AI provider inputs", "Subject to the AI provider's retention policy (typically up to 30 days)"],
      ]}
    />

    <div className="my-4 rounded-md border border-border bg-muted/50 p-4 font-mono text-xs">
      <p className="mb-2 font-medium text-foreground">Beta data caveat:</p>
      <p>As stated in the Terms of Service, data generated during the beta phase (including scoops, diagrams, and chat history) may be wiped in full at any point, including at the end of the beta period. ${config.app.name} is under no obligation to retain or export this data.</p>
    </div>
    `,
  },
  {
    id: "security",
    number: "11",
    title: "Security",
    content: `
    <ShortSummary>
      Reasonable technical measures are in place, but no system is perfectly secure.
    </ShortSummary>

    ${config.app.name} implements appropriate technical and organizational measures to protect personal information, including:

    - Encrypted data transmission (TLS/HTTPS) for all Service interactions
    - Authentication managed through secure third-party infrastructure
    - Access controls limiting who can interact with stored data
    - Regular review of third-party service provider security practices

    No method of electronic transmission or storage is 100% secure. ${config.app.name} cannot guarantee absolute security and is not liable for unauthorized access resulting from circumstances beyond reasonable control. If a security incident affecting personal data is discovered, affected users will be notified in a timely manner to the extent required by applicable law.
    `,
  },
  {
    id: "user-rights",
    number: "12",
    title: "User Rights",
    content: `
    <ShortSummary>
      Regardless of location, users may request access to, correction of, or deletion of their personal data at any time.
    </ShortSummary>

    All users of the Service have the following rights with respect to their personal data:

    - **Right to access** — request a copy of the personal data held about you
    - **Right to correction** — request that inaccurate or incomplete data be corrected
    - **Right to deletion** — request that personal data be deleted (subject to legal retention obligations)
    - **Right to portability** — request personal data in a structured, machine-readable format where technically feasible
    - **Right to object** — object to the processing of personal data where it is based on legitimate interest
    - **Right to withdraw consent** — where processing is based on consent, withdraw it at any time without affecting prior processing
    - **Right to restriction** — request that processing be limited while a correction or objection is being resolved

    <div className="my-4 rounded-md border border-border bg-muted/50 p-4">
      <p className="mb-3 font-medium text-foreground">Waitlist participants</p>
      <p className="mb-3 text-sm text-muted-foreground">Individuals on the waitlist who have not yet received beta access have a simplified set of applicable rights:</p>
      <ul className="list-disc gap-1.5 pl-5 text-sm text-muted-foreground marker:text-foreground/40">
        <li><strong>Removal from waitlist</strong>&nbsp;— email <CopyableEmail email="${config.app.contactEmail}" /> at any time to have the email address removed from the waitlist entirely. Removal permanently revokes any pending invitation and cannot be reversed.</li>
        <li><strong>Confirmation of data held</strong>&nbsp;— request confirmation of whether an email address is currently stored in the waitlist system</li>
        <li><strong>Correction</strong>&nbsp;— request that a waitlist email address be corrected if submitted in error</li>
      </ul>
    </div>

    <p>To exercise any of these rights, contact <CopyableEmail email="${config.app.contactEmail}" />. Requests will be acknowledged within&nbsp;<strong>5 business days</strong>&nbsp;and resolved within&nbsp;<strong>30 days</strong> where technically and legally feasible. ${config.app.name} does not discriminate against users who exercise privacy rights.</p>
    `,
  },
  {
    id: "age-limits",
    number: "13",
    title: "Age Limits",
    content: `
    <p>The Service is intended for a general adult audience and is not directed at individuals under the age of 18. ${config.app.name} does not knowingly collect personal information from anyone under 18. If it is discovered that a minor has submitted personal data, that data will be deleted promptly. If you believe a minor has submitted information to the Service, contact&nbsp;<CopyableEmail email="${config.app.contactEmail}" /> immediately.</p>
    `,
  },
  {
    id: "external-links",
    number: "14",
    title: "External Links",
    content: `
    The Service may contain links to third-party websites, repositories, or services. This Privacy Policy applies only to ${config.app.name}. Third-party services operate under their own privacy policies and ${config.app.name} has no responsibility for their data practices. Reviewing the privacy policies of any third-party service before interacting with it is strongly recommended.
    `,
  },
  {
    id: "future-changes",
    number: "15",
    title: "Future Changes",
    content: `
    This Privacy Policy may be updated from time to time. The "Last updated" date at the top of this page reflects when the most recent changes were made.

    For material changes (such as new categories of data collected, new sharing practices, or changes to the AI training policy), notice will be provided via email (if an address is on file) or via a prominent notice on the Service before the changes take effect. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.
    `,
  },
  {
    id: "get-in-touch",
    number: "16",
    title: "Get in Touch",
    content: `
    <p>For any questions or inquiries regarding this Privacy Policy, please contact:&nbsp;<CopyableEmail email="${config.app.contactEmail}" /></p>
    `,
  },
];
