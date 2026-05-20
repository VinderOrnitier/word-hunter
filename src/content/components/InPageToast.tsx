import type { JSX } from "preact";
import rawLogoUrl from "../../assets/logo.png";

const logoUrl = chrome.runtime.getURL(rawLogoUrl.replace(/^\//, ""));

interface InPageToastProps {
  message: string;
  variant: "hint" | "info";
  onClose: () => void;
}

export function InPageToast({ message, variant, onClose }: InPageToastProps): JSX.Element {
  return (
    <div class={`hw-toast hw-toast--${variant}`}>
      <button
        class="hw-toast__glyph"
        onClick={() => { chrome.runtime.sendMessage({ type: "OPEN_POPUP" }); }}
        aria-label="Open Word Hunter"
        title="Open Word Hunter"
      >
        <img src={logoUrl} width="20" height="20" alt="" aria-hidden="true" />
      </button>
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
