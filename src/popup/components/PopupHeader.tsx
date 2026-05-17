import type { JSX } from "preact";
import { Icon } from "./Icon";
import logoUrl from "../../assets/logo.png";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeader({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  return (
    <header class="wh-header">
      <div class="wh-header__lockup">
        <img
          class="wh-header__glyph"
          src={logoUrl}
          width="28"
          height="28"
          alt=""
          aria-hidden="true"
        />
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
