import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { useT } from "../../i18n";
import { MAX_CUSTOM_LEN } from "../../shared/word-validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useCustomWordForm } from "./useCustomWordForm";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

export function CustomWordModal({
  open,
  onClose,
  onSubmit,
}: CustomWordModalProps): JSX.Element | null {
  const t = useT();
  const { value, setValue, trimmed, error, showError, handleSubmit } = useCustomWordForm({
    open,
    onSubmit,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(dialogRef, { active: open, onEscape: onClose, initialFocusRef: inputRef });

  if (!open) return null;

  const counter = `${trimmed.length} / ${MAX_CUSTOM_LEN}`;

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
