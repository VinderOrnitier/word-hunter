import { useState } from "preact/hooks";
import type { JSX } from "preact";
import type { ActiveWord, HuntRecord } from "../../shared/types";
import { HiddenWord } from "./HiddenWord";
import { CelebrationPopup } from "./CelebrationPopup";

interface HiddenWordHostProps {
  activeWord: ActiveWord;
  inheritedStyle?: JSX.CSSProperties;
  art?: string;
  onFind: (record: HuntRecord) => void | Promise<void>;
}

const HINT_USED_KEY = "hw-hint-used";

export function HiddenWordHost({
  activeWord,
  inheritedStyle,
  art,
  onFind,
}: HiddenWordHostProps): JSX.Element {
  const [found, setFound] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [durationS, setDurationS] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  const handleFind = (): void => {
    if (found) return;
    const now = Date.now();
    const seconds = Math.max(
      0,
      Math.round((now - activeWord.insertedAt) / 1000)
    );
    const usedHint =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(HINT_USED_KEY) === "true";

    const record: HuntRecord = {
      word: activeWord.word,
      foundAt: now,
      pageUrl: window.location.href,
      pageTitle: document.title,
      searchDurationSeconds: seconds,
      hintUsed: usedHint,
    };

    setFound(true);
    setDurationS(seconds);
    setHintUsed(usedHint);
    setCelebrating(true);
    void onFind(record);
  };

  return (
    <>
      <HiddenWord
        word={activeWord.word}
        found={found}
        onFind={handleFind}
        inheritedStyle={inheritedStyle}
      />
      <CelebrationPopup
        visible={celebrating}
        word={activeWord.word}
        durationS={durationS}
        hintUsed={hintUsed}
        art={art}
        onDismiss={() => setCelebrating(false)}
      />
    </>
  );
}
