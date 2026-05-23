import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ReloadHintProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function ReloadHint({ onReload, onDismiss }: ReloadHintProps): JSX.Element {
  const t = useT();
  return (
    <div class="wh-reload-hint">
      <span class="wh-reload-hint__info" title={t("reload_hint_info_title")}>
        <Icon name="info" size={12} />
      </span>
      <span class="wh-reload-hint__text">{t("reload_hint_text")}</span>
      <button type="button" class="wh-reload-hint__btn" onClick={onReload}>
        {t("reload_hint_reload")}
      </button>
      <button
        type="button"
        class="wh-reload-hint__dismiss"
        aria-label={t("reload_hint_dismiss_aria")}
        onClick={onDismiss}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
