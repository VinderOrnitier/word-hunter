import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ReloadHintProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function ReloadHintPdx({ onReload, onDismiss }: ReloadHintProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-reload-hint">
      <span class="pdx-reload-hint__info" title={t("reload_hint_info_title")}>
        <Icon name="info" size={12} />
      </span>
      <span class="pdx-reload-hint__msg">{t("pdx_reload_hint_text")}</span>
      <button type="button" class="pdx-reload-hint__btn" onClick={onReload}>
        {t("reload_hint_reload")}
      </button>
      <button
        type="button"
        class="pdx-reload-hint__close"
        aria-label={t("reload_hint_dismiss_aria")}
        onClick={onDismiss}
      >
        <Icon name="x" size={10} />
      </button>
    </div>
  );
}
