import type { JSX } from "preact";

interface HintTooltipProps {
  visible: boolean;
  onClose?: () => void;
}

export function HintTooltip({ visible, onClose }: HintTooltipProps): JSX.Element | null {
  if (!visible) return null;
  return (
    <div class="hw-hint-tooltip">
      <span class="hw-hint-tooltip__dot" />
      <span class="hw-hint-tooltip__message">The word is hidden on this page</span>
      <button class="hw-hint-tooltip__close" onClick={onClose} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
