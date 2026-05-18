# ADR 004 — Streak grace-period rule

**Status:** Accepted
**Date:** 2026-05-18

## Context

The Hunt Collection introduces a per-player `Streak`: the number of consecutive local-calendar days on which the player recorded at least one `HuntRecord`. The natural definition — "the longest contiguous run of days with hunts ending **today**" — has an awkward UX edge case:

> A player hunted every day for two weeks. They open the popup at 8 a.m. before they have hunted today. Under the strict definition, their `current` streak is `0` until they make their first find of the day.

This punishes the player for opening the popup early, and rewards the popup-as-trophy behaviour rather than the play behaviour. We needed a rule that survives the daily "haven't played yet" gap without trivialising streak interruptions.

## Decision

**A one-day grace period.** The `current` streak is computed as:

1. If today has at least one `HuntRecord`, walk backwards from today and count contiguous days. The streak ends when a day with no find is encountered.
2. If today has no find but **yesterday** does, walk backwards from yesterday instead. The streak count therefore equals the run ending yesterday — i.e. the player's "yesterday streak" carries over until midnight today.
3. If neither today nor yesterday has a find, `current = 0`.

`longest` is computed independently as the longest contiguous run anywhere in `HuntRecord` history, irrespective of where it ends.

Days are grouped by **local calendar date** (`YYYY-MM-DD` from `new Date(timestamp)`), so DST transitions and timezone moves do not silently shrink the run.

Implemented in `src/popup/collection/computeStreak.ts`. Locked in by tests in `tests/popup/collection/compute-streak.test.ts` — including a "yesterday-only, none today" test that asserts `current === 1`.

## Considered Options

**Variant A (chosen):** one-day grace period as described above.

**Variant B:** strict definition — `current` ends today, zero if today has no find. The popup would show `0d streak` every morning until the first hunt, then jump back to `Nd streak`.

**Variant C:** rolling window — `current` is the count of days with a find in the trailing 7 days. Smoother, but no longer "consecutive days" — it stops being a streak.

**Variant D:** explicit "streak shield" the player can earn or spend (one missed day per N caught). More gameplay than we want for a quiet reading game.

We chose **Variant A** because:

- It matches how every consumer streak app the team had used (Duolingo, Strava, GitHub) behaves at the day boundary.
- It is trivial to implement and to test (one extra branch in `computeStreak`).
- The grace lasts exactly the calendar day the player hasn't yet hunted on. There is no compounding — if the player skips both today and yesterday, the streak is `0`. The rule does not weaken the underlying "consecutive days" promise; it only widens the window in which "today" is considered.

## Consequences

- A player who hunted yesterday and opens the popup any time before midnight today sees their streak intact.
- A player who misses **two** consecutive days loses the streak; the rule does not compound.
- `longest` is unaffected by the rule — it is always derived from completed history.
- All timezones use the popup's local clock. A player who travels across a date line on the day they break the streak will see the same result they would have seen at home — the local calendar is the player's lived experience of "today", not UTC.
- Tests pin the rule with a fixed `now` argument to `computeStreak`, avoiding any reliance on the test runner's wall-clock time.
- If we ever want a configurable difficulty mode ("hardcore — no grace period"), this rule lives in one place (`computeStreak.ts`) and can be made conditional without touching the UI.
