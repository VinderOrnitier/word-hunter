import { render } from "preact";

const HW_HOST_CLASS = "hw-host";

export interface CancellableTimer {
  cancel(): void;
}

export interface DismissableCelebration {
  dismiss(): void;
}

export function ActiveWordWatcher(
  timer: CancellableTimer,
  celebration: DismissableCelebration,
  doc: Document
): { start(): void } {
  function start(): void {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (!("activeWord" in changes)) return;

      const FOUND_SELECTOR = ".hw-word--found, .pdx-highlight--found";
      timer.cancel();
      if (!doc.querySelector(FOUND_SELECTOR)) {
        celebration.dismiss();
      }
      doc.querySelectorAll(`.${HW_HOST_CLASS}`).forEach((el) => {
        if (el.querySelector(FOUND_SELECTOR)) return;
        render(null, el);
        el.remove();
      });
    });
  }

  return { start };
}
