import type { JSX } from "preact";

interface AutoModeToastViewProps {
  word: string;
  onClose: () => void;
}

export function AutoModeToastView({ word, onClose }: AutoModeToastViewProps): JSX.Element {
  return (
    <div class="hw-auto-toast" onClick={onClose} role="status" aria-live="polite">
      <span class="hw-auto-toast__icon" aria-hidden="true">🎯</span>
      <div class="hw-auto-toast__body">
        <span class="hw-auto-toast__title">Auto-Hunter active</span>
        <span class="hw-auto-toast__word">Hunting: <strong>{word}</strong></span>
      </div>
    </div>
  );
}
