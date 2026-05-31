import type { Locale } from "../i18n";
import { t } from "../i18n";
import { HINT_USED_KEY } from "../shared/constants";
import type { Theme } from "../shared/types";
import { mountToast } from "./mount-toast";

const HOST_CLASS = "hw-hint-toast-host";

export function HintTimer(doc: Document, getLocale: () => Locale, getTheme: () => Theme) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let dismissToast: (() => void) | null = null;
  let pendingOnFind: (() => void) | undefined;

  function removeToast(): void {
    dismissToast?.();
    dismissToast = null;
  }

  function showToast(): void {
    const locale = getLocale();
    ({ dismiss: dismissToast } = mountToast(doc, {
      hostClass: HOST_CLASS,
      message: t("content_hint_toast", locale),
      locale,
      variant: "hint",
      theme: getTheme(),
      onFind: pendingOnFind,
    }));
    sessionStorage.setItem(HINT_USED_KEY, "true");
  }

  function start(delayMinutes: number, onFind?: () => void): void {
    if (timerId !== null) clearTimeout(timerId);
    sessionStorage.removeItem(HINT_USED_KEY);
    pendingOnFind = onFind;
    timerId = setTimeout(showToast, delayMinutes * 60_000);
  }

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    removeToast();
  }

  function hintUsed(): boolean {
    return sessionStorage.getItem(HINT_USED_KEY) === "true";
  }

  return { start, cancel, hintUsed };
}
