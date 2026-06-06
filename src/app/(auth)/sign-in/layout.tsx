import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { authMetadata } from "@/seo/metadata";

export const metadata: Metadata = authMetadata("sign-in");

export default function SignInLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
