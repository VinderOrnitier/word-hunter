import "../shared/styles/tokens.css";
import "./styles/overlay.css";
import { render } from "preact";
import type { Locale } from "../i18n";
import { getLocale as readLocale } from "../i18n";
import { pickRandomWord } from "../popup/collection/pickRandomWord";
import { resolveArt } from "../shared/art-resolver";
import {
  clearActiveWord,
  getActiveWord,
  getFinds,
  getSettings,
  saveFind,
  setActiveWord,
} from "../shared/storage";
import { validateCustomWord } from "../shared/word-validation";
import { ActiveWordWatcher } from "./active-word-watcher";
import { AutoModeToast } from "./auto-mode-toast";
import { CelebrationManager } from "./celebration-manager";
import { handleFind } from "./find-handler";
import { HintTimer } from "./hint-timer";
import { NavigationObserver } from "./navigation-observer";
import { NoParagraphNotification } from "./no-paragraph-notification";
import { ParagraphSelector } from "./paragraph-selector";
import { WordRenderer } from "./word-renderer";

let currentLocale: Locale = "en";
readLocale().then((l) => {
  currentLocale = l;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.locale?.newValue) {
    currentLocale = changes.locale.newValue as Locale;
  }
});

const getLocaleRef = (): Locale => currentLocale;

const timer = HintTimer(document, getLocaleRef);
const celebration = CelebrationManager(document, getLocaleRef);
const autoModeToast = AutoModeToast(document, getLocaleRef);
ActiveWordWatcher(timer, celebration, document).start();

async function inject(): Promise<void> {
  const activeWord = await getActiveWord();
  if (!activeWord) return;
  if (!activeWord.word || validateCustomWord(activeWord.word) !== undefined) return;

  const settings = await getSettings();
  const groups = ParagraphSelector(document, settings.minWordThreshold);
  if (groups.length === 0) {
    if (settings.notificationsEnabled && settings.showNoParagraphToast) {
      NoParagraphNotification(document, getLocaleRef).show();
    }
    return;
  }

  if (settings.autoContinue && settings.notificationsEnabled && settings.showAutoModeToast) {
    autoModeToast.show();
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
      const result = await handleFind(record, activeWord.insertedAt, {
        getActiveWord,
        setActiveWord,
        clearActiveWord,
        saveFind,
        getSettings,
        getFinds,
        pickNextWord: pickRandomWord,
        resolveArt,
        now: () => Date.now(),
      });
      if (!result.proceeded) return;
      celebration.show(
        {
          word: record.word,
          durationS: record.searchDurationSeconds,
          hintUsed: record.hintUsed,
          art,
          next: result.next,
        },
        undefined,
        clearFoundWord
      );
      timer.cancel();
    },
    onReview: (record) => {
      celebration.show(
        {
          word: record.word,
          durationS: record.searchDurationSeconds,
          hintUsed: record.hintUsed,
          art,
        },
        undefined,
        clearFoundWord
      );
    },
    resolveArt,
    hoverRevealSeconds: settings.celebrationHoverSeconds,
  });
  if (settings.notificationsEnabled && settings.showHintToast) {
    timer.start(settings.hintDelayMinutes);
  }
}

NavigationObserver(window, inject);

inject();
