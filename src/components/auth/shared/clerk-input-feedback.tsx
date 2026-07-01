"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import * as Clerk from "@clerk/elements/common";
import { FieldErrorToast } from "@/components/auth/shared/helpers";

import {
  getInputFeedbackHandlers,
  type InputFeedbackHandlers,
} from "@/lib/input-feedback";

type ClerkInputProps = Omit<
  ComponentProps<typeof Clerk.Input>,
  "asChild" | "children"
>;

type ClerkInputVisualProps = ClerkInputProps & {
  "data-state"?: "idle";
};

type ClerkInputFeedbackHandlers = InputFeedbackHandlers<HTMLInputElement> & {
  ref: (node: HTMLInputElement | null) => void;
};

type ClerkInputFeedbackProps = {
  inputProps?: ClerkInputProps;
  isLoading: boolean;
  isEmpty?: (value: string) => boolean;
  onGlobalError: () => void;
  children: (handlers: ClerkInputFeedbackHandlers) => ReactNode;
};

type ClerkInputFeedbackContentProps = Omit<
  ClerkInputFeedbackProps,
  "inputProps"
> & {
  inputProps: ClerkInputProps;
  isInvalid: boolean;
  message: string | undefined;
};

const isBlankPassword = (value: string) => value.length === 0;

export function ClerkInputFeedback({
  inputProps = {},
  isLoading,
  isEmpty = isBlankPassword,
  onGlobalError,
  children,
}: ClerkInputFeedbackProps) {
  return (
    <Clerk.FieldState>
      {({ state, message }) => (
        <ClerkInputFeedbackContent
          inputProps={inputProps}
          isInvalid={state === "error"}
          isLoading={isLoading}
          isEmpty={isEmpty}
          message={message}
          onGlobalError={onGlobalError}
        >
          {children}
        </ClerkInputFeedbackContent>
      )}
    </Clerk.FieldState>
  );
}

function ClerkInputFeedbackContent({
  inputProps,
  isInvalid,
  isLoading,
  isEmpty = isBlankPassword,
  message,
  onGlobalError,
  children,
}: ClerkInputFeedbackContentProps) {
  const wasLoadingRef = useRef(isLoading);
  const lastFocusedKeyRef = useRef<string | null>(null);

  // tied to the current error message so a new one still shows during editing
  const feedbackKey = isInvalid ? (message ?? "__clerk_field_error__") : null;

  const [hiddenFeedbackKey, setHiddenFeedbackKey] = useState<string | null>(
    null,
  );

  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null,
  );

  const [toastDedupeKey, setToastDedupeKey] = useState(0);

  /*
    After submit, restores error styling and toast if editing had suppressed them.
  */
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && hiddenFeedbackKey) {
      setHiddenFeedbackKey(null);
      setToastDedupeKey((key) => key + 1);
    }

    wasLoadingRef.current = isLoading;
  }, [hiddenFeedbackKey, isLoading]);

  const handlers = useMemo(
    () =>
      ({
        ...getInputFeedbackHandlers<HTMLInputElement>({
          isInvalid,
          isBlocked: isLoading,
          isEmpty,
          onChange: () => undefined,
          onBlur: () => undefined,
          clearFeedback: () => {
            setHiddenFeedbackKey(feedbackKey);
          },
          resetFeedback: () => {
            setHiddenFeedbackKey(feedbackKey);
          },
        }),
        ref: setInputElement,
      }) satisfies ClerkInputFeedbackHandlers,
    [feedbackKey, isEmpty, isInvalid, isLoading],
  );

  const isFeedbackSuppressed =
    feedbackKey !== null && hiddenFeedbackKey === feedbackKey;

  /*
    Shows idle styling in the UI while Clerk still holds the validation error
  */
  const visibleInputProps: ClerkInputVisualProps = isFeedbackSuppressed
    ? ({
        ...inputProps,
        "aria-invalid": false,
        "data-state": "idle",
      } satisfies ClerkInputVisualProps)
    : inputProps;

  /*
    Same error on resubmit needs a new key to re-trigger focus
  */
  const visibleFeedbackKey =
    !isLoading && !isFeedbackSuppressed && feedbackKey
      ? `${toastDedupeKey}:${feedbackKey}`
      : null;

  /*
    When an error shows up, moves focus back to the input once.
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

  return (
    <>
      <Clerk.Input {...visibleInputProps} asChild>
        {children(handlers)}
      </Clerk.Input>

      {isInvalid && (
        <FieldErrorToast
          message={message}
          onGlobalError={onGlobalError}
          isSuppressed={isFeedbackSuppressed}
          dedupeKey={toastDedupeKey}
        />
      )}
    </>
  );
}
