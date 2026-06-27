"use client";

import { z } from "zod";
import { toast } from "sonner";
import { joinWaitlist } from "@/actions/waitlist";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState, type ComponentProps } from "react";

import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import { Icons } from "@/components/icons";
import { useForm, Controller } from "react-hook-form";

import { waitlistSchema } from "@/lib/schema";
import { useFingerprint } from "@/lib/fingerprint";
import { getInputFeedbackHandlers } from "@/lib/input-feedback";

type FormData = z.infer<typeof waitlistSchema>;
type FormSubmission = NonNullable<ComponentProps<"form">["onSubmit"]>;

const EMAIL_PLACEHOLDER = "copy@paste.dev";

async function triggerSideCannons() {
  /*
    Early return prevents confetti from scheduling rAF work that CSS cannot suppress
  */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const confetti = (await import("canvas-confetti")).default;

  const end = Date.now() + 3 * 1000;
  const style = getComputedStyle(document.documentElement);
  const cssVar = (name: string) => style.getPropertyValue(name).trim();

  const colors = [
    cssVar("--color-confetti-1"),
    cssVar("--color-confetti-2"),
    cssVar("--color-confetti-3"),
    cssVar("--color-confetti-4"),
    cssVar("--color-confetti-5"),
  ].filter(Boolean);

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

export function WaitlistForm() {
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const { visitorId, isLoading: isFingerprintLoading } = useFingerprint();

  const form = useForm<FormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting: isSubmittingForm },
    reset,
  } = form;

  const resetWaitlistForm = useCallback(() => {
    reset(
      { email: "" },
      {
        keepDirty: false,
        keepErrors: false,
        keepIsSubmitted: false,
        keepSubmitCount: false,
        keepTouched: false,
      },
    );
  }, [reset]);

  /*
    Resets the form after success once submission finishes and clears the latch on
    the next microtask so the effect doesn't re-run in the same turn.
  */
  useEffect(() => {
    if (!shouldResetForm || isSubmittingForm) return;

    resetWaitlistForm();
    queueMicrotask(() => setShouldResetForm(false));
  }, [isSubmittingForm, resetWaitlistForm, shouldResetForm]);

  /*
    Moves focus to the email field after invalid state is painted
  */
  const focusEmailField = () => {
    requestAnimationFrame(() => form.setFocus("email"));
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("email", data.email);

    if (visitorId) {
      formData.append("fingerprintId", visitorId);
    }

    const result = await joinWaitlist(
      { success: false, message: "" },
      formData,
    );

    if (result.success) {
      triggerSideCannons();
      toast.success(result.message);
      setShouldResetForm(true);
    } else {
      if (result.reason === "RATE_LIMIT") {
        toast.error(result.message);
      } else if (result.reason === "UNDELIVERABLE") {
        toast.success(result.message);
        setShouldResetForm(true);
      } else if (result.reason === "SERVICE_ERROR") {
        toast.warning(result.message);
      } else {
        form.setError("email", { message: result.message });
        focusEmailField();
      }
    }
  };

  const handleFormSubmit: FormSubmission = (event) => {
    if (!form.getValues("email").trim()) {
      event.preventDefault();
      resetWaitlistForm();
      focusEmailField();
      return;
    }

    void form.handleSubmit(onSubmit, focusEmailField)(event);
  };

  const isDisabled = isSubmittingForm || isFingerprintLoading;

  return (
    <form
      onSubmit={handleFormSubmit}
      className="mx-auto w-full max-w-67.5 md:max-w-sm"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid || undefined}
              className="relative gap-2"
            >
              <FieldLabel htmlFor="email" className="sr-only">
                Email address
              </FieldLabel>

              <InputGroup className="overflow-hidden">
                <InputGroupInput
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={EMAIL_PLACEHOLDER}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? "email-error" : undefined
                  }
                  disabled={isDisabled}
                  className="peer transition-[box-shadow,background-color]"
                  {...getInputFeedbackHandlers<HTMLInputElement>({
                    isInvalid: fieldState.invalid,
                    isBlocked: isSubmittingForm,
                    isEmpty: (value) => !value.trim(),
                    onChange: field.onChange,
                    onBlur: field.onBlur,
                    clearFeedback: () => form.clearErrors("email"),
                    resetFeedback: resetWaitlistForm,
                  })}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-base opacity-0 peer-[:placeholder-shown:not(:focus):not(:disabled)]:opacity-100 md:text-sm"
                >
                  <span className="idle-caret absolute top-1/2 left-3 h-[1.15em] w-px -translate-y-1/2 bg-foreground" />

                  <span
                    className="idle-caret-text"
                    data-text={EMAIL_PLACEHOLDER}
                  >
                    {EMAIL_PLACEHOLDER}
                  </span>
                </div>

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    disabled={isDisabled}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {isSubmittingForm && (
                      <Icons.spinner data-icon="inline-start" />
                    )}
                    Join
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {fieldState.invalid && (
                <FieldError
                  id="email-error"
                  errors={[fieldState.error]}
                  className="absolute top-full left-3 mt-1 text-start text-xs"
                />
              )}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
