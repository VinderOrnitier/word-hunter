import type { JSX } from "preact";
import { Button } from "./Button";

interface ConfirmOverlayProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmOverlay({ prompt, onConfirm, onCancel }: ConfirmOverlayProps): JSX.Element {
  return (
    <div class="wh-confirm-overlay">
      <span class="wh-confirm-overlay__prompt">{prompt}</span>
      <Button variant="danger" size="sm" onClick={onConfirm}>Yes</Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  );
}
