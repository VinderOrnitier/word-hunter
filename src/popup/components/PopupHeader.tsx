import type { JSX } from "preact";
import { Icon } from "./Icon";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeader({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  return (
    <header class="wh-header">
      <div class="wh-header__lockup">
        <svg
          class="wh-header__glyph"
          viewBox="0 0 64 64"
          width="28"
          height="28"
          aria-hidden="true"
        >
          <rect width="64" height="64" rx="14" fill="var(--wh-surface)" />
          <text
            x="32"
            y="42"
            text-anchor="middle"
            font-family="var(--wh-font-sans)"
            font-weight="700"
            font-size="34"
            letter-spacing="-0.02em"
            fill="var(--wh-fg)"
          >
            H
          </text>
          <rect
            x="20"
            y="50"
            width="24"
            height="3"
            rx="1.5"
            fill="var(--wh-primary)"
          />
        </svg>
        <span class="wh-header__wordmark">Word Hunter</span>
      </div>
      <button
        type="button"
        class={`wh-header__rules-btn${rulesActive ? " wh-header__rules-btn--active" : ""}`}
        aria-label="Rules"
        aria-pressed={rulesActive ? "true" : "false"}
        onClick={onRules}
      >
        <Icon name="info" size={16} />
      </button>
    </header>
  );
}
