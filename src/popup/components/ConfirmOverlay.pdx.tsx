import type { JSX } from "preact";
import { useT } from "../../i18n";

interface ConfirmOverlayProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmOverlayPdx({
  prompt,
  onConfirm,
  onCancel,
}: ConfirmOverlayProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__confirm">
      <span class="pdx-popup__footer-msg">{prompt}</span>
      <button type="button" class="pdx-btn-danger" onClick={onConfirm}>
        {t("confirm_yes")}
      </button>
      <button type="button" class="pdx-btn-ghost" onClick={onCancel}>
        {t("settings_cancel")}
      </button>
    </div>
  );
}
