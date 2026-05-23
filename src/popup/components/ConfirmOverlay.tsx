import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Button } from "./Button";

interface ConfirmOverlayProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmOverlay({ prompt, onConfirm, onCancel }: ConfirmOverlayProps): JSX.Element {
  const t = useT();
  return (
    <div class="wh-confirm-overlay">
      <span class="wh-confirm-overlay__prompt">{prompt}</span>
      <Button variant="danger" size="sm" onClick={onConfirm}>
        {t("confirm_yes")}
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        {t("settings_cancel")}
      </Button>
    </div>
  );
}
