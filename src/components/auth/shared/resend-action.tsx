import * as SignIn from "@clerk/elements/sign-in";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";

export function ResendAction() {
  return (
    <FieldDescription className="text-center text-xs md:text-sm">
      <SignIn.Action
        asChild
        resend
        fallback={({ resendableAfter }) => (
          <span className="text-muted-foreground">
            Didn&apos;t receive a code? Resend (
            <span className="tabular-nums">{resendableAfter}</span>)
          </span>
        )}
      >
        <Button type="button" variant="link">
          Didn&apos;t receive a code? Resend
        </Button>
      </SignIn.Action>
    </FieldDescription>
  );
}
