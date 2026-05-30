import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface BottomActionBarProps {
  onStart: () => void;
  onShuffle: () => void;
  onCustom: () => void;
  startDisabled?: boolean;
  autoContinue?: boolean;
  onAutoContinue?: () => void;
}

export function BottomActionBarPdx({
  onStart,
  onShuffle,
  onCustom,
  startDisabled = false,
  autoContinue = false,
  onAutoContinue,
}: BottomActionBarProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__action-bar">
      <button
        type="button"
        role="switch"
        class={`pdx-action-icon${autoContinue ? " is-on" : ""}`}
        aria-checked={autoContinue}
        title={t("action_bar_auto_continue_title")}
        aria-label={t("action_bar_auto_continue_aria")}
        onClick={onAutoContinue}
      >
        <Icon name="refresh" size={14} />
      </button>
      <button type="button" class="pdx-action-primary" onClick={onStart} disabled={startDisabled}>
        <Icon name="play" size={11} filled />
        <span>{t("action_bar_start")}</span>
      </button>
      <button
        type="button"
        class="pdx-action-icon"
        title={t("action_bar_shuffle_title")}
        aria-label={t("action_bar_shuffle_aria")}
        onClick={onShuffle}
      >
        <Icon name="shuffle" size={14} />
      </button>
      <button
        type="button"
        class="pdx-action-icon"
        title={t("action_bar_custom_title")}
        aria-label={t("action_bar_custom_aria")}
        onClick={onCustom}
      >
        <Icon name="pencil" size={14} />
      </button>
    </div>
  );
}
