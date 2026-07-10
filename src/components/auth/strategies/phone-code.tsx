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
import { FieldErrorToast } from "@/components/auth/shared/helpers";
import { SixDigitOTP } from "@/components/auth/shared/six-digit-otp";
import { ResendAction } from "@/components/auth/shared/resend-action";
import { SubmitButton } from "@/components/auth/shared/submit-button";
import { AlternativeMethods } from "@/components/auth/shared/alternative-methods";

interface PhoneCodeStrategyProps {
  isLoading: boolean;
  clearRedirectLoading: () => void;
  isRedirectLoading: boolean;
}

export function PhoneCodeStrategy({
  isLoading,
  clearRedirectLoading,
  isRedirectLoading,
}: PhoneCodeStrategyProps) {
  const [otpLength, setOtpLength] = useState(0);

  return (
    <SignIn.Strategy name="phone_code">
      <GateCard
        title="Check your phone"
        description="Enter the verification code sent to your phone."
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <Clerk.Field name="code" asChild>
              <Field>
                <Clerk.Label asChild>
                  <FieldLabel className="sr-only">
                    Phone verification code
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

            <ResendAction />

            <SubmitButton
              isLoading={isLoading}
              isRedirectLoading={isRedirectLoading}
              isDisabled={otpLength < 6}
            >
              Continue
            </SubmitButton>

            <AlternativeMethods isLoading={isLoading} />
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Strategy>
  );
}
