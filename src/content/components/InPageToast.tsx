import type { JSX } from "preact";

interface InPageToastProps {
  message: string;
  variant: "hint" | "info";
  onClose: () => void;
}

export function InPageToast({ message, variant, onClose }: InPageToastProps): JSX.Element {
  return (
    <div class={`hw-toast hw-toast--${variant}`}>
      <span class="hw-toast__dot" />
      <span class="hw-toast__message">{message}</span>
      <button class="hw-toast__close" onClick={onClose} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
