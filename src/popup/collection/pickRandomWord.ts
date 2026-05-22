import { WORD_LISTS, type WordListName } from "../word-lists";
import type { CatchCounts } from "./types";

export type PickMode = "any" | "uncaught";

export function pickRandomWord(
  list: WordListName,
  counts: CatchCounts,
  mode: PickMode = "uncaught"
): string {
  const all = WORD_LISTS[list];
  let pool = all;
  if (mode === "uncaught") {
    pool = all.filter((w) => (counts.get(w) ?? 0) === 0);
    if (pool.length === 0) pool = all;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
