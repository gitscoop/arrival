import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

export function AuthRedirect({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-24",
        className,
      )}
    >
      <Icons.spinner className="size-8 text-muted-foreground" />

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold">Finalizing authentication...</h1>

        <p className="text-sm text-muted-foreground">
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
}
