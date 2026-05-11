import type { JSX } from "preact";

export interface HiddenWordProps {
  word: string;
  found: boolean;
  onFind?: () => void;
  inheritedStyle?: JSX.CSSProperties;
}

export function HiddenWord({
  word,
  found,
  onFind,
  inheritedStyle,
}: HiddenWordProps): JSX.Element {
  const cls = found ? "hw-word hw-word--found" : "hw-word";
  return (
    <span
      class={cls}
      data-word={word}
      onClick={onFind}
      style={inheritedStyle}
    >
      {[...word].map((c, i) => (
        <span key={i} class="hw-char" data-char={c} />
      ))}
    </span>
  );
}
