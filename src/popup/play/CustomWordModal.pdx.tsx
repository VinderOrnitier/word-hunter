import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useT } from "../../i18n";
import { MAX_CUSTOM_LEN, validateCustomWord } from "../../shared/word-validation";
import { Icon } from "../components/Icon";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CustomWordModalPdx({
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

  function handleSubmit(): void {
    if (!trimmed || error) {
      setSubmitAttempted(true);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <>
      <button
        type="button"
        class="pdx-modal-backdrop"
        onClick={onClose}
        aria-label={t("custom_word_backdrop_aria")}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        class="pdx-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("custom_word_dialog_aria")}
        ref={dialogRef}
      >
        <div class="pdx-modal__header">
          <span class="pdx-modal__title">{t("custom_word_heading")}</span>
          <button
            type="button"
            class="pdx-modal__close"
            aria-label={t("custom_word_close_aria")}
            title={t("custom_word_close_title")}
            onClick={onClose}
          >
            <Icon name="x" size={11} />
          </button>
        </div>

        <div class="pdx-modal__lcd">
          <div class="pdx-modal__lcd-inner">
            <span class="pdx-modal__prompt">{t("pdx_custom_word_prompt")}</span>
            <div class="pdx-modal__input-wrap">
              <input
                ref={inputRef}
                class="pdx-modal__input"
                type="text"
                value={value}
                maxLength={MAX_CUSTOM_LEN}
                placeholder={t("custom_word_placeholder")}
                onInput={(e) => setValue((e.target as HTMLInputElement).value)}
              />
            </div>
            {showError ? (
              <span class="pdx-modal__error">{error}</span>
            ) : (
              <span class="pdx-modal__helper">{t("pdx_custom_word_helper")}</span>
            )}
          </div>
        </div>

        <div class="pdx-modal__footer">
          <button type="button" class="pdx-modal__btn-ghost" onClick={onClose}>
            {t("custom_word_cancel")}
          </button>
          <button type="button" class="pdx-modal__btn-primary" onClick={handleSubmit}>
            {t("pdx_custom_word_submit")}
          </button>
        </div>
      </div>
    </>
  );
}
