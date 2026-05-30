import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeaderPdx({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  const t = useT();
  return (
    <header class="pdx-popup__header">
      <span class="pdx-popup__lens" aria-hidden="true" />
      <div class="pdx-popup__leds" aria-hidden="true">
        <span class="led led--red" />
        <span class="led led--green" />
        <span class="led led--yellow" />
      </div>
      <span class="pdx-popup__wordmark">WORD HUNTER</span>
      <button
        type="button"
        class={`pdx-popup__info${rulesActive ? " is-active" : ""}`}
        aria-label={t("header_rules_aria")}
        aria-pressed={rulesActive ? "true" : "false"}
        onClick={onRules}
      >
        <Icon name="info" size={16} />
      </button>
    </header>
  );
}
