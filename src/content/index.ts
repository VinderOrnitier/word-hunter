import "../shared/styles/tokens.css";
import "../shared/styles/theme-pokedex.css";
import "./styles/overlay.css";
import "./styles/overlay.pdx.css";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
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
  getTheme,
  saveFind,
  setActiveWord,
} from "../shared/storage";
import type { Theme } from "../shared/types";
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

let currentTheme: Theme = "slate";
getTheme().then((th) => {
  currentTheme = th;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.locale?.newValue) {
    currentLocale = changes.locale.newValue as Locale;
  }
  if (changes.theme?.newValue) {
    currentTheme = changes.theme.newValue as Theme;
  }
});

const getLocaleRef = (): Locale => currentLocale;
const getThemeRef = (): Theme => currentTheme;

const timer = HintTimer(document, getLocaleRef, getThemeRef);
const celebration = CelebrationManager(document, getLocaleRef, getThemeRef);
const autoModeToast = AutoModeToast(document, getLocaleRef, getThemeRef);
ActiveWordWatcher(timer, celebration, document).start();

async function inject(): Promise<void> {
  const activeWord = await getActiveWord();
  if (!activeWord) return;
  if (!activeWord.word || validateCustomWord(activeWord.word) !== undefined) return;

  const settings = await getSettings();
  const groups = ParagraphSelector(document, settings.minWordThreshold);
  if (groups.length === 0) {
    if (settings.notificationsEnabled && settings.showNoParagraphToast) {
      NoParagraphNotification(document, getLocaleRef, getThemeRef).show();
    }
    return;
  }

  if (settings.autoContinue && settings.notificationsEnabled && settings.showAutoModeToast) {
    autoModeToast.show();
  }

  const art = resolveArt(activeWord.word, activeWord.list);

  function clearFoundWord(): void {
    document.querySelectorAll(".hw-host").forEach((el) => {
      if (el.querySelector(".hw-word--found, .pdx-highlight--found")) {
        render(null, el as HTMLElement);
        (el as HTMLElement).remove();
      }
    });
  }

  const theme = await getTheme();

  timer.cancel();
  const renderer = WordRenderer(activeWord, groups, {
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
    theme,
  });
  if (settings.notificationsEnabled && settings.showHintToast) {
    timer.start(settings.hintDelayMinutes, renderer.setHinted);
  }
}

NavigationObserver(window, inject);

inject();
