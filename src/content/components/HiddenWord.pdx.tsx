import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import type { HiddenWordProps } from "./HiddenWord";

export function HiddenWordPdx({
  word,
  found,
  hinted = false,
  onFind,
  inheritedStyle,
  hoverRevealSeconds = 0,
}: HiddenWordProps): JSX.Element {
  const [pointerReady, setPointerReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (): void => {
    if (found) return;
    timerRef.current = setTimeout(() => setPointerReady(true), hoverRevealSeconds * 1000);
  };

  const handleMouseLeave = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPointerReady(false);
  };

  const cursor = found || pointerReady ? "pointer" : "text";
  // `hinted` keeps the same lit-cell as the unfound state under Pokédex
  // (the LED highlight already reads as "the system is helping you").
  void hinted;
  const cls = found ? "pdx-highlight pdx-highlight--found" : "pdx-highlight";

  return (
    <button
      type="button"
      tabIndex={-1}
      class={cls}
      onClick={onFind}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...inheritedStyle, cursor }}
    >
      {[...word].reverse().join("")}
    </button>
  );
}
