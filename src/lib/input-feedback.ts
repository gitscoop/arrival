import type { ChangeEvent, FocusEvent } from "react";

export type InputFeedbackOptions<Element extends HTMLInputElement> = {
  isInvalid: boolean;
  isBlocked?: boolean;
  isEmpty: (value: string) => boolean;
  onChange: (event: ChangeEvent<Element>) => void;
  onBlur: (event: FocusEvent<Element>) => void;
  clearFeedback: () => void;
  resetFeedback: () => void;
};

export type InputFeedbackHandlers<Element extends HTMLInputElement> = {
  onChange: (event: ChangeEvent<Element>) => void;
  onBlur: (event: FocusEvent<Element>) => void;
};

export function getInputFeedbackHandlers<Element extends HTMLInputElement>({
  isInvalid,
  isBlocked = false,
  isEmpty,
  onChange,
  onBlur,
  clearFeedback,
  resetFeedback,
}: InputFeedbackOptions<Element>): InputFeedbackHandlers<Element> {
  return {
    onChange: (event: ChangeEvent<Element>) => {
      if (isEmpty(event.currentTarget.value)) {
        resetFeedback();
        return;
      }

      onChange(event);
    },
    onBlur: (event: FocusEvent<Element>) => {
      onBlur(event);
      if (!isInvalid || isBlocked) return;

      if (isEmpty(event.currentTarget.value)) {
        resetFeedback();
      } else {
        clearFeedback();
      }
    },
  };
}
