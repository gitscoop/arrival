"use client";

import { useSignIn } from "@clerk/nextjs";
import { useEffect, useState, useTransition } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { CardContent } from "@/components/ui/card";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";

import {
  PersistentSafeIdentifier,
  FieldErrorToast,
} from "@/components/auth/shared/helpers";

import { GateCard } from "@/components/auth/shared/gate-card";
import { SixDigitOTP } from "@/components/auth/shared/six-digit-otp";
import { ResendAction } from "@/components/auth/shared/resend-action";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { AlternativeMethods } from "@/components/auth/shared/alternative-methods";
import { EditIdentifierButton } from "@/components/auth/shared/edit-identifier-button";

interface EmailCodeStrategyProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isRedirectLoading: boolean;
}

const preparedSignInIds = new Set<string>();

export function EmailCodeStrategy({
  isLoading,
  clearRedirectLoading,
  isRedirectLoading,
}: EmailCodeStrategyProps) {
  const { signIn } = useSignIn();
  const [isTransitionLoading] = useTransition();
  const [otpLength, setOtpLength] = useState(0);

  const isFormLoading = isLoading || isTransitionLoading;

  /*
    Clerk Elements auto-prepares first-factor email_code but not second-factor
    when status is `needs_second_factor`. `prepareSecondFactor` runs once on mount
    so the OTP email fires and the webhook → Resend pipeline runs.

    Double-send is prevented by `preparedSignInIds` (effect re-runs / Strict Mode)
    and by skipping when `secondFactorVerification.status` is already set.
  */
  useEffect(() => {
    if (!signIn?.id || signIn.status !== "needs_second_factor") return;

    if (preparedSignInIds.has(signIn.id)) return;
    if (signIn.secondFactorVerification?.status) return;

    const factor = signIn.supportedSecondFactors?.find(
      (f) => f.strategy === "email_code",
    );

    if (!factor || !("emailAddressId" in factor)) return;
    preparedSignInIds.add(signIn.id);

    signIn
      .prepareSecondFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      })
      .catch((err) => {
        console.error("Failed to prepare second factor email_code:", err);
      });
  }, [signIn]);

  return (
    <SignIn.Strategy name="email_code">
      <GateCard
        title="Check your email"
        description={
          <>
            Enter the verification code sent to&nbsp;
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <PersistentSafeIdentifier resolveEmailCodeTarget />
              <EditIdentifierButton disabled={isFormLoading} />
            </span>
          </>
        }
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="code" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel className="sr-only">Verification code</FieldLabel>
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

            <SubmitButton
              isLoading={isFormLoading}
              isRedirectLoading={isRedirectLoading}
              isDisabled={otpLength < 6}
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
