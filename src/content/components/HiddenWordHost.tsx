import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { HINT_USED_KEY } from "../../shared/constants";
import type { ActiveWord, HuntRecord } from "../../shared/types";
import { HiddenWord } from "./HiddenWord";

interface HiddenWordHostProps {
  activeWord: ActiveWord;
  inheritedStyle?: JSX.CSSProperties;
  onFind: (record: HuntRecord) => void | Promise<void>;
  onReview?: (record: HuntRecord) => void;
  hoverRevealSeconds?: number;
}

export function HiddenWordHost({
  activeWord,
  inheritedStyle,
  onFind,
  onReview,
  hoverRevealSeconds,
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

  return (
    <HiddenWord
      word={activeWord.word}
      found={found}
      onFind={handleFind}
      inheritedStyle={inheritedStyle}
      hoverRevealSeconds={hoverRevealSeconds}
    />
  );
}
