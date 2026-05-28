import { h, render } from "preact";
import type { Locale } from "../i18n";
import { InPageToast } from "./components/InPageToast";

export interface MountToastOptions {
  hostClass: string;
  message: string;
  locale: Locale;
  variant: "hint" | "info" | "auto";
  onFind?: () => void;
}

export function mountToast(doc: Document, opts: MountToastOptions): { dismiss: () => void } {
  let host: HTMLElement | null = doc.createElement("div");
  host.className = opts.hostClass;
  doc.body.appendChild(host);

  function dismiss(): void {
    if (host !== null) {
      render(null, host);
      host.remove();
      host = null;
    }
  }

  render(
    h(InPageToast, {
      message: opts.message,
      locale: opts.locale,
      variant: opts.variant,
      onClose: dismiss,
      onFind: opts.onFind,
    }),
    host
  );

  return { dismiss };
}
