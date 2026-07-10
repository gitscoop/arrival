"use client";

import { useState, useTransition } from "react";

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

import {
  PersistentSafeIdentifier,
  FieldErrorToast,
} from "@/components/auth/shared/helpers";

import { GateCard } from "@/components/auth/shared/gate-card";
import { BackButton } from "@/components/auth/shared/back-button";
import { SixDigitOTP } from "@/components/auth/shared/six-digit-otp";
import { ResendAction } from "@/components/auth/shared/resend-action";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { ClerkInputFeedback } from "@/components/auth/shared/clerk-input-feedback";
import { EditIdentifierButton } from "@/components/auth/shared/edit-identifier-button";

interface ResetCodeStrategyProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isRedirectLoading: boolean;
}

export function ResetCodeStrategy({
  isLoading,
  clearRedirectLoading,
  isRedirectLoading,
}: ResetCodeStrategyProps) {
  const [isTransitionLoading] = useTransition();
  const [otpLength, setOtpLength] = useState(0);
  const isFormLoading = isLoading || isTransitionLoading;

  return (
    <SignIn.Strategy name="reset_password_email_code">
      <GateCard
        title="Reset password"
        description={
          <>
            Enter the code sent to&nbsp;
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <PersistentSafeIdentifier />
              <EditIdentifierButton disabled={isFormLoading} />
            </span>
            &nbsp;and your new password.
          </>
        }
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="code" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel className="sr-only">Reset code</FieldLabel>
                </Clerk.Label>

                <FieldContent className="items-center">
                  <SixDigitOTP
                    disabled={isFormLoading}
                    onFillCount={setOtpLength}
                  />

                  <Clerk.FieldState>
                    {({ state, message }) =>
                      state === "error" && (
                        <FieldErrorToast
                          message={message}
                          onGlobalError={clearRedirectLoading}
                        />
                      )
                    }
                  </Clerk.FieldState>
                </FieldContent>
              </Field>
            </Clerk.Field>

            <ResendAction />

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
              isDisabled={otpLength < 6}
            >
              Continue
            </SubmitButton>

            <BackButton isLoading={isFormLoading} navigate="start">
              Restart
            </BackButton>
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Strategy>
  );
}
