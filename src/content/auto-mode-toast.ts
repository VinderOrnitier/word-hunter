import type { Locale } from "../i18n";
import { t } from "../i18n";
import { mountToast } from "./mount-toast";

const HOST_CLASS = "hw-auto-mode-host";
const AUTO_DISMISS_MS = 4000;

export function AutoModeToast(doc: Document, getLocale: () => Locale) {
  let dismiss: (() => void) | null = null;
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  function remove(): void {
    if (dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    dismiss?.();
    dismiss = null;
  }

  return {
    show(): void {
      const locale = getLocale();
      remove();
      ({ dismiss } = mountToast(doc, {
        hostClass: HOST_CLASS,
        message: t("content_auto_mode_toast", locale),
        locale,
        variant: "auto",
        onFind: undefined,
      }));
      dismissTimer = setTimeout(remove, AUTO_DISMISS_MS);
    },
    dismiss: remove,
  };
}
