import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { HINT_USED_KEY } from "../../shared/constants";
import type { ActiveWord, HuntRecord, Theme } from "../../shared/types";
import { HiddenWord } from "./HiddenWord";
import { HiddenWordPdx } from "./HiddenWord.pdx";

interface HiddenWordHostProps {
  activeWord: ActiveWord;
  inheritedStyle?: JSX.CSSProperties;
  onFind: (record: HuntRecord) => void | Promise<void>;
  onReview?: (record: HuntRecord) => void;
  hoverRevealSeconds?: number;
  hinted?: boolean;
  theme?: Theme;
}

export function HiddenWordHost({
  activeWord,
  inheritedStyle,
  onFind,
  onReview,
  hoverRevealSeconds,
  hinted,
  theme,
}: HiddenWordHostProps): JSX.Element {
  const [found, setFound] = useState(false);
  const lastRecord = useRef<HuntRecord | null>(null);

  const handleFind = (): void => {
    if (found) {
      if (lastRecord.current) onReview?.(lastRecord.current);
      return;
    }
    const now = Date.now();
    const seconds =
      activeWord.insertedAt != null
        ? Math.max(0, Math.round((now - activeWord.insertedAt) / 1000))
        : 0;
    const usedHint =
      typeof sessionStorage !== "undefined" && sessionStorage.getItem(HINT_USED_KEY) === "true";

    const record: HuntRecord = {
      word: activeWord.word,
      foundAt: now,
      pageUrl: window.location.href,
      pageTitle: document.title,
      searchDurationSeconds: seconds,
      hintUsed: usedHint,
      list: activeWord.list,
    };

    lastRecord.current = record;
    setFound(true);
    void onFind(record);
  };

  const Word = theme === "pokedex" ? HiddenWordPdx : HiddenWord;
  return (
    <Word
      word={activeWord.word}
      found={found}
      hinted={hinted}
      onFind={handleFind}
      inheritedStyle={inheritedStyle}
      hoverRevealSeconds={hoverRevealSeconds}
    />
  );
}
