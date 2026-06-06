"use client";

import Link from "next/link";
import { LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

import { CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { GateCard } from "@/components/auth/shared/gate-card";
import { SignInLink } from "@/components/auth/shared/footer-link";

import { useNavigationLatch } from "@/hooks/use-navigation-latch";

export default function SignUpPage() {
  const { isDisabled, onClick } = useNavigationLatch();

  return (
    <GateCard
      title="Invite Only"
      description="Sign-ups are currently locked. Grab a spot on the waitlist to get notified when early access opens up."
      iconSlot={<LockIcon aria-hidden="true" className="size-6 text-primary" />}
      iconClassName="bg-primary/10"
    >
      <CardContent>
        <Link
          href={config.routes.waitlist}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : undefined}
          onClick={onClick}
          className={cn(buttonVariants({ className: "w-full" }), {
            "pointer-events-none opacity-50": isDisabled,
          })}
        >
          Join the waitlist
        </Link>
      </CardContent>

      <SignInLink />
    </GateCard>
  );
}
