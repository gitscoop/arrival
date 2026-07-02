"use client";

import { useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import * as SignIn from "@clerk/elements/sign-in";

export function EditIdentifierButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitionLoading, startTransition] = useTransition();

  return (
    <SignIn.Action navigate="start" asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled || isTransitionLoading}
        className="touch:bg-muted touch:dark:bg-muted/50"
        aria-label="Edit email address"
        onClick={() => {
          if (pathname?.includes("continue")) {
            startTransition(() => router.back());
          }
        }}
      >
        <PencilIcon aria-hidden="true" />
      </Button>
    </SignIn.Action>
  );
}
