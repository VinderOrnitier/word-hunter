import type { JSX } from "preact";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { CollectionSlot } from "./CollectionSlot";
import type { CatchCounts, CollectionFilter } from "./types";

interface CollectionGridProps {
  list: WordListName;
  filter: CollectionFilter;
  counts: CatchCounts;
  activeWord: string | null;
  pendingWord?: string | null;
  onPick: (word: string) => void;
}

export function CollectionGrid({
  list,
  filter,
  counts,
  activeWord,
  pendingWord,
  onPick,
}: CollectionGridProps): JSX.Element {
  const words = WORD_LISTS[list];
  const slots = words
    .map((word) => ({ word, count: counts.get(word) ?? 0 }))
    .filter(({ count }) => {
      if (filter === "caught") return count > 0;
      if (filter === "uncaught") return count === 0;
      return true;
    });

  if (slots.length === 0) {
    const message =
      filter === "caught" ? "No caught words yet — go hunt!" : "Every word in this list is caught.";
    return <div class="wh-collection-empty">{message}</div>;
  }

  return (
    <div class={`wh-grid wh-grid--${list}`}>
      {slots.map(({ word, count }) => (
        <CollectionSlot
          key={word}
          word={word}
          source={list}
          count={count}
          isActive={activeWord === word}
          isPending={(pendingWord ?? null) === word}
          onClick={() => onPick(word)}
        />
      ))}
    </div>
  );
}
