"use client";

import { ComponentProps, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

function InputPassword({
  className,
  placeholder = "••••••••••••••",
  ref,
  ...props
}: ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        ref={ref}
        {...props}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
      />

      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={props.disabled}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOffIcon aria-hidden="true" />
          ) : (
            <EyeIcon aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { InputPassword };
