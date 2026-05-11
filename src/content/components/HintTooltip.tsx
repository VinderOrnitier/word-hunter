import type { JSX } from "preact";

interface HintTooltipProps {
  visible: boolean;
}

export function HintTooltip({ visible }: HintTooltipProps): JSX.Element | null {
  if (!visible) return null;
  return (
    <div class="hw-hint-tooltip">
      <span class="hw-hint-tooltip__dot" />
      <span>The word is hidden on this page</span>
    </div>
  );
}
