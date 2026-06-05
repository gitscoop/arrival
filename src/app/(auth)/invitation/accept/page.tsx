"use client";

import { toast } from "sonner";
import { useSignUp } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useReducer, useState, useTransition } from "react";

import { config } from "@/lib/config";
import { isClerkAPIResponseError } from "@/lib/utils";

import {
  InvitationForm,
  type InvitationFormData,
} from "@/components/auth/invitation/form";

import { InvitationLoading } from "@/components/auth/invitation/loading";
import { InvitationError } from "@/components/auth/invitation/error";

import { useAuthMethod } from "@/hooks/use-auth-method";
import { useErrorParam } from "@/hooks/use-error-param";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Social login was cancelled.",
  identifier_already_exists: "Already in the system. Sign in instead.",
  external_account_exists: "Taken by another user. Try a different account.",
  default: "Error signing in. Please retry.",
};

const CLERK_TICKET_PARAM = "__clerk_ticket";

export default function InvitationAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isPending, startTransition] = useTransition();

  const invitationTicket = searchParams.get(CLERK_TICKET_PARAM);

  type InviteState =
    | { status: "loading"; email?: never }
    | { status: "signup_ready"; email: string }
    | { status: "error"; email?: never };

  type InviteAction =
    | { type: "ticket_verified"; email: string }
    | { type: "ticket_failed" };

  const [{ status, email }, dispatchInvite] = useReducer(
    (_prevState: InviteState, action: InviteAction): InviteState => {
      if (action.type === "ticket_verified") {
        return { status: "signup_ready", email: action.email };
      }

      return { status: "error" };
    },
    { status: "loading" },
  );

  const lastUsed = useAuthMethod();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useErrorParam(OAUTH_ERROR_MESSAGES);

  /* 
    Handles OAuth errors in `signUp` verifications
  */
  useEffect(() => {
    if (!isLoaded) return;
    const oauthError = signUp.verifications?.externalAccount?.error;

    if (oauthError) {
      const errorCode = oauthError.code || "default";

      const message =
        OAUTH_ERROR_MESSAGES[errorCode] ||
        oauthError.longMessage ||
        oauthError.message ||
        OAUTH_ERROR_MESSAGES.default;

      toast.error(message, { id: "oauth-error", duration: 6000 });
    }

    if (signUp.status === "complete") {
      setActive({ session: signUp.createdSessionId }).then(() => {
        router.push(config.routes.home);
      });

      return;
    }

    const isSocialReturn =
      signUp?.verifications?.externalAccount?.status === "verified";

    /* 
      Verifies against server if ticket exists
    */
    if (invitationTicket && !isSocialReturn) {
      const handleTicket = async () => {
        if (status !== "loading") return;

        try {
          const response = await signUp.create({
            strategy: "ticket",
            ticket: invitationTicket,
          });

          if (response.status === "complete") {
            await setActive({ session: response.createdSessionId });
            router.push(config.routes.home);
          } else if (response.status === "missing_requirements") {
            if (!response.emailAddress) {
              dispatchInvite({ type: "ticket_failed" });
              return;
            }

            dispatchInvite({
              type: "ticket_verified",
              email: response.emailAddress,
            });
          } else {
            console.error("Unexpected status:", response.status);
            dispatchInvite({ type: "ticket_failed" });
          }
        } catch {
          dispatchInvite({ type: "ticket_failed" });
        }
      };

      handleTicket();
      return;
    }

    if (signUp.status === "missing_requirements" && signUp.emailAddress) {
      dispatchInvite({ type: "ticket_verified", email: signUp.emailAddress });
      return;
    }
  }, [isLoaded, invitationTicket, signUp, setActive, router, status]);

  const onSubmit = async (data: InvitationFormData): Promise<string | void> => {
    if (!isLoaded || !signUp) return;

    try {
      const response = await signUp.update({
        password: data.password,
      });

      if (response.status === "complete") {
        localStorage.setItem("pendingAuthMethod", "email");
        await setActive({ session: response.createdSessionId });

        startTransition(() => {
          router.push(config.routes.home);
        });
      } else {
        console.error("Sign up incomplete:", response);
        toast.error("Oops, something went wrong. Please try again!");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        for (const e of err.errors) {
          const isPasswordError =
            e.meta?.paramName === "password" ||
            e.code.startsWith("form_password_");

          if (isPasswordError) {
            return e.code === "form_password_pwned"
              ? "Password has been found in an online data breach. For account safety, please use a different password."
              : e.message;
          }

          toast.error(e.message || "An error occurred.");
        }
      } else {
        toast.error("An error occurred during sign up.");
      }
    }
  };

  const handleSocialLogin = async (
    strategy: "oauth_github" | "oauth_google",
  ) => {
    const provider = strategy.slice("oauth_".length);
    localStorage.setItem("pendingAuthMethod", provider);

    if (!isLoaded || !signUp) return;
    setSocialLoading(strategy);

    /* 
      Preserves the ticket in redirect URL to maintain invitation context.
      This ensures the user returns to the invite page bypassing middleware redirect.
    */
    const redirectUrl = invitationTicket
      ? `${config.routes.invitationAccept}?${new URLSearchParams({
          [CLERK_TICKET_PARAM]: invitationTicket,
        })}`
      : config.routes.invitationAccept;

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete: config.routes.home,
        continueSignUp: true,
      });
    } catch (err) {
      console.error("Social login error", err);
      setSocialLoading(null);
      toast.error("Could not sign in with social provider.");
    }
  };

  if (status === "loading") {
    return <InvitationLoading />;
  }

  if (status === "error") {
    return <InvitationError />;
  }

  return (
    <InvitationForm
      email={email}
      lastUsed={lastUsed}
      isPending={isPending}
      socialLoading={socialLoading}
      onSubmit={onSubmit}
      onSocialClick={handleSocialLogin}
    />
  );
}
