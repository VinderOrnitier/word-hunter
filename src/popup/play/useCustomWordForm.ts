import { useEffect, useState } from "preact/hooks";
import { validateCustomWord } from "../../shared/word-validation";

export interface UseCustomWordFormOptions {
  /** Whether the modal is open; reopening resets the field. */
  open: boolean;
  /** Called with the trimmed word once it passes validation. */
  onSubmit: (word: string) => void;
}

export interface UseCustomWordFormResult {
  value: string;
  setValue: (value: string) => void;
  /** The value with surrounding whitespace removed. */
  trimmed: string;
  /** Validation message for the current value, or undefined when valid/empty. */
  error: string | undefined;
  /** True only once a submit has been attempted on invalid, non-empty input. */
  showError: boolean;
  /** Validate and, if valid, call onSubmit; otherwise surface the error. */
  handleSubmit: () => void;
}

/**
 * Owns the custom-word field's state and validation so both theme skins of the
 * modal share one behaviour and differ only in markup.
 */
export function useCustomWordForm({
  open,
  onSubmit,
}: UseCustomWordFormOptions): UseCustomWordFormResult {
  const [value, setValue] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setValue("");
      setSubmitAttempted(false);
    }
  }, [open]);

  const trimmed = value.trim();
  const error = validateCustomWord(trimmed);
  const showError = submitAttempted && error !== undefined && trimmed.length > 0;

  function handleSubmit(): void {
    if (!trimmed || error) {
      setSubmitAttempted(true);
      return;
    }
    onSubmit(trimmed);
  }

  return { value, setValue, trimmed, error, showError, handleSubmit };
}
