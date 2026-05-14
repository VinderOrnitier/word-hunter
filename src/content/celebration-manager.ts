import { h, render } from "preact";
import { CelebrationPopup } from "./components/CelebrationPopup";

export interface CelebrationProps {
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
}

export function CelebrationManager(doc: Document) {
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
    doc.body.appendChild(host);
    const current = host;

    function dismissCurrent(): void {
      render(null, current);
      current.remove();
      if (host === current) host = null;
    }

    render(
      h(CelebrationPopup, {
        ...props,
        visible: true,
        onDismiss: () => {
          dismissCurrent();
          void afterDismiss?.();
        },
        onClear: onClear !== undefined ? () => {
          dismissCurrent();
          onClear();
        } : undefined,
      }),
      host
    );
  }

  return { show, dismiss };
}
