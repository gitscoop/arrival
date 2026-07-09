"use client";

import { useTransition } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

import { GateCard } from "@/components/auth/shared/gate-card";
import { BackButton } from "@/components/auth/shared/back-button";
import { OAuthButtons } from "@/components/auth/shared/oauth-buttons";
import { PersistentSafeIdentifier } from "@/components/auth/shared/helpers";
import { EditIdentifierButton } from "@/components/auth/shared/edit-identifier-button";

interface ForgotPasswordStepProps {
  isLoading: boolean;
  lastUsed: string | null;
}

export function ForgotPasswordStep({
  isLoading,
  lastUsed,
}: ForgotPasswordStepProps) {
  const [isTransitionLoading] = useTransition();
  const isFormLoading = isLoading || isTransitionLoading;

  return (
    <SignIn.Step name="forgot-password">
      <GateCard
        title="Forgot password?"
        description={
          <>
            Verify account ownership by sending a code to&nbsp;
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <PersistentSafeIdentifier />
              <EditIdentifierButton disabled={isFormLoading} />
            </span>
          </>
        }
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <SignIn.SupportedStrategy name="reset_password_email_code" asChild>
              <Button disabled={isFormLoading} className="w-full">
                <Clerk.Loading>
                  {(isClerkLoading) => (
                    <>
                      <span
                        aria-live="polite"
                        aria-atomic="true"
                        className="visually-hidden"
                      >
                        {isClerkLoading ? "Loading" : null}
                      </span>

                      {isClerkLoading && (
                        <Icons.spinner data-icon="inline-start" />
                      )}
                    </>
                  )}
                </Clerk.Loading>
                Send reset code
              </Button>
            </SignIn.SupportedStrategy>

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
              Or continue with
            </FieldSeparator>

            <OAuthButtons isLoading={isFormLoading} lastUsed={lastUsed} />
            <BackButton isLoading={isFormLoading}>Back to password</BackButton>
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Step>
  );
}
