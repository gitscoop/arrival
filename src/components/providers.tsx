import { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { FingerprintProvider } from "@/lib/fingerprint";

import { AuthMethodTracker } from "@/components/auth/method-tracker";
import { ThemeKeybindListener } from "@/components/theme-keybind-listener";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthMethodTracker />
        <FingerprintProvider>{children}</FingerprintProvider>
        <ThemeKeybindListener />
      </ThemeProvider>
    </ClerkProvider>
  );
}
