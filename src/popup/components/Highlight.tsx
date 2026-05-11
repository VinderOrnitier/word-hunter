import type { ComponentChildren, JSX } from "preact";

export type HighlightTone = "primary" | "found";

interface HighlightProps {
  children: ComponentChildren;
  tone?: HighlightTone;
}

export function Highlight({ children, tone = "primary" }: HighlightProps): JSX.Element {
  const cls = tone === "found" ? "wh-highlight wh-highlight--found" : "wh-highlight";
  return <span class={cls}>{children}</span>;
}
