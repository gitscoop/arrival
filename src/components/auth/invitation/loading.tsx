import { Icons } from "@/components/icons";
import { ClerkCaptcha } from "@/components/auth/shared/clerk-captcha";

export function InvitationLoading() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-6"
    >
      <Icons.spinner className="size-8 text-muted-foreground" />

      <p className="text-base text-muted-foreground">
        Verifying your invite...
      </p>

      <ClerkCaptcha />
    </div>
  );
}
