import type { JSX } from "preact";
import type { ActiveWord, WordSource } from "../../shared/types";
import { resolveArt } from "../../shared/art-resolver";
import { Icon } from "../components/Icon";

interface ActiveWordCardProps {
  activeWord: ActiveWord | null;
  onClear: () => void;
}

export function ActiveWordCard({ activeWord, onClear }: ActiveWordCardProps): JSX.Element {
  if (!activeWord) {
    return (
      <div class="wh-active-card wh-active-card--empty">
        <div class="wh-active-card__body">
          <span class="wh-active-card__eyebrow">No active word</span>
          <span class="wh-active-card__hint">pick a word below to start the hunt.</span>
        </div>
      </div>
    );
  }

  const source: WordSource = activeWord.list ?? "custom";
  const art = resolveArt(activeWord.word, source);

  return (
    <div class="wh-active-card">
      <div class="wh-active-card__art" aria-hidden="true">
        {renderArt(source, art)}
      </div>
      <div class="wh-active-card__body">
        <span class="wh-active-card__eyebrow">Active word</span>
        <span class="wh-active-card__word">{activeWord.word}</span>
      </div>
      <button
        type="button"
        class="wh-active-card__stop"
        title="Stop hunt"
        aria-label="Clear active word"
        onClick={onClear}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function renderArt(source: WordSource, art: string | undefined): JSX.Element | null {
  if (source === "pokemon" && art) {
    return (
      <img
        class="wh-active-card__sprite"
        src={art}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (source === "animals" && art) {
    return <span class="wh-active-card__emoji">{art}</span>;
  }
  return <span class="wh-active-card__placeholder">·</span>;
}
