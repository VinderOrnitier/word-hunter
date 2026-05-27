import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

export function RulesTab(): JSX.Element {
  const t = useT();
  return (
    <div class="wh-rules">
      <span class="wh-editorial">{t("rules_editorial")}</span>

      <p class="wh-body wh-rules__body">{t("rules_body")}</p>

      <ol class="wh-rules__steps">
        <li class="wh-rules__step">
          <span class="wh-rules__step-dot">1</span>
          <span class="wh-rules__step-text">{t("rules_step_1")}</span>
        </li>
        <li class="wh-rules__step">
          <span class="wh-rules__step-dot">2</span>
          <span class="wh-rules__step-text">{t("rules_step_2")}</span>
        </li>
        <li class="wh-rules__step">
          <span class="wh-rules__step-dot">3</span>
          <span class="wh-rules__step-text">{t("rules_step_3")}</span>
        </li>
      </ol>

      <div class="wh-rules__settings">
        <Icon name="settings" size={14} />
        <span class="wh-body-sm">{t("rules_settings")}</span>
      </div>

      <p class="wh-rules__disclaimer">{t("rules_disclaimer")}</p>
    </div>
  );
}
