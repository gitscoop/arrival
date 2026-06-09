import { PropsWithChildren } from "react";
import { LegalFooter } from "@/components/legal/footer";

export default function LegalLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <LegalFooter />
    </div>
  );
}
