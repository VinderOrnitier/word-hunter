import "../shared/styles/tokens.css";
import "./styles/overlay.css";
import { render } from "preact";
import { getActiveWord, clearActiveWord, getSettings, saveFind } from "../shared/storage";
import { ParagraphSelector } from "./paragraph-selector";
import { WordRenderer } from "./word-renderer";
import { HintTimer } from "./hint-timer";
import { CelebrationManager } from "./celebration-manager";
import { NoParagraphNotification } from "./no-paragraph-notification";
import { NavigationObserver } from "./navigation-observer";
import { resolveArt } from "./art-resolver";
import { ActiveWordWatcher } from "./active-word-watcher";
import { validateCustomWord } from "../shared/word-validation";

const timer = HintTimer(document);
const celebration = CelebrationManager(document);
ActiveWordWatcher(timer, celebration, document).start();

async function inject(): Promise<void> {
  const activeWord = await getActiveWord();
  if (!activeWord) return;
  if (!activeWord.word || validateCustomWord(activeWord.word) !== undefined) return;

  const settings = await getSettings();
  const groups = ParagraphSelector(document, settings.minWordThreshold);
  if (groups.length === 0) {
    NoParagraphNotification(document).show();
    return;
  }

  const art = resolveArt(activeWord.word, activeWord.list);

  function clearFoundWord(): void {
    document.querySelectorAll(".hw-host").forEach((el) => {
      if (el.querySelector(".hw-word--found")) {
        render(null, el as HTMLElement);
        (el as HTMLElement).remove();
      }
    });
  }

  timer.cancel();
  WordRenderer(activeWord, groups, {
    onFind: async (record) => {
      const current = await getActiveWord();
      if (!current) return; // stale tab — word already found elsewhere
      celebration.show({ word: record.word, durationS: record.searchDurationSeconds, hintUsed: record.hintUsed, art }, undefined, clearFoundWord);
      await saveFind(record);
      await clearActiveWord();
      timer.cancel();
    },
    onReview: (record) => {
      celebration.show({ word: record.word, durationS: record.searchDurationSeconds, hintUsed: record.hintUsed, art }, undefined, clearFoundWord);
    },
    resolveArt,
    hoverRevealSeconds: settings.celebrationHoverSeconds,
  });
  timer.start(settings.hintDelayMinutes);
}

NavigationObserver(window, inject);

inject();
