"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { config } from "@/lib/config";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";

import { GateCard } from "@/components/auth/shared/gate-card";
import { HintBadge } from "@/components/auth/shared/hint-badge";
import { WaitlistLink } from "@/components/auth/shared/footer-link";
import { OAuthButtons } from "@/components/auth/shared/oauth-buttons";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { AuthLegalDisclaimer } from "@/components/auth/legal-disclaimer";
import { ClerkInputFeedback } from "@/components/auth/shared/clerk-input-feedback";

interface StartStepProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  lastUsed: string | null;
}

export function StartStep({
  isLoading,
  clearRedirectLoading,
  lastUsed,
}: StartStepProps) {
  return (
    <SignIn.Step name="start">
      <GateCard
        title={`Sign in to ${config.app.name}`}
        description="Welcome back! Please sign in to continue."
        iconSlot={<Icons.emblem aria-hidden="true" className="size-10" />}
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="identifier" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel>Email address</FieldLabel>
                </Clerk.Label>

                <FieldContent>
                  <ClerkInputFeedback
                    isLoading={isLoading}
                    isEmpty={(value) => !value.trim()}
                    onGlobalError={clearRedirectLoading}
                  >
                    {(handlers) => (
                      <Input
                        placeholder="copy@paste.dev"
                        inputMode="email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...handlers}
                      />
                    )}
                  </ClerkInputFeedback>
                </FieldContent>
              </Field>
            </Clerk.Field>

            <SubmitButton
              isLoading={isLoading}
              aria-label={
                lastUsed === "email"
                  ? "Authenticate (last used method)"
                  : undefined
              }
              onClick={() => localStorage.setItem("pendingAuthMethod", "email")}
            >
              Authenticate
              {lastUsed === "email" && <HintBadge>Last used</HintBadge>}
            </SubmitButton>

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
              Or continue with
            </FieldSeparator>

            <OAuthButtons isLoading={isLoading} lastUsed={lastUsed} />
            <AuthLegalDisclaimer />
          </FieldGroup>
        </CardContent>

        <WaitlistLink isLoading={isLoading} />
      </GateCard>
    </SignIn.Step>
  );
}
