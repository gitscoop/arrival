import * as Clerk from "@clerk/elements/common";

import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ClerkInputOTP } from "@/components/auth/shared/clerk-input-otp";

export function SixDigitOTP({
  disabled,
  onFillCount,
}: {
  disabled?: boolean;
  onFillCount?: (count: number) => void;
}) {
  return (
    <Clerk.Input type="text" asChild>
      <ClerkInputOTP
        maxLength={6}
        disabled={disabled}
        containerClassName="gap-3"
        onFillCount={onFillCount}
      >
        <InputOTPGroup className="gap-2.5">
          {[0, 1, 2].map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-12 w-9 md:h-14 md:w-11"
            />
          ))}
        </InputOTPGroup>

        <div aria-hidden="true" className="flex items-center">
          <div className="size-1 rounded-full bg-muted-foreground/50" />
        </div>

        <InputOTPGroup className="gap-2.5">
          {[3, 4, 5].map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-12 w-9 md:h-14 md:w-11"
            />
          ))}
        </InputOTPGroup>
      </ClerkInputOTP>
    </Clerk.Input>
  );
}
