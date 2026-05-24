import type { JSX } from "preact";
import rawLogoUrl from "../../assets/logo.png";
import type { Locale } from "../../i18n";
import { t } from "../../i18n";

const logoUrl = chrome.runtime.getURL(rawLogoUrl.replace(/^\//, ""));

interface InPageToastProps {
  message: string;
  locale: Locale;
  variant: "hint" | "info";
  onClose: () => void;
  onFind?: () => void;
}

export function InPageToast({
  message,
  locale,
  variant,
  onClose,
  onFind,
}: InPageToastProps): JSX.Element {
  return (
    <div class={`hw-toast hw-toast--${variant}`}>
      <button
        type="button"
        class="hw-toast__glyph"
        onClick={() => {
          chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
        }}
        aria-label={t("toast_open_aria", locale)}
        title={t("toast_open_aria", locale)}
      >
        <img src={logoUrl} width="20" height="20" alt="" aria-hidden="true" />
      </button>
      <span class="hw-toast__message">{message}</span>
      {onFind != null && (
        <button
          type="button"
          class="hw-toast__find"
          onClick={onFind}
          aria-label={t("toast_find_aria", locale)}
          title={t("toast_find_aria", locale)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}
      <button
        type="button"
        class="hw-toast__close"
        onClick={onClose}
        aria-label={t("toast_dismiss_aria", locale)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
