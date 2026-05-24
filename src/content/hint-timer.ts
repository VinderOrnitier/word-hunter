import { h, render } from "preact";
import type { Locale } from "../i18n";
import { t } from "../i18n";
import { HINT_USED_KEY } from "../shared/constants";
import { InPageToast } from "./components/InPageToast";

const HOST_CLASS = "hw-hint-toast-host";

export function HintTimer(doc: Document, getLocale: () => Locale) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let toastHost: HTMLElement | null = null;

  function hintUsed(): boolean {
    return sessionStorage.getItem(HINT_USED_KEY) === "true";
  }

  function removeToast(): void {
    if (toastHost !== null) {
      render(null, toastHost);
      toastHost.remove();
      toastHost = null;
    }
  }

  function showToast(): void {
    const locale = getLocale();
    toastHost = doc.createElement("div");
    toastHost.className = HOST_CLASS;
    doc.body.appendChild(toastHost);
    const host = toastHost;
    render(
      h(InPageToast, {
        message: t("content_hint_toast", locale),
        locale,
        variant: "hint",
        onClose: () => {
          removeToast();
        },
      }),
      host
    );
    sessionStorage.setItem(HINT_USED_KEY, "true");
  }

  function start(delayMinutes: number): void {
    if (timerId !== null) clearTimeout(timerId);
    sessionStorage.removeItem(HINT_USED_KEY);
    timerId = setTimeout(showToast, delayMinutes * 60_000);
  }

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    removeToast();
  }

  return { start, cancel, hintUsed };
}
