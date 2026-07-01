"use client";

import { useTransition } from "react";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import * as SignIn from "@clerk/elements/sign-in";

export type BackButtonNavigate = "previous" | "start";

interface BackButtonProps {
  isLoading: boolean;
  children?: ReactNode;
  navigate?: BackButtonNavigate;
}

export function BackButton({
  isLoading,
  children = "Go back",
  navigate = "previous",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitionLoading, startTransition] = useTransition();

  return (
    <SignIn.Action navigate={navigate} asChild>
      <Button
        variant="ghost"
        type="button"
        disabled={isLoading || isTransitionLoading}
        className="w-full"
        onClick={
          navigate === "start"
            ? () => {
                if (pathname?.includes("continue")) {
                  startTransition(() => router.back());
                }
              }
            : undefined
        }
      >
        <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
        {children}
      </Button>
    </SignIn.Action>
  );
}
