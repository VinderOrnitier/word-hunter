import type { JSX } from "preact";
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
  return (
    <div class="wh-action-bar">
      <button
        type="button"
        role="switch"
        class={`wh-action-bar__icon${autoContinue ? " is-on" : ""}`}
        aria-checked={autoContinue}
        title="Auto-continue — pick next word after each find"
        aria-label="Auto-continue"
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
        <span>Start a hunt</span>
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title="Pick a random word"
        aria-label="Pick a random word"
        onClick={onShuffle}
      >
        <Icon name="shuffle" size={16} />
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title="Custom word"
        aria-label="Custom word"
        onClick={onCustom}
      >
        <Icon name="pencil" size={16} />
      </button>
    </div>
  );
}
