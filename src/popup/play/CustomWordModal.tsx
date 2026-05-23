import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useT } from "../../i18n";
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
  const t = useT();
  const [value, setValue] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setSubmitAttempted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 0);

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
      clearTimeout(timer);
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
        aria-label={t("custom_word_backdrop_aria")}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        class="wh-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("custom_word_dialog_aria")}
        ref={dialogRef}
      >
        <div class="wh-modal__header">
          <div class="wh-modal__title">
            <span class="wh-modal__heading">{t("custom_word_heading")}</span>
          </div>
          <button
            type="button"
            class="wh-modal__close"
            aria-label={t("custom_word_close_aria")}
            title={t("custom_word_close_title")}
            onClick={onClose}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <Field
          label={t("custom_word_field_label")}
          htmlFor="custom-word-input"
          error={showError ? error : undefined}
          counter={counter}
          helper={" "}
        >
          <Input
            id="custom-word-input"
            value={value}
            onInput={setValue}
            placeholder={t("custom_word_placeholder")}
            mono
            error={showError}
            inputRef={inputRef}
          />
        </Field>

        <div class="wh-modal__footer">
          <Button variant="ghost" onClick={onClose}>
            {t("custom_word_cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t("custom_word_submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
