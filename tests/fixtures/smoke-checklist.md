# Word Hunter — Smoke checklist

End-to-end manual verification. Run after `pnpm build` produces a fresh `dist/`.

## Setup

1. Open `chrome://extensions` → toggle **Developer mode** on.
2. Click **Load unpacked** → select the `dist/` directory in this repo.
3. On the extension card, enable **Allow access to file URLs** (needed because the smoke fixture is served via `file://`).
4. Open `tests/fixtures/smoke-article.html` directly in Chrome (drag the file into a tab, or `file:///…/tests/fixtures/smoke-article.html`).

## Acceptance checks

### Popup — Play tab

- [ ] Toolbar icon opens the popup. Dark theme, Word Hunter wordmark, 4 tabs visible.
- [ ] **Play**: pick `eagle` from the Animals list → click **New word**. Card shows "Active word: eagle" with an animals badge.
- [ ] **Stats**: shows the editorial empty state ("your hunts will appear here.") in Fraunces italic.
- [ ] **Settings**: range slider for minimum paragraph length (default **30**, range 30–150, step 10) with a mono value badge showing the current value. Two number inputs below: hint delay **5** / celebration hover **1.5**. "Clear all hunts" button visible in danger zone.
- [ ] **Rules**: opens with the Fraunces italic line "a quiet game while you read." and the 3 markers (30 + / 1× / —).

### Content script — overlays

- [ ] Reload the smoke article. A `.hw-word` span appears somewhere inside one of the article's prose elements (use DevTools → Elements to confirm). Note: the byline `<p>` is grouped with the three long paragraphs by the ParagraphGroup algorithm, so it can occasionally be the target too.
- [ ] Press <kbd>Ctrl</kbd>+<kbd>F</kbd> and search for `eagle`. Browser must report **0 matches** on the page — this is the `::before { content: attr(data-char) }` bypass at work.
- [ ] Click the hidden word. `CelebrationPopup` appears with: `Found!`, the word `eagle`, the search duration in seconds, and `no hint`. The word's stripe turns green.
- [ ] Click the dimmed backdrop — popup dismisses. The green-striped word **remains visible** in the text (it is not removed).
- [ ] Click the green word again — `CelebrationPopup` reopens with the same data. A **Remove word** button is visible below the metadata row.
- [ ] Click **Remove word** — popup closes and the green word disappears from the paragraph.
- [ ] Open the popup → **Stats**. Exactly **one** row with `eagle` appears (re-click did not add a duplicate).

### Multi-tab cleanup

Open **two** tabs with `smoke-article.html` before setting a word, then set `eagle` via the popup.

- [ ] Both tabs show a `.hw-word` span.
- [ ] Click the hidden word on **tab 1** — `CelebrationPopup` appears. While the popup is still open, switch to **tab 2**: `.hw-word` is **already gone** (cleanup is immediate, not deferred to popup dismiss).
- [ ] Return to tab 1 — the green word is still present. Dismiss the popup. The green word remains.

### Hint timer

- [ ] Lower hint delay to `0.05` min (3 s) via DevTools console: `await chrome.storage.local.set({ settings: { hintDelayMinutes: 0.05, celebrationHoverSeconds: 1.5, minWordThreshold: 30 } })`. Reload the smoke article and wait 3 seconds without clicking the hidden word. The `HintTooltip` fades in at top-right with the blue dot and the text "The word is hidden on this page".
- [ ] Click the word — `CelebrationPopup` shows `hint used`. Dismiss. Set a **new** word and reload. Find it immediately — popup shows `no hint` (stale hint flag is cleared when a new hunt starts).

### Settings — minWordThreshold slider

- [ ] Open **Settings**. Drag the slider to **150** (max) — the mono value badge next to it updates to `150` in real time.
- [ ] Drag back to **30** — badge shows `30`. Reload the smoke article: the hidden word still appears (the fixture's combined group ~239 words exceeds any slider value).
- [ ] Open a page with moderate-length paragraphs (50–140 words each, e.g. a short blog post). With slider at **30** the word is hidden; drag to **150** and reload — if no paragraph group exceeds 150 combined words, the NoParagraphBanner appears instead.

### NoParagraphBanner

- [ ] Open a page with **no qualifying paragraph** (use `tests/fixtures/smoke-short-page.html`) while an ActiveWord is set. A banner appears at top-center for 3 seconds then auto-removes. Note: content scripts don't run on `data:` URLs, so use a `file://` or `http://` page.

### Stats reactivity

- [ ] Find the word on a fresh article tab. Open the popup → Stats — the new row is visible without manually reopening the popup.

### Clear flows

- [ ] **Settings → Clear all hunts**: `Stats` tab returns to the editorial empty state.
- [ ] **Play → Clear**: the ActiveWord card returns to "No active word".

## Known fixture quirks

- The article uses `<article>` + 3 `<p>` blocks (77 / 77 / 79 words) plus a `<p class="byline">` (~6 words). The ParagraphGroup algorithm scans siblings: `<h1>` triggers a group flush (BREAK tag), then the byline and all three paragraphs are grouped together into **one group** with ~239 combined words. `WordRenderer` picks a random element from that group, so the target can be the byline or any of the three paragraphs.
- The qualifying threshold is `minWordThreshold` from `GameSettings` (default **30**). The fixture's combined group (239 words) exceeds even the slider maximum of 150, so the NoParagraphBanner will never appear on this fixture regardless of the slider value.
- `WordRenderer` skips text nodes whose closest ancestor is `a`, `button`, `code`, `kbd`, `samp`, `var`, `abbr`, or `acronym`. The smoke fixture has none of these in its article body, so all text nodes are eligible.
- The fixture deliberately contains no words from the default Animals or Pokémon lists, so any pick is safe for the Ctrl+F bypass check.
