"use client";

import type { PropsWithChildren } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CopyableEmail({ email }: { email: string }) {
  const [swapKey, setSwapKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
    Clears pending `copied` state timeout on unmount
  */
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function handleCopy() {
    void navigator.clipboard.writeText(email);

    if (!copied) {
      setCopied(true);
      setSwapKey((k) => k + 1);
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      setSwapKey((k) => k + 1);
      resetTimerRef.current = null;
    }, 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : "Copy email address"}
        className="group inline-flex cursor-pointer items-center rounded-sm bg-muted/70 px-1.5 py-0.5 whitespace-nowrap transition-colors duration-100 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        <span className="font-mono text-[0.9em] text-foreground">{email}</span>

        <span key={swapKey} className="ml-1.5 animate-icon-in">
          {copied ? (
            <CheckIcon aria-hidden="true" className="size-3 text-primary" />
          ) : (
            <CopyIcon
              aria-hidden="true"
              className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground touch:text-muted-foreground"
            />
          )}
        </span>
      </button>

      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        {copied ? "Email address copied to clipboard" : null}
      </span>
    </>
  );
}

export function ShortSummary({ children }: PropsWithChildren) {
  return (
    <div className="mb-4 text-sm text-muted-foreground/80 italic [&>p]:inline">
      In short: {children}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, i) => (
            <TableHead key={i} scope="col">
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
