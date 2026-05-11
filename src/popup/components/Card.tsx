import type { ComponentChildren, JSX } from "preact";

interface CardProps {
  children: ComponentChildren;
}

export function Card({ children }: CardProps): JSX.Element {
  return <div class="wh-card">{children}</div>;
}
