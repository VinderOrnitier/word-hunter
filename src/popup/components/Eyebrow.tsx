import type { ComponentChildren, JSX } from "preact";

interface EyebrowProps {
  children: ComponentChildren;
}

export function Eyebrow({ children }: EyebrowProps): JSX.Element {
  return <div class="wh-eyebrow">{children}</div>;
}
