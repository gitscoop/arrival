"use client";

import { useState } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { CardContent } from "@/components/ui/card";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";

import { GateCard } from "@/components/auth/shared/gate-card";
import { BackButton } from "@/components/auth/shared/back-button";
import { FieldErrorToast } from "@/components/auth/shared/helpers";
import { SixDigitOTP } from "@/components/auth/shared/six-digit-otp";
import { SubmitButton } from "@/components/auth/shared/submit-button";

interface TotpStrategyProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isRedirectLoading: boolean;
}

export function TotpStrategy({
  isLoading,
  clearRedirectLoading,
  isRedirectLoading,
}: TotpStrategyProps) {
  const [otpLength, setOtpLength] = useState(0);

  return (
    <SignIn.Strategy name="totp">
      <GateCard
        title="Two-step verification"
        description="Enter the verification code from your authenticator app."
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="code" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel className="sr-only">
                    Authenticator code
                  </FieldLabel>
                </Clerk.Label>

                <FieldContent className="items-center">
                  <SixDigitOTP
                    disabled={isLoading}
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

            <SubmitButton
              isLoading={isLoading}
              isRedirectLoading={isRedirectLoading}
              isDisabled={otpLength < 6}
            >
              Verify
            </SubmitButton>

            <BackButton isLoading={isLoading} />
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Strategy>
  );
}
