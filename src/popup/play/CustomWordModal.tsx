import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { MAX_CUSTOM_LEN, validateCustomWord } from "../../shared/word-validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CustomWordModal({
  open,
  onClose,
  onSubmit,
}: CustomWordModalProps): JSX.Element | null {
  const [value, setValue] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Reset local state whenever the modal opens.
  useEffect(() => {
    if (open) {
      setValue("");
      setSubmitAttempted(false);
    }
  }, [open]);

  // Focus the input on open, and trap Tab navigation inside the dialog.
  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => inputRef.current?.focus(), 0);

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = value.trim();
  const error = validateCustomWord(trimmed);
  const showError = submitAttempted && error !== undefined && trimmed.length > 0;
  const counter = `${trimmed.length} / ${MAX_CUSTOM_LEN}`;

  function handleSubmit(): void {
    if (!trimmed || error) {
      setSubmitAttempted(true);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div class="wh-modal__backdrop">
      <button
        type="button"
        class="wh-modal__backdrop-dismiss"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-label="Close dialog"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        class="wh-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Custom word"
        ref={dialogRef}
      >
        <div class="wh-modal__header">
          <div class="wh-modal__title">
            <span class="wh-modal__heading">Custom word</span>
          </div>
          <button
            type="button"
            class="wh-modal__close"
            aria-label="Close"
            title="Close"
            onClick={onClose}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <Field
          label="Word"
          htmlFor="custom-word-input"
          error={showError ? error : undefined}
          counter={counter}
          helper={" "}
        >
          <Input
            id="custom-word-input"
            value={value}
            onInput={setValue}
            placeholder="serendipity"
            mono
            error={showError}
            inputRef={inputRef}
          />
        </Field>

        <div class="wh-modal__footer">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Start hunt
          </Button>
        </div>
      </div>
    </div>
  );
}
