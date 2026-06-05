import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { authMetadata } from "@/seo/metadata";

export const metadata: Metadata = authMetadata("invitation");

export default function InvitationLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
