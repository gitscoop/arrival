"use client";

import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { getInputFeedbackHandlers } from "@/lib/input-feedback";

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldSeparator,
  FieldGroup,
} from "@/components/ui/field";

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { InputPassword } from "@/components/ui/input-password";

import { GateCard } from "@/components/auth/shared/gate-card";
import { HintBadge } from "@/components/auth/shared/hint-badge";
import { FieldErrorToast } from "@/components/auth/shared/helpers";
import { ClerkCaptcha } from "@/components/auth/shared/clerk-captcha";
import { OAuthButtons } from "@/components/auth/shared/oauth-buttons";
import { AuthLegalDisclaimer } from "@/components/auth/legal-disclaimer";

const formSchema = z.object({
  password: z.string().nonempty(),
});

export type InvitationFormData = z.infer<typeof formSchema>;

interface InvitationFormProps {
  email: string;
  lastUsed: string | null;
  isPending: boolean;
  socialLoading: string | null;
  onSubmit: (data: InvitationFormData) => Promise<string | void>;
  onSocialClick: (strategy: "oauth_github" | "oauth_google") => Promise<void>;
}

export function InvitationForm({
  email,
  lastUsed,
  isPending,
  socialLoading,
  onSubmit,
  onSocialClick,
}: InvitationFormProps) {
  const form = useForm<InvitationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const isSubmittingOrPending =
    form.formState.isSubmitting || isPending || !!socialLoading;

  const isInvalid = !!form.formState.errors.password;
  const errorMessage = form.formState.errors.password?.message;

  /*
    Mirrors the feedback visibility pattern from `ClerkInputFeedbackContent`,
    adapted for RHF: `feedbackKey` is null when no error, so `visibleFeedbackKey`
    is null while submitting (input is disabled) to avoid focusing a locked field.
  */
  const lastFocusedKeyRef = useRef<string | null>(null);
  const feedbackKey = isInvalid ? (errorMessage ?? "__field_error__") : null;
  const visibleFeedbackKey = !isSubmittingOrPending ? feedbackKey : null;

  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null,
  );

  /*
    Resets the focus-deduplication guard whenever the error clears so the
    same error message can trigger focus again on a subsequent submit.
  */
  useEffect(() => {
    if (!feedbackKey) {
      lastFocusedKeyRef.current = null;
    }
  }, [feedbackKey]);

  /*
    Focuses the password input after the invalid state is painted, guarded by
    `lastFocusedKeyRef` so the same visible error never steals focus twice.
  */
  useEffect(() => {
    if (
      !visibleFeedbackKey ||
      !inputElement ||
      lastFocusedKeyRef.current === visibleFeedbackKey
    ) {
      return;
    }

    lastFocusedKeyRef.current = visibleFeedbackKey;
    const frame = requestAnimationFrame(() => inputElement.focus());
    return () => cancelAnimationFrame(frame);
  }, [inputElement, visibleFeedbackKey]);

  /*
    Surfaces Clerk API password errors back into RHF so `fieldState.invalid`
    drives ring styling, aria-invalid, and focus — same as local validation.
  */
  const handlePasswordSubmit = async (data: InvitationFormData) => {
    const passwordError = await onSubmit(data);

    if (typeof passwordError === "string") {
      form.setError("password", { type: "clerk", message: passwordError });
    }
  };

  return (
    <div className="flex flex-col">
      <GateCard
        title="Accept your invitation"
        description="You're almost there! Set a password to secure your account and jump right in."
        iconSlot={<Icons.emblem aria-hidden="true" className="size-10" />}
      >
        <CardContent>
          <form onSubmit={form.handleSubmit(handlePasswordSubmit)}>
            <FieldGroup className="gap-5">
              <Field data-disabled>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>

                <FieldContent>
                  <Input
                    id="invite-email"
                    value={email}
                    className="opacity-100"
                    disabled
                  />
                </FieldContent>
              </Field>

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <Field data-disabled={isSubmittingOrPending || undefined}>
                      <FieldLabel htmlFor="invite-password">
                        Password
                      </FieldLabel>

                      <FieldContent>
                        <InputPassword
                          {...field}
                          ref={(node) => {
                            field.ref(node);
                            setInputElement(node);
                          }}
                          id="invite-password"
                          autoComplete="new-password"
                          disabled={isSubmittingOrPending}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.invalid
                              ? "invite-password-error"
                              : undefined
                          }
                          {...getInputFeedbackHandlers<HTMLInputElement>({
                            isInvalid: fieldState.invalid,
                            isBlocked: isSubmittingOrPending,
                            isEmpty: (value) => value.length === 0,
                            onChange: field.onChange,
                            onBlur: field.onBlur,
                            clearFeedback: () => form.clearErrors("password"),
                            resetFeedback: () => form.resetField("password"),
                          })}
                        />

                        {fieldState.invalid && (
                          <span id="invite-password-error" className="sr-only">
                            {fieldState.error?.message}
                          </span>
                        )}
                      </FieldContent>
                    </Field>

                    {fieldState.invalid && (
                      <FieldErrorToast message={fieldState.error?.message} />
                    )}
                  </>
                )}
              />

              <Button
                type="submit"
                className="relative w-full"
                disabled={isSubmittingOrPending}
                aria-label={
                  lastUsed === "email"
                    ? "Get started (last used method)"
                    : undefined
                }
              >
                {(form.formState.isSubmitting || isPending) && (
                  <Icons.spinner data-icon="inline-start" />
                )}
                Get started
                {lastUsed === "email" && <HintBadge>Last used</HintBadge>}
              </Button>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-background">
                Or continue with
              </FieldSeparator>

              <OAuthButtons
                isLoading={isSubmittingOrPending}
                lastUsed={lastUsed}
                onProviderClick={onSocialClick}
                socialLoading={socialLoading}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </GateCard>

      <AuthLegalDisclaimer />
      <ClerkCaptcha className="mt-5" />
    </div>
  );
}
