"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

import { Icons } from "@/components/icons";
import { CardFooter } from "@/components/ui/card";

interface AuthNavLinkProps {
  href: string;
  children: ReactNode;
  isLoading?: boolean;
}

function AuthNavLink({ href, children, isLoading = false }: AuthNavLinkProps) {
  const { isNavigating, isDisabled, onClick } = useNavigationLatch({
    disabled: isLoading,
  });

  return (
    <Link
      href={href}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1 font-medium text-foreground hover:text-foreground/80",
        { "pointer-events-none opacity-50": isDisabled },
      )}
    >
      {children}

      {isNavigating ? (
        <Icons.spinner aria-hidden="true" className="size-3" />
      ) : (
        <ArrowRightIcon
          aria-hidden="true"
          className="size-3 transition duration-200 group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

export function SignInLink() {
  return (
    <CardFooter className="justify-center">
      <p className="flex gap-1 text-sm text-muted-foreground md:gap-2">
        <span>Already have an account?&nbsp;</span>
        <AuthNavLink href={config.routes.signIn}>Sign in</AuthNavLink>
      </p>
    </CardFooter>
  );
}

interface WaitlistLinkProps {
  isLoading?: boolean;
}

export function WaitlistLink({ isLoading }: WaitlistLinkProps) {
  return (
    <CardFooter className="justify-center pt-2">
      <p className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground md:flex-row md:gap-2">
        <span>Don&apos;t have an account?</span>

        <AuthNavLink href={config.routes.waitlist} isLoading={isLoading}>
          Join waitlist
        </AuthNavLink>
      </p>
    </CardFooter>
  );
}
