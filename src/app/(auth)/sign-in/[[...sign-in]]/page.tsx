"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState, useCallback, useTransition } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import { AuthRedirect } from "@/components/auth/redirect";
import { TrailingLatchController } from "@/components/auth/shared/helpers";

import { StartStep } from "@/components/auth/steps/start";
import { ResetPasswordStep } from "@/components/auth/steps/reset-password";
import { ForgotPasswordStep } from "@/components/auth/steps/forgot-password";
import { ChooseStrategyStep } from "@/components/auth/steps/choose-strategy";

import { TotpStrategy } from "@/components/auth/strategies/totp";
import { PasswordStrategy } from "@/components/auth/strategies/password";
import { EmailCodeStrategy } from "@/components/auth/strategies/email-code";
import { PhoneCodeStrategy } from "@/components/auth/strategies/phone-code";
import { ResetCodeStrategy } from "@/components/auth/strategies/reset-code";

import { useAuthMethod } from "@/hooks/use-auth-method";
import { useErrorParam } from "@/hooks/use-error-param";

const SSO_ERROR_MESSAGES: Record<string, string> = {
  sso_account_not_found:
    "No account found with this email. Please join the waitlist first or use a different account.",
  sso_oauth_denied: "Authentication stopped. Please try again!",
  default: "Oops, something went wrong. Please try again!",
};

function SignInSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading sign in…</span>

      <Card
        aria-hidden="true"
        className="overflow-hidden border-none bg-transparent shadow-none ring-0"
      >
        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            <Skeleton className="h-9 w-full rounded-md" />

            <div className="relative my-2 h-5">
              <Skeleton className="absolute top-2/5 h-px w-full" />

              <div className="relative mx-auto w-fit bg-background px-2">
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center pt-2">
          <Skeleton className="h-4 w-48 rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const [isTransitionLoading] = useTransition();

  const lastUsed = useAuthMethod();
  useErrorParam(SSO_ERROR_MESSAGES);

  const [isRedirectLoading, setIsRedirectLoading] = useState(false);

  const clearRedirectLoading = useCallback(() => {
    setIsRedirectLoading(false);
  }, []);

  if (!isLoaded) {
    return <SignInSkeleton />;
  }

  return (
    <SignIn.Root>
      <Clerk.Loading>
        {(isGlobalLoading) => (
          <Clerk.Loading scope="provider:github">
            {(isGithubLoading) => (
              <Clerk.Loading scope="provider:google">
                {(isGoogleLoading) => {
                  const isLoading =
                    isGlobalLoading ||
                    isTransitionLoading ||
                    isGithubLoading ||
                    isGoogleLoading ||
                    isRedirectLoading;

                  return (
                    <div className="group/steps">
                      {/* ─────── STEP: START ─────── */}
                      {!isRedirectLoading && (
                        <StartStep
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          lastUsed={lastUsed}
                        />
                      )}

                      {/* ─────── STEP: VERIFICATIONS ─────── */}
                      <SignIn.Step name="verifications">
                        <TrailingLatchController
                          isGlobalLoading={isGlobalLoading}
                          signInStatus={signIn?.status}
                          setLatch={setIsRedirectLoading}
                        />

                        {/* ─────── Strategy: Password ─────── */}
                        <PasswordStrategy
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          isRedirectLoading={isRedirectLoading}
                        />

                        {/* ─────── Strategy: Email Code ─────── */}
                        <EmailCodeStrategy
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          isRedirectLoading={isRedirectLoading}
                        />

                        {/* ─────── Strategy: TOTP (2FA) ─────── */}
                        <TotpStrategy
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          isRedirectLoading={isRedirectLoading}
                        />

                        {/* ─────── Strategy: Phone Code ─────── */}
                        <PhoneCodeStrategy
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          isRedirectLoading={isRedirectLoading}
                        />

                        {/* ─────── Strategy: Reset Password Email Code ─────── */}
                        <ResetCodeStrategy
                          isLoading={isLoading}
                          clearRedirectLoading={clearRedirectLoading}
                          isRedirectLoading={isRedirectLoading}
                        />
                      </SignIn.Step>

                      {/* ─────── STEP: CHOOSE STRATEGY ─────── */}
                      <ChooseStrategyStep
                        isLoading={isLoading}
                        lastUsed={lastUsed}
                      />

                      {/* ─────── STEP: FORGOT PASSWORD ─────── */}
                      <ForgotPasswordStep
                        isLoading={isLoading}
                        lastUsed={lastUsed}
                      />

                      {/* ─────── STEP: RESET PASSWORD ─────── */}
                      <ResetPasswordStep
                        isLoading={isLoading}
                        clearRedirectLoading={clearRedirectLoading}
                        isGlobalLoading={isGlobalLoading}
                        signInStatus={signIn?.status}
                        setLatch={setIsRedirectLoading}
                      />

                      {/*
                        Redirect fallback: always in the DOM so there is never a blank
                        page during the sign-in → redirect window. CSS `:has([data-step])`
                        keeps it hidden while any step card is mounted; it becomes visible
                        the instant the last step unmounts — independently of `isGlobalLoading`.
                      */}
                      <AuthRedirect className="group-has-data-step/steps:hidden" />
                    </div>
                  );
                }}
              </Clerk.Loading>
            )}
          </Clerk.Loading>
        )}
      </Clerk.Loading>
    </SignIn.Root>
  );
}
