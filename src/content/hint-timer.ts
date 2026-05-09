const HINT_USED_KEY = "hw-hint-used";
const TOOLTIP_CLASS = "hw-hint-tooltip";
const TOOLTIP_TEXT = "The word is hidden on this page";

export function HintTimer(doc: Document) {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function hintUsed(): boolean {
    return sessionStorage.getItem(HINT_USED_KEY) === "true";
  }

  function showTooltip(): void {
    const el = doc.createElement("div");
    el.className = TOOLTIP_CLASS;
    el.textContent = TOOLTIP_TEXT;
    doc.body.appendChild(el);
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
