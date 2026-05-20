import { h, render } from "preact";
import { InPageToast } from "./components/InPageToast";

const HOST_CLASS = "hw-auto-mode-host";
const AUTO_DISMISS_MS = 4000;

export function AutoModeToast(doc: Document) {
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
      remove();
      host = doc.createElement("div");
      host.className = HOST_CLASS;
      doc.body.appendChild(host);
      render(
        h(InPageToast, { message: "Auto-Hunter active", variant: "info", onClose: remove }),
        host,
      );
      dismissTimer = setTimeout(remove, AUTO_DISMISS_MS);
    },
    dismiss: remove,
  };
}
