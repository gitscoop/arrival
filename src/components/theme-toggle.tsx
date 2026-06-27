"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useMounted();
  const [swapKey, setSwapKey] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <span
        className="inline-flex size-6 items-center justify-center"
        aria-hidden
      >
        <span className="size-3 rounded-sm bg-muted-foreground/20" />
      </span>
    );
  }

  return (
    <Button
      key={swapKey}
      variant="ghost"
      size="icon-xs"
      onClick={() => {
        setSwapKey((k) => k + 1);
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
      aria-label="Toggle theme"
      className={cn(
        "text-muted-foreground hover:bg-transparent dark:hover:bg-transparent",
        swapKey > 0 && "animate-icon-in",
        className,
      )}
    >
      {resolvedTheme === "dark" ? (
        <SunIcon aria-hidden="true" />
      ) : (
        <MoonIcon aria-hidden="true" />
      )}
    </Button>
  );
}
