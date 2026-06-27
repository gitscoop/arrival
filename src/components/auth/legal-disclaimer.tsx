import Link from "next/link";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

const { terms, privacy } = config.routes;

export function AuthLegalDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "px-2 text-center text-sm text-balance text-muted-foreground",
        className,
      )}
    >
      By continuing, you agree to the&nbsp;
      <Link
        href={terms}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-primary"
      >
        Terms of Service
        <span className="visually-hidden">&nbsp;(opens in new tab)</span>
      </Link>
      &nbsp;and&nbsp;
      <Link
        href={privacy}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-primary"
      >
        Privacy Policy
        <span className="visually-hidden">&nbsp;(opens in new tab)</span>
      </Link>
      .
    </p>
  );
}
