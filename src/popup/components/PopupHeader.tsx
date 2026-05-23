import type { JSX } from "preact";
import logoUrl from "../../assets/logo.png";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeader({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  const t = useT();
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
        aria-label={t("header_rules_aria")}
        aria-pressed={rulesActive ? "true" : "false"}
        onClick={onRules}
      >
        <Icon name="info" size={16} />
      </button>
    </header>
  );
}
