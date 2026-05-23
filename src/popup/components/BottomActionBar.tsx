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

export function BottomActionBar({
  onStart,
  onShuffle,
  onCustom,
  startDisabled = false,
  autoContinue = false,
  onAutoContinue,
}: BottomActionBarProps): JSX.Element {
  const t = useT();
  return (
    <div class="wh-action-bar">
      <button
        type="button"
        role="switch"
        class={`wh-action-bar__icon${autoContinue ? " is-on" : ""}`}
        aria-checked={autoContinue}
        title={t("action_bar_auto_continue_title")}
        aria-label={t("action_bar_auto_continue_aria")}
        onClick={onAutoContinue}
      >
        <Icon name="refresh" size={16} />
      </button>
      <button
        type="button"
        class="wh-action-bar__primary"
        onClick={onStart}
        disabled={startDisabled}
      >
        <Icon name="play" size={14} filled />
        <span>{t("action_bar_start")}</span>
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title={t("action_bar_shuffle_title")}
        aria-label={t("action_bar_shuffle_aria")}
        onClick={onShuffle}
      >
        <Icon name="shuffle" size={16} />
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title={t("action_bar_custom_title")}
        aria-label={t("action_bar_custom_aria")}
        onClick={onCustom}
      >
        <Icon name="pencil" size={16} />
      </button>
    </div>
  );
}
