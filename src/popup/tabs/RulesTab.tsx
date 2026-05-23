import type { JSX } from "preact";
import { useT } from "../../i18n";

export function RulesTab(): JSX.Element {
  const t = useT();
  return (
    <div class="wh-rules">
      <span class="wh-editorial">{t("rules_editorial")}</span>

      <p class="wh-body wh-rules__body">
        {t("rules_body_pre_kbd")}
        <code class="wh-rules__kbd">Ctrl + F</code>
        {t("rules_body_post_kbd")}
      </p>

      <ul class="wh-rules__list">
        <li class="wh-rules__item">
          <span class="wh-rules__marker">30 +</span>
          <span class="wh-body-sm">{t("rules_item_min_words")}</span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">1×</span>
          <span class="wh-body-sm">{t("rules_item_one_active")}</span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">—</span>
          <span class="wh-body-sm">{t("rules_item_no_long_text")}</span>
        </li>
      </ul>
    </div>
  );
}
