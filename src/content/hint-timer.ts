import { h, render } from "preact";
import { HintTooltip } from "./components/HintTooltip";

const HINT_USED_KEY = "hw-hint-used";
const HOST_CLASS = "hw-hint-tooltip-host";

export function HintTimer(doc: Document) {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function hintUsed(): boolean {
    return sessionStorage.getItem(HINT_USED_KEY) === "true";
  }

  function showTooltip(): void {
    const host = doc.createElement("div");
    host.className = HOST_CLASS;
    doc.body.appendChild(host);
    render(h(HintTooltip, { visible: true }), host);
    sessionStorage.setItem(HINT_USED_KEY, "true");
  }

  function start(delayMinutes: number): void {
    timerId = setTimeout(showTooltip, delayMinutes * 60_000);
  }

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  return { start, cancel, hintUsed };
}
