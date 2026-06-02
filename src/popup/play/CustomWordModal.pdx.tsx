import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { useT } from "../../i18n";
import { MAX_CUSTOM_LEN } from "../../shared/word-validation";
import { Icon } from "../components/Icon";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useCustomWordForm } from "./useCustomWordForm";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

export function CustomWordModalPdx({
  open,
  onClose,
  onSubmit,
}: CustomWordModalProps): JSX.Element | null {
  const t = useT();
  const { value, setValue, error, showError, handleSubmit } = useCustomWordForm({ open, onSubmit });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(dialogRef, { active: open, onEscape: onClose, initialFocusRef: inputRef });

  if (!open) return null;

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
