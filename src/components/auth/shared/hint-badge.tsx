import { Badge } from "@/components/ui/badge";
import type { PropsWithChildren } from "react";

export function HintBadge({ children }: PropsWithChildren) {
  return (
    <Badge
      aria-hidden="true"
      variant="secondary"
      className="absolute -top-2 -right-2 rounded-xs font-mono text-[0.6em] uppercase"
    >
      {children}
    </Badge>
  );
}
