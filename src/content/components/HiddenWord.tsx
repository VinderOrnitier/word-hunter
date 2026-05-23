import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";

export interface HiddenWordProps {
  word: string;
  found: boolean;
  onFind?: () => void;
  inheritedStyle?: JSX.CSSProperties;
  hoverRevealSeconds?: number;
}

export function HiddenWord({
  word,
  found,
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
  const cls = found ? "hw-word hw-word--found" : "hw-word";

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
      {[...word].map((c, i) => (
        <span key={i} class="hw-char" data-char={c} />
      ))}
    </button>
  );
}
