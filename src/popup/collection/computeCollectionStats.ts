import type { CatchCounts, CollectionStats } from "./types";

export function computeCollectionStats(counts: CatchCounts, listLength: number): CollectionStats {
  let totalCatches = 0;
  for (const count of counts.values()) {
    totalCatches += count;
  }
  const caught = counts.size;
  return {
    caught,
    total: listLength,
    totalCatches,
    ratio: listLength === 0 ? 0 : caught / listLength,
  };
}
