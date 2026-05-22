import { computeCatchCounts } from "../popup/collection/computeCatchCounts";
import type { CatchCounts } from "../popup/collection/types";
import type { WordListName } from "../popup/word-lists";
import type { ActiveWord, GameSettings, HuntRecord, WordSource } from "../shared/types";

export interface FindHandlerDeps {
  getActiveWord: () => Promise<ActiveWord | null>;
  setActiveWord: (w: ActiveWord) => Promise<void>;
  clearActiveWord: () => Promise<void>;
  saveFind: (r: HuntRecord) => Promise<void>;
  getSettings: () => Promise<GameSettings>;
  getFinds: () => Promise<HuntRecord[]>;
  pickNextWord: (list: WordListName, counts: CatchCounts) => string;
  resolveArt: (word: string, list?: WordSource) => string | undefined;
  now: () => number;
}

export interface FindHandlerResult {
  proceeded: boolean;
  next?: { word: string; art?: string };
}

function isAutoSelectableList(list: WordSource | undefined): list is WordListName {
  return list === "animals" || list === "pokemon";
}

export async function handleFind(
  record: HuntRecord,
  expectedInsertedAt: number,
  deps: FindHandlerDeps
): Promise<FindHandlerResult> {
  const current = await deps.getActiveWord();
  if (current === null) return { proceeded: false };
  if (current.insertedAt !== expectedInsertedAt) return { proceeded: false };

  await deps.saveFind(record);

  const settings = await deps.getSettings();
  const list = current.list;

  if (settings.autoContinue && isAutoSelectableList(list)) {
    const finds = await deps.getFinds();
    const counts = computeCatchCounts(finds, list);
    const nextWord = deps.pickNextWord(list, counts);
    await deps.setActiveWord({
      word: nextWord,
      list,
      insertedAt: deps.now(),
    });
    if (settings.showNextWordPreview) {
      return {
        proceeded: true,
        next: { word: nextWord, art: deps.resolveArt(nextWord, list) },
      };
    }
    return { proceeded: true };
  }

  await deps.clearActiveWord();
  return { proceeded: true };
}
