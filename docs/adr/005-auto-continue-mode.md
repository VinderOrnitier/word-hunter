# ADR 005 — Auto-Continue mode: where the next ActiveWord is chosen

**Status:** Accepted
**Date:** 2026-05-19

## Context

The default game loop ends a hunt with `clearActiveWord()` — the player must open the popup to choose the next `Word`. For players who want to "play in the background" while browsing, this is friction: tab → popup → click → close → reload.

`AutoContinueMode` (see [CONTEXT.md](../../CONTEXT.md)) flips this: after a `FindEvent`, the system picks the next `ActiveWord` from the same `WordList` automatically. The player just reloads any page and keeps hunting.

The implementation must answer one architectural question: **where does the next-word selection happen?** Three candidates exist:

- **The content script**, inside the `FindEvent` handler.
- **The popup**, by reacting to a `storage.onChanged` event for `activeWord = null`.
- **The service worker**, by listening to the same change globally.

Each carries trade-offs around latency, complexity, testability, and the multi-tab story (`ActiveWordWatcher` already runs in every content script — see [ADR 001](001-multi-tab-cleanup-and-review-click.md)).

## Decision

**The content script chooses the next word inside the `FindEvent` handler.**

A pure module `src/content/find-handler.ts` exposes `handleFind(record, expectedInsertedAt, deps)`. The content `onFind` callback delegates to it with concrete storage / settings / picker dependencies. The handler:

1. Re-reads `ActiveWord` and the `insertedAt` guard (so a tab whose hunt was resolved elsewhere bails out).
2. Calls `saveFind(record)`.
3. If `settings.autoContinue && isAutoSelectableList(activeWord.list)`:
   - Computes `CatchCount` from existing `HuntRecord[]` for the same list.
   - Calls `pickRandomWord(list, counts)` — the same function the popup's `Start a hunt` CTA uses.
   - Writes the new `ActiveWord` via `setActiveWord(next)`.
   - Returns an optional `next` preview for the celebration popup.
4. Else: calls `clearActiveWord()` (default behavior).

The handler is **the only place** that decides between "clear" and "continue". The content `inject()` entry point stays a thin orchestrator and the popup is uninvolved.

**Custom-word hunts (`WordSource === "custom"`) are excluded** from auto-continue: there is no `WordList` to cycle, and custom hunts are a deliberate one-off gesture. They fall through to the default `clearActiveWord()`.

**`AutoModeToast` lives in the content script** too — it shows during `inject()` when `settings.autoContinue` is on, mutually exclusive with `NoParagraphNotification` (no-paragraph wins).

## Considered Options

**Variant A (chosen):** content script picks the next word in `handleFind`.

**Variant B:** popup picks the next word — content script clears `ActiveWord` as today, and the popup listens for `activeWord === null && settings.autoContinue` and writes the next word. Requires the popup to be open.

**Variant C:** service worker subscribes to `chrome.storage.onChanged` and writes the next word when `activeWord` becomes null and auto-continue is on.

| Concern | Variant A (chosen) | Variant B (popup) | Variant C (service worker) |
| --- | --- | --- | --- |
| Works when popup is closed | ✅ | ❌ — the popup is not always open; the next word would be picked only when the player happens to open it | ✅ |
| Latency between find and "next word visible on reload" | One storage write, sync from the player's view | Indeterminate — until the player opens the popup | One async hop via SW message bus |
| Test surface | Pure function with injected deps — 10 unit tests, no chrome mock needed beyond the deps | Couples popup component to find-event flow; hard to isolate | Requires service-worker mocking; cross-context flow |
| Multi-tab correctness | Reuses `ActiveWordWatcher` + the existing `insertedAt` guard — old tabs clean up their `HiddenWord` and re-inject on next load | Same | Same, plus the SW becomes another writer racing the content script |
| Stale-tab safety (`current.insertedAt` guard) | The handler is the same code path that already enforces the guard for `clearActiveWord` — no new race | Popup writes are not gated by `insertedAt` — risk of overwriting a fresh hunt from another tab | SW would need to re-implement the guard |
| Service-worker complexity | None — no new SW responsibility | None | New: SW now owns gameplay state mutation |

We chose **Variant A** because it has the best latency (player-facing it's effectively zero), the smallest test surface, and zero new responsibilities for the popup or the service worker. The `handleFind` module is also the natural place to keep the "what happens after a find" decision tree — it already lived implicitly inside the `onFind` callback before this change; we just gave it a name.

## Consequences

- **`pickRandomWord` is imported from `src/popup/collection/` by the content script.** This creates a shared module across the popup/content bundles. The pre-existing `word-validation` shared chunk already establishes this pattern; the build remains valid but the chunk name now reflects this module (`pickRandomWord-*.js`). The crx plugin updates the `content_scripts.css` list automatically; see [the smoke-test memory](../../README.md) on chunk-name collisions if the service-worker loader ever breaks.
- **`setActiveWord(next)` instead of `clearActiveWord()`** triggers `ActiveWordWatcher` in every other tab. The watcher already handles the "active word changed" case by cleaning up old `.hw-host` nodes — it does not re-inject; the new word renders on the next page load. This is the same behavior as the player manually picking a new word in the popup today.
- **Celebration timing changed slightly.** Previously `celebration.show(...)` ran before the storage writes; now it runs after `handleFind` resolves (so we can pass the `next` preview into the popup). The storage round-trip is ≤10 ms in practice — acceptable for a confetti popup.
- **`GameSettings` schema gained two booleans** (`autoContinue`, `showNextWordPreview`). Existing settings stores forward-fill via `DEFAULT_SETTINGS`, so no migration is needed.
- **Future-friendly:** the `pickNextWord` dependency is injected, so swapping the random picker for a "sequential" or "weighted" strategy is a single-line change in `inject()` without touching `handleFind`.
