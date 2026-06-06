import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { authMetadata } from "@/seo/metadata";

export const metadata: Metadata = authMetadata("sign-up");

export default function SignUpLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
