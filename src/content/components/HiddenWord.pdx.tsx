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
  // Unfound: invisible (inherits page text — same hiding behaviour as Slate).
  // Hinted:  same gradient underline as Slate — subtle, doesn't reveal the word.
  // Found:   green LED cell — registered catch.
  const cls = found ? "hw-word hw-word--found" : "hw-word";

  const underlineColor = found ? "var(--wh-found)" : hinted ? "var(--wh-primary)" : null;
  const backgroundImage = underlineColor
    ? `linear-gradient(180deg, transparent 0, transparent 73%, ${underlineColor} 73%, ${underlineColor} 92%, transparent 92%)`
    : undefined;

  return (
    <button
      type="button"
      tabIndex={-1}
      class={cls}
      onClick={onFind}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...inheritedStyle, cursor, backgroundImage }}
    >
      {[...word].reverse().join("")}
    </button>
  );
}
