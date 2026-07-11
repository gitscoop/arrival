import type { ComponentPropsWithoutRef } from "react";

import {
  ShortSummary,
  DataTable,
  CopyableEmail,
} from "@/components/legal/shared";

export const mdxComponents = {
  // ── Custom components ────────────────────────────────────────────────────
  ShortSummary,
  DataTable,
  CopyableEmail,

  // ── HTML element mappings ────────────────────────────────────────────────
  p: (props: ComponentPropsWithoutRef<"p">) => <p {...props} />,

  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-4 flex list-disc flex-col gap-1.5 pl-5 marker:text-foreground/40"
      {...props}
    />
  ),

  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,

  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium text-foreground" {...props} />
  ),

  a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
      target="_blank"
      rel="noopener"
      {...props}
    >
      {children}
      <span className="visually-hidden"> (opens in new tab)</span>
    </a>
  ),

  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
      {...props}
    />
  ),
};
