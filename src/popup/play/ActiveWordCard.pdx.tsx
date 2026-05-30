import type { JSX } from "preact";
import { useT } from "../../i18n";
import { resolveArtView } from "../../shared/art-resolver";
import type { ActiveWord, WordSource } from "../../shared/types";
import { Icon } from "../components/Icon";

interface ActiveWordCardProps {
  activeWord: ActiveWord | null;
  onClear: () => void;
}

export function ActiveWordCardPdx({ activeWord, onClear }: ActiveWordCardProps): JSX.Element {
  const t = useT();

  if (!activeWord) {
    return (
      <div class="pdx-active">
        <div class="pdx-active__art pdx-active__art--empty" aria-hidden="true">
          <Icon name="search" size={18} />
        </div>
        <div class="pdx-active__body">
          <span class="pdx-active__eyebrow">{t("pdx_active_no_hunt")}</span>
          <span class="pdx-active__hint">{t("pdx_active_empty_hint")}</span>
        </div>
        <span class="pdx-active__spacer" aria-hidden="true" />
      </div>
    );
  }

  const source: WordSource = activeWord.list ?? "custom";
  const art = resolveArtView(activeWord.word, source);

  return (
    <div class="pdx-active">
      <div class="pdx-active__art" aria-hidden="true">
        {renderArt(art)}
      </div>
      <div class="pdx-active__body">
        <span class="pdx-active__eyebrow">{t("pdx_active_now_hunting")}</span>
        <span class="pdx-active__word">{activeWord.word}</span>
      </div>
      <button
        type="button"
        class="pdx-active__stop"
        title={t("active_word_stop_title")}
        aria-label={t("active_word_stop_aria")}
        onClick={onClear}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}

function renderArt(art: ReturnType<typeof resolveArtView>): JSX.Element {
  switch (art.kind) {
    case "sprite":
      return <img src={art.url} alt="" width={44} height={44} loading="lazy" decoding="async" />;
    case "emoji":
      return <span class="emoji">{art.char}</span>;
    default:
      return <Icon name="pencil" size={18} />;
  }
}
