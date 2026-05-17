import { h, render } from "preact";
import { HintTooltip } from "./components/HintTooltip";
import { HINT_USED_KEY } from "../shared/constants";

const HOST_CLASS = "hw-hint-tooltip-host";

export function HintTimer(doc: Document) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let tooltipHost: HTMLElement | null = null;

  function hintUsed(): boolean {
    return sessionStorage.getItem(HINT_USED_KEY) === "true";
  }

  function removeTooltip(): void {
    if (tooltipHost !== null) {
      render(null, tooltipHost);
      tooltipHost.remove();
      tooltipHost = null;
    }
  }

  function showTooltip(): void {
    tooltipHost = doc.createElement("div");
    tooltipHost.className = HOST_CLASS;
    doc.body.appendChild(tooltipHost);
    const host = tooltipHost;
    render(
      h(HintTooltip, {
        visible: true,
        onClose: () => {
          removeTooltip();
        },
      }),
      host
    );
    sessionStorage.setItem(HINT_USED_KEY, "true");
  }

  function start(delayMinutes: number): void {
    if (timerId !== null) clearTimeout(timerId);
    sessionStorage.removeItem(HINT_USED_KEY);
    timerId = setTimeout(showTooltip, delayMinutes * 60_000);
  }

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    removeTooltip();
  }

  return { start, cancel, hintUsed };
}
