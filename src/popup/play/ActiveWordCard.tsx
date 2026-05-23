import type { JSX } from "preact";
import { resolveArt } from "../../shared/art-resolver";
import type { ActiveWord, WordSource } from "../../shared/types";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ActiveWordCardProps {
  activeWord: ActiveWord | null;
  onClear: () => void;
}

export function ActiveWordCard({ activeWord, onClear }: ActiveWordCardProps): JSX.Element {
  const t = useT();

  if (!activeWord) {
    return (
      <div class="wh-active-card wh-active-card--empty">
        <div class="wh-active-card__art" aria-hidden="true">
          <Icon name="search" size={18} />
        </div>
        <div class="wh-active-card__body">
          <span class="wh-active-card__eyebrow">{t("active_word_empty_eyebrow")}</span>
          <span class="wh-active-card__hint">{t("active_word_empty_hint")}</span>
        </div>
      </div>
    );
  }

  const source: WordSource = activeWord.list ?? "custom";
  const art = resolveArt(activeWord.word, source);
  const isIconArt = source === "custom" || !art;

  return (
    <div class="wh-active-card">
      <div
        class={`wh-active-card__art${isIconArt ? " wh-active-card__art--icon" : ""}`}
        aria-hidden="true"
      >
        {renderArt(source, art)}
      </div>
      <div class="wh-active-card__body">
        <span class="wh-active-card__eyebrow">{t("active_word_eyebrow")}</span>
        <span class="wh-active-card__word">{activeWord.word}</span>
      </div>
      <button
        type="button"
        class="wh-active-card__stop"
        title={t("active_word_stop_title")}
        aria-label={t("active_word_stop_aria")}
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
  return <Icon name="pencil" size={18} />;
}
