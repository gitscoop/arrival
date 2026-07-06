import type { ReactNode } from "react";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading?: boolean;
  isRedirectLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

export function SubmitButton({
  isLoading,
  isRedirectLoading,
  isDisabled,
  children,
  onClick,
  "aria-label": ariaLabel,
}: SubmitButtonProps) {
  return (
    <SignIn.Action submit asChild>
      <Button
        disabled={isLoading || isDisabled}
        className="relative w-full"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-busy={isLoading || isRedirectLoading || undefined}
      >
        <Clerk.Loading>
          {(isClerkLoading) => {
            const isActive = isClerkLoading || isRedirectLoading;

            return (
              <>
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="visually-hidden"
                >
                  {isActive ? "Loading" : null}
                </span>
                {isActive && <Icons.spinner data-icon="inline-start" />}
                {children}
              </>
            );
          }}
        </Clerk.Loading>
      </Button>
    </SignIn.Action>
  );
}
