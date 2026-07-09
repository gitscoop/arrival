"use client";

import * as SignIn from "@clerk/elements/sign-in";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

import { GateCard } from "@/components/auth/shared/gate-card";
import { BackButton } from "@/components/auth/shared/back-button";
import { OAuthButtons } from "@/components/auth/shared/oauth-buttons";

interface ChooseStrategyStepProps {
  isLoading: boolean;
  lastUsed: string | null;
}

export function ChooseStrategyStep({
  isLoading,
  lastUsed,
}: ChooseStrategyStepProps) {
  return (
    <SignIn.Step name="choose-strategy">
      <GateCard
        title="Use another method"
        description="Facing issues? You can use any of these methods to sign in."
      >
        <CardContent>
          <FieldGroup className="gap-5">
            <div className="flex flex-col gap-5 [&:not(:has([data-strategy-button]))_.separator-conditional]:hidden">
              <SignIn.SupportedStrategy name="email_code" asChild>
                <Button
                  data-strategy-button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  Email code
                </Button>
              </SignIn.SupportedStrategy>

              <SignIn.SupportedStrategy name="password" asChild>
                <Button
                  data-strategy-button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  Password
                </Button>
              </SignIn.SupportedStrategy>

              <SignIn.SupportedStrategy name="phone_code" asChild>
                <Button
                  data-strategy-button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  Phone code
                </Button>
              </SignIn.SupportedStrategy>

              <FieldSeparator className="separator-conditional *:data-[slot=field-separator-content]:bg-background">
                Or continue with
              </FieldSeparator>
            </div>

            <OAuthButtons isLoading={isLoading} lastUsed={lastUsed} />
            <BackButton isLoading={isLoading} />
          </FieldGroup>
        </CardContent>
      </GateCard>
    </SignIn.Step>
  );
}
