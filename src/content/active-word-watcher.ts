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

      timer.cancel();
      if (!doc.querySelector(".hw-word--found")) {
        celebration.dismiss();
      }
      doc.querySelectorAll(`.${HW_HOST_CLASS}`).forEach((el) => {
        if (el.querySelector(".hw-word--found")) return;
        render(null, el);
        el.remove();
      });
    });
  }

  return { start };
}
