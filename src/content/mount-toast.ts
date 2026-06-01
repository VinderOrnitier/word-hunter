import { h, render } from "preact";
import type { Locale } from "../i18n";
import type { Theme } from "../shared/types";
import { InPageToast } from "./components/InPageToast";
import { InPageToastPdx } from "./components/InPageToast.pdx";

export interface MountToastOptions {
  hostClass: string;
  message: string;
  locale: Locale;
  variant: "hint" | "info" | "auto";
  theme: Theme;
  onFind?: () => void;
}

export function mountToast(doc: Document, opts: MountToastOptions): { dismiss: () => void } {
  let host: HTMLElement | null = doc.createElement("div");
  host.className = opts.theme === "pokedex" ? `${opts.hostClass} pdx` : opts.hostClass;
  doc.body.appendChild(host);

  function dismiss(): void {
    if (host !== null) {
      render(null, host);
      host.remove();
      host = null;
    }
  }

  const Toast = opts.theme === "pokedex" ? InPageToastPdx : InPageToast;
  render(
    h(Toast, {
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
