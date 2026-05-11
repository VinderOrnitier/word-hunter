import type { ComponentChildren, JSX } from "preact";

export type BadgeTone =
  | "neutral"
  | "animals"
  | "pokemon"
  | "hint"
  | "primary";

interface BadgeProps {
  children: ComponentChildren;
  tone?: BadgeTone;
  dotColor?: string;
}

export function Badge({
  children,
  tone = "neutral",
  dotColor,
}: BadgeProps): JSX.Element {
  return (
    <span class={`wh-badge wh-badge--${tone}`}>
      {dotColor && (
        <span
          class="wh-badge__dot"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </span>
  );
}
