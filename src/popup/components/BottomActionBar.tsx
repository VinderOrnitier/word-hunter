import type { JSX } from "preact";
import { Icon } from "./Icon";

interface BottomActionBarProps {
  onStart: () => void;
  onShuffle: () => void;
  onCustom: () => void;
}

export function BottomActionBar({
  onStart,
  onShuffle,
  onCustom,
}: BottomActionBarProps): JSX.Element {
  return (
    <div class="wh-action-bar">
      <button
        type="button"
        class="wh-action-bar__primary"
        onClick={onStart}
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
