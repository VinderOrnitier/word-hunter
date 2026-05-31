import type { JSX } from "preact";
import type { Locale } from "../../i18n";
import { t } from "../../i18n";

interface InPageToastPdxProps {
  message: string;
  locale: Locale;
  variant: "hint" | "info" | "auto";
  onClose: () => void;
  onFind?: () => void;
}

const SEARCH_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 2h8v2H7zM5 4h2v2H5zm12 0h2v2h-2zM3 6h2v8H3zm16 0h2v8h-2zM5 14h2v2H5zm12 0h2v2h-2zm-10 2h8v2H7zm10 2h2v2h-2zm2 2h2v2h-2z" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3h2v2H5zm2 2h2v2H7zm2 2h2v2H9zm2 2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zM9 11h2v2H9zm-2 2h2v2H7zm-2 2h2v2H5zm10-4h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z" />
  </svg>
);

export function InPageToastPdx({
  message,
  locale,
  variant,
  onClose,
  onFind,
}: InPageToastPdxProps): JSX.Element {
  return (
    <div class={`pdx-toast pdx-toast--${variant}`}>
      <button
        type="button"
        class="pdx-toast__lens"
        onClick={() => {
          chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
        }}
        aria-label={t("toast_open_aria", locale)}
        title={t("toast_open_aria", locale)}
      />
      <span class="pdx-toast__msg">{message}</span>
      {onFind != null && (
        <button
          type="button"
          class="pdx-toast__find"
          onClick={onFind}
          aria-label={t("toast_find_aria", locale)}
          title={t("toast_find_aria", locale)}
        >
          {SEARCH_ICON}
        </button>
      )}
      <button
        type="button"
        class="pdx-toast__close"
        onClick={onClose}
        aria-label={t("toast_dismiss_aria", locale)}
      >
        {CLOSE_ICON}
      </button>
    </div>
  );
}
