"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";

import { CardContent } from "@/components/ui/card";
import { InputPassword } from "@/components/ui/input-password";

import { useTrailingLatch } from "@/hooks/use-trailing-latch";

import { GateCard } from "@/components/auth/shared/gate-card";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { TrailingLatchController } from "@/components/auth/shared/helpers";
import { ClerkInputFeedback } from "@/components/auth/shared/clerk-input-feedback";

interface ResetPasswordStepProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isGlobalLoading: boolean;
  signInStatus: string | null | undefined;
  setLatch: (val: boolean) => void;
}

export function ResetPasswordStep({
  isLoading,
  clearRedirectLoading,
  isGlobalLoading,
  signInStatus,
  setLatch,
}: ResetPasswordStepProps) {
  const { isLatch: isRedirectLoading } = useTrailingLatch({
    isGlobalLoading,
    signInStatus,
  });

  return (
    <SignIn.Step name="reset-password">
      <TrailingLatchController
        isGlobalLoading={isGlobalLoading}
        signInStatus={signInStatus}
        setLatch={setLatch}
      />

      <GateCard
        title="Set new password"
        description="Enter a new password for your account."
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="password" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel>New password</FieldLabel>
                </Clerk.Label>

                <FieldContent>
                  <ClerkInputFeedback
                    inputProps={{
                      required: true,
                      autoComplete: "new-password",
                    }}
                    isLoading={isLoading}
                    onGlobalError={clearRedirectLoading}
                  >
                    {(handlers) => (
                      <InputPassword disabled={isLoading} {...handlers} />
                    )}
                  </ClerkInputFeedback>
                </FieldContent>
              </Field>
            </Clerk.Field>

            <Clerk.Field name="confirmPassword" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel>Confirm password</FieldLabel>
                </Clerk.Label>

                <FieldContent>
                  <ClerkInputFeedback
                    inputProps={{
                      required: true,
                      autoComplete: "new-password",
                    }}
                    isLoading={isLoading}
                    onGlobalError={clearRedirectLoading}
                  >
                    {(handlers) => (
                      <InputPassword disabled={isLoading} {...handlers} />
                    )}
                  </ClerkInputFeedback>
                </FieldContent>
              </Field>
            </Clerk.Field>

            <SubmitButton
              isLoading={isLoading}
              isRedirectLoading={isRedirectLoading}
            >
              Reset password
            </SubmitButton>
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Step>
  );
}
