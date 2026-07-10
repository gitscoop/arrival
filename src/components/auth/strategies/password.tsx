"use client";

import { useTransition } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { InputPassword } from "@/components/ui/input-password";

import { GateCard } from "@/components/auth/shared/gate-card";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { PersistentSafeIdentifier } from "@/components/auth/shared/helpers";
import { AlternativeMethods } from "@/components/auth/shared/alternative-methods";
import { ClerkInputFeedback } from "@/components/auth/shared/clerk-input-feedback";
import { EditIdentifierButton } from "@/components/auth/shared/edit-identifier-button";

interface PasswordStrategyProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isRedirectLoading: boolean;
}

export function PasswordStrategy({
  isLoading,
  clearRedirectLoading,
  isRedirectLoading,
}: PasswordStrategyProps) {
  const [isTransitionLoading] = useTransition();
  const isFormLoading = isLoading || isTransitionLoading;

  return (
    <SignIn.Strategy name="password">
      <GateCard
        title="Verify your identity"
        description={
          <>
            Enter the password for&nbsp;
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <PersistentSafeIdentifier />
              <EditIdentifierButton disabled={isFormLoading} />
            </span>
          </>
        }
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="password" asChild>
              <Field>
                <div className="flex items-center justify-between">
                  <Clerk.Label asChild>
                    <FieldLabel>Password</FieldLabel>
                  </Clerk.Label>

                  <SignIn.Action navigate="forgot-password" asChild>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      disabled={isFormLoading}
                    >
                      Forgot password?
                    </Button>
                  </SignIn.Action>
                </div>

                <FieldContent>
                  <ClerkInputFeedback
                    inputProps={{
                      required: true,
                      autoComplete: "current-password",
                    }}
                    isLoading={isFormLoading}
                    onGlobalError={clearRedirectLoading}
                  >
                    {(handlers) => (
                      <InputPassword disabled={isFormLoading} {...handlers} />
                    )}
                  </ClerkInputFeedback>
                </FieldContent>
              </Field>
            </Clerk.Field>

            <SubmitButton
              isLoading={isFormLoading}
              isRedirectLoading={isRedirectLoading}
            >
              Continue
            </SubmitButton>

            <AlternativeMethods isLoading={isFormLoading} />
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Strategy>
  );
}
