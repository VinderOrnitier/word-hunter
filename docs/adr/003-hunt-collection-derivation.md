# ADR 003 — Hunt Collection derived on-the-fly from HuntRecord[]

**Status:** Accepted
**Date:** 2026-05-18

## Context

Adding the Hunt Collection (the Pokédex-style Play tab) introduced four new pieces of state that the UI needs on every popup render:

- `CatchCount` — per-Word catch totals for the active WordList
- `CollectionStats` — `caught`, `total`, `totalCatches`, `ratio`
- `Streak` — `current` and `longest` consecutive-day counts
- `Achievement[]` — five unlock-state badges

These can all be computed from the data we already store: `HuntRecord[]` (already includes a `list?: WordSource` field — see ADR 002 and `src/shared/types.ts`) and the static `WORD_LISTS` arrays.

The original design proposal included a denormalised `collection` storage key (e.g. `{ animals: { caught: Map, totalCatches, … }, pokemon: { … }, streak, achievements }`) that would be updated on every `FindEvent` and on every "Clear all hunts" action.

## Decision

**Derive every piece of collection state on-the-fly from `HuntRecord[]`.** No new `chrome.storage.local` keys. No update hooks on `FindEvent`. No backfill migration on extension load.

Four pure functions in `src/popup/collection/`:

- `computeCatchCounts(finds, list)` — single O(N) pass, builds the canonical case-insensitive lookup from `WORD_LISTS[list]` and counts only records whose `list` matches.
- `computeCollectionStats(counts, listLength)` — pure aggregation.
- `computeStreak(finds, now)` — local-date grouping with a grace-period rule (see [ADR 004](004-streak-grace-period.md)).
- `listAchievements(stats, streak)` — pure derivation, stable order.

`PlayTab` reads `finds` via the existing reactive `useStorage("finds", [])` hook and memoises the four derivations with `useMemo` keyed on `[finds, list]`. When a hunt is found, `storage.onChanged` fires, `useStorage` re-renders, the four `useMemo`s recompute, the grid updates. When the user clicks **Clear all hunts** in Settings, the same path drives a reset to `0 / N` automatically.

## Considered Options

**Variant A (chosen):** derive on-the-fly.

**Variant B:** denormalised `collection` key in `chrome.storage.local`, updated on every `FindEvent` and on Clear-all.

| Concern | Variant A (chosen) | Variant B (denormalised) |
| --- | --- | --- |
| Stale state | Impossible — there is no separate state | Likely — every code path that writes `finds` must remember to update `collection` |
| `Clear all hunts` parity | Free | Requires a parallel clear path; bug-prone (missed in 2 of 3 early prototypes) |
| Storage migration | None | Every schema change to `HuntRecord` may need a recompute migration |
| Worst-case cost | One O(N) pass over `finds` per popup open, where N ≤ a few thousand realistically | One O(1) write per `FindEvent`, one O(1) read per popup open |
| Test surface | Four small pure functions, ~25 tests total | Pure functions **plus** every storage-mutating code path needs to be tested for the side-effect |
| Code locality | All collection logic lives in `src/popup/collection/` | Spread across `src/popup/collection/`, `src/content/index.ts` (`onFind`), `src/popup/tabs/StatsTab.tsx` (Clear-all), and storage migration code |

The performance trade-off is the only one that favours Variant B, and at the scale of `HuntRecord[]` we expect (≤ a few thousand entries per player over years), an O(N) `for` loop over a flat array on popup open is invisible. We accept it in exchange for the "one source of truth" property.

## Consequences

- The Hunt Collection cannot drift from the statistics table. The two tabs read the same `finds` array; what one shows the other agrees with.
- `Clear all hunts` automatically resets the collection, streak, and achievements without any additional code. This is exercised in the smoke checklist.
- There is no migration to write when adding new derivation logic. Adding, say, a `7-catches-in-a-day` achievement is a one-file change in `listAchievements.ts`.
- The popup re-derives everything on every storage change. `useMemo` keyed on `[finds, list]` keeps the cost amortised — the 151-slot Pokémon grid re-renders only when `finds` actually changes, not when only `activeWord` changes.
- Legacy `HuntRecord` entries without a `list` field (pre-WordSource) are ignored by `computeCatchCounts` — a deliberate safety, since we cannot know which list they belonged to. They still appear in the statistics table.
- A future per-WordList history view would also derive directly from `finds`. There is no precedent of "you must denormalise this" that this ADR establishes against.
