"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { AlertCircleIcon } from "lucide-react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";

import { CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { GateCard } from "@/components/auth/shared/gate-card";

export function InvitationError() {
  const { isDisabled, onClick } = useNavigationLatch();

  return (
    <GateCard
      title="Invalid Invite"
      description="This invitation link is invalid or has expired. You can still get access by joining the waitlist."
      iconSlot={
        <AlertCircleIcon
          aria-hidden="true"
          className="size-6 text-destructive"
        />
      }
      iconClassName="bg-destructive/10"
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
          Claim your spot
        </Link>
      </CardContent>
    </GateCard>
  );
}
