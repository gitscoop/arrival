"use client";

import type { ComponentProps } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP } from "@/components/ui/input-otp";

export function ClerkInputOTP({
  onChange,
  onFillCount,
  ref,
  ...props
}: ComponentProps<typeof InputOTP> & {
  onChange?: (e: { target: { value: string } }) => void;
  onFillCount?: (count: number) => void;
}) {
  return (
    <InputOTP
      ref={ref}
      pattern={REGEXP_ONLY_DIGITS}
      onChange={(val) => {
        onChange?.({ target: { value: val } });
        onFillCount?.(val.length);
      }}
      {...props}
    />
  );
}
