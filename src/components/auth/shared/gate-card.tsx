import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GateCardProps {
  title: string;
  description: ReactNode;
  iconSlot?: ReactNode;
  iconClassName?: string;
  children: ReactNode;
}

export function GateCard({
  title,
  description,
  iconSlot,
  iconClassName,
  children,
}: GateCardProps) {
  return (
    <Card data-step className="border-none bg-transparent shadow-none ring-0">
      <CardHeader
        className={cn(
          "flex flex-col items-center text-center",
          iconSlot ? "gap-5 pb-5" : "gap-2 pb-6",
        )}
      >
        {iconSlot ? (
          <>
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                iconClassName,
              )}
            >
              {iconSlot}
            </div>

            <CardTitle role="heading" aria-level={1}>
              {title}
            </CardTitle>

            {description && (
              <CardDescription className="text-balance">
                {description}
              </CardDescription>
            )}
          </>
        ) : (
          <>
            <CardTitle role="heading" aria-level={1}>
              {title}
            </CardTitle>

            {description && (
              <CardDescription className="text-balance">
                {description}
              </CardDescription>
            )}
          </>
        )}
      </CardHeader>

      {children}
    </Card>
  );
}
