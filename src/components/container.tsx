import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface ContainerProps {
  className?: string;
}

export function Container({
  className,
  children,
}: PropsWithChildren<ContainerProps>) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-20", className)}>
      {children}
    </div>
  );
}
