import type { HuntRecord } from "../../shared/types";
import { WORD_LISTS, type WordListName } from "../word-lists";
import type { CatchCounts } from "./types";

export function computeCatchCounts(
  finds: ReadonlyArray<HuntRecord>,
  list: WordListName,
): CatchCounts {
  const canonical = new Map<string, string>();
  for (const word of WORD_LISTS[list]) {
    canonical.set(word.toLowerCase(), word);
  }
  const counts: CatchCounts = new Map();
  for (const find of finds) {
    if (find.list !== list) continue;
    const key = canonical.get(find.word.toLowerCase());
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
