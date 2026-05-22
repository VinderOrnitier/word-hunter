import type { JSX } from "preact";
import { Icon } from "../components/Icon";

interface ReloadHintProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function ReloadHint({ onReload, onDismiss }: ReloadHintProps): JSX.Element {
  return (
    <div class="wh-reload-hint">
      <span class="wh-reload-hint__info" title="Can be disabled in Settings.">
        <Icon name="info" size={12} />
      </span>
      <span class="wh-reload-hint__text">Reload the page to begin hunting.</span>
      <button type="button" class="wh-reload-hint__btn" onClick={onReload}>
        Reload
      </button>
      <button
        type="button"
        class="wh-reload-hint__dismiss"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
