# ADR 001 — Multi-tab cleanup timing and review re-click

**Status:** Accepted  
**Date:** 2026-05-14

## Context

When the player finds the ActiveWord, the CelebrationPopup appears. The original implementation called `clearActiveWord()` only after the player dismissed the popup (`afterDismiss` callback). This meant:

- Other open tabs kept the HiddenWord visible while the popup was open on the found tab — up to several seconds of stale state.
- When the popup was dismissed, `ActiveWordWatcher` removed the `.hw-host` from **all** tabs including the found tab, so the player could not revisit the popup.

Two problems were identified:
1. Other tabs should clear as soon as the word is found, not when the popup is dismissed.
2. The player should be able to re-click the found word to review the CelebrationPopup (e.g. to see the art image again).

## Decision

**Immediate cleanup on FindEvent:**  
`clearActiveWord()` is called right after `saveFind()`, inside the `onFind` handler — before the player has dismissed the popup. `ActiveWordWatcher` on all other tabs fires instantly and removes their `.hw-host`.

**Preserve the found tab:**  
`ActiveWordWatcher` skips any `.hw-host` that contains a `.hw-word--found` element. The found tab keeps the HiddenWord in its green "found" stripe state.

**Review re-click:**  
`HiddenWordHost` now accepts an optional `onReview` callback. On the first click it fires `onFind` (records stats, shows popup). On subsequent clicks it fires `onReview` with the original `HuntRecord` — which shows the CelebrationPopup again without saving to statistics. `WordRenderer` passes `onReview` through to `HiddenWordHost`.

**Art resolved eagerly:**  
`resolveArt` is called once at the start of `inject()` and captured in closure scope, so both `onFind` and `onReview` can pass the same art URL to `CelebrationPopup` even after `activeWord` is no longer in storage.

## Consequences

- Other tabs clear the moment the player clicks, not when they close the popup — no stale HiddenWords visible while the CelebrationPopup is open elsewhere.
- The found tab retains the word indefinitely (until next word hunt or page reload).
- Re-clicking the found word shows the CelebrationPopup for review; `HuntRecord` is not written again.
- `HintTimer.start()` now clears the `hw-hint-used` sessionStorage key — stale hint flags from a previous hunt no longer carry over to the next word.
