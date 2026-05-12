import "../shared/styles/tokens.css";
import "./styles/overlay.css";
import { getActiveWord, getSettings, saveFind } from "../shared/storage";
import { ParagraphSelector } from "./paragraph-selector";
import { WordRenderer } from "./word-renderer";
import { HintTimer } from "./hint-timer";
import { NoParagraphNotification } from "./no-paragraph-notification";
import { NavigationObserver } from "./navigation-observer";
import { createArtResolver } from "./art-resolver";

const pokemonImages = import.meta.glob<string>("../assets/pokemon/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const resolveArt = createArtResolver(pokemonImages);

const timer = HintTimer(document);

async function inject(): Promise<void> {
  const activeWord = await getActiveWord();
  if (!activeWord) return;

  const paragraphs = ParagraphSelector(document);
  if (paragraphs.length === 0) {
    NoParagraphNotification(document).show();
    return;
  }

  timer.cancel();
  WordRenderer(activeWord, paragraphs, { onFind: saveFind, resolveArt });
  const settings = await getSettings();
  timer.start(settings.hintDelayMinutes);
}

NavigationObserver(window, inject);

inject();
