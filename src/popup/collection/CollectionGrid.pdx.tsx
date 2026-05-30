import type { JSX } from "preact";
import { useT } from "../../i18n";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { CollectionSlotPdx } from "./CollectionSlot.pdx";
import type { CatchCounts, CollectionFilter } from "./types";

interface CollectionGridProps {
  list: WordListName;
  filter: CollectionFilter;
  counts: CatchCounts;
  activeWord: string | null;
  pendingWord?: string | null;
  onPick: (word: string) => void;
}

export function CollectionGridPdx({
  list,
  filter,
  counts,
  activeWord,
  pendingWord,
  onPick,
}: CollectionGridProps): JSX.Element {
  const t = useT();
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
      filter === "caught" ? t("pdx_collection_empty_caught") : t("pdx_collection_empty_uncaught");
    return <div class="pdx-collection-empty">{message}</div>;
  }

  return (
    <div class={`pdx-grid pdx-grid--${list}`}>
      {slots.map(({ word, count }) => (
        <CollectionSlotPdx
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
