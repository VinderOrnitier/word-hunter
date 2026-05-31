import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { Icon } from "../components/Icon";

const STEP_KEYS: MessageKey[] = ["rules_step_1", "rules_step_2", "rules_step_3"];

export function RulesTabPdx(): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__body">
      <div class="pdx-popup__body-inner">
        <div class="pdx-section-eyebrow">
          <span class="pdx-section-eyebrow__title">{t("header_rules_aria")}</span>
        </div>
        <div class="rules-content">
          <span class="rules-content__intro">{t("rules_editorial")}</span>
          <p class="rules-content__body">{t("rules_body")}</p>
          <ol class="rules-list">
            {STEP_KEYS.map((key, i) => (
              <li key={key}>
                <span class="rules-list__marker">{String(i + 1).padStart(2, "0")}</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
          <div class="rules-settings">
            <Icon name="settings" size={12} />
            <span>{t("rules_settings")}</span>
          </div>
          <p class="rules-disclaimer">{t("rules_disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
