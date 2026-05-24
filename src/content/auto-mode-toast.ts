import { h, render } from "preact";
import type { Locale } from "../i18n";
import { t } from "../i18n";
import { InPageToast } from "./components/InPageToast";

const HOST_CLASS = "hw-auto-mode-host";
const AUTO_DISMISS_MS = 4000;

export function AutoModeToast(doc: Document, getLocale: () => Locale) {
  let host: HTMLElement | null = null;
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  function remove(): void {
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (host !== null) {
      render(null, host);
      host.remove();
      host = null;
    }
  }

  return {
    show(): void {
      const locale = getLocale();
      remove();
      host = doc.createElement("div");
      host.className = HOST_CLASS;
      doc.body.appendChild(host);
      render(
        h(InPageToast, {
          message: t("content_auto_mode_toast", locale),
          locale,
          variant: "info",
          onClose: remove,
        }),
        host
      );
      dismissTimer = setTimeout(remove, AUTO_DISMISS_MS);
    },
    dismiss: remove,
  };
}
