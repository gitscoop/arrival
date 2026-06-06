"use client";

import { useEffect } from "react";
import { config } from "@/lib/config";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthRedirect } from "@/components/auth/redirect";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  /*
    Gives Clerk a moment to establish the session after OAuth
  */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      router.push(config.routes.home);
      return;
    }

    /*
      If Clerk has loaded but user is not signed in, wait briefly then redirect with error.
    */
    const timer = setTimeout(() => {
      if (!isSignedIn) {
        const signInUrl = new URL(config.routes.signIn, window.location.origin);

        signInUrl.searchParams.set("error", "sso_account_not_found");
        router.push(signInUrl.toString());
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  return <AuthRedirect />;
}
