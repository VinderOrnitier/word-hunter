import { h, render } from "preact";
import type { Locale } from "../i18n";
import type { Theme } from "../shared/types";
import { CelebrationPopup } from "./components/CelebrationPopup";
import { CelebrationPopupPdx } from "./components/CelebrationPopup.pdx";

export interface CelebrationProps {
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
  next?: { word: string; art?: string };
}

export function CelebrationManager(doc: Document, getLocale: () => Locale, getTheme: () => Theme) {
  let host: HTMLElement | null = null;

  function dismiss(): void {
    if (host !== null) {
      render(null, host);
      host.remove();
      host = null;
    }
  }

  function show(
    props: CelebrationProps,
    afterDismiss?: () => void | Promise<void>,
    onClear?: () => void
  ): void {
    dismiss();
    host = doc.createElement("div");
    if (getTheme() === "pokedex") host.className = "pdx";
    doc.body.appendChild(host);
    const current = host;

    function dismissCurrent(): void {
      render(null, current);
      current.remove();
      if (host === current) host = null;
    }

    const Popup = getTheme() === "pokedex" ? CelebrationPopupPdx : CelebrationPopup;
    render(
      h(Popup, {
        ...props,
        visible: true,
        locale: getLocale(),
        onDismiss: () => {
          dismissCurrent();
          void afterDismiss?.();
        },
        onClear:
          onClear !== undefined
            ? () => {
                dismissCurrent();
                onClear();
              }
            : undefined,
      }),
      host
    );
  }

  return { show, dismiss };
}
