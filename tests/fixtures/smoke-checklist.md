# Word Hunter — Smoke checklist

End-to-end manual verification of the Phase 2 build. Run after `pnpm build` produces a fresh `dist/`.

## Setup

1. Open `chrome://extensions` → toggle **Developer mode** on.
2. Click **Load unpacked** → select the `dist/` directory in this repo.
3. On the extension card, enable **Allow access to file URLs** (needed because the smoke fixture is served via `file://`).
4. Open `tests/fixtures/smoke-article.html` directly in Chrome (drag the file into a tab, or `file:///…/tests/fixtures/smoke-article.html`).

## Acceptance checks

### Popup — Play tab (#16, #18, #19, #20)

- [ ] Toolbar icon opens the popup. Dark theme, Word Hunter wordmark, 4 tabs visible.
- [ ] **Play**: pick `eagle` from the Animals list → click **New word**. Card shows "Active word: eagle" with an animals badge.
- [ ] **Stats**: shows the editorial empty state ("your hunts will appear here.") in Fraunces italic.
- [ ] **Settings**: two number inputs with current values (5 / 1.5). "Clear all hunts" button visible in danger zone.
- [ ] **Rules**: opens with the Fraunces italic line "a quiet game while you read." and the 3 markers (50 + / 1× / —).

### Content script — overlays (#17, #21, #22)

- [ ] Reload the smoke article. A `.hw-word` span appears somewhere inside one of the three long paragraphs (use DevTools → Elements to confirm).
- [ ] Press <kbd>Ctrl</kbd>+<kbd>F</kbd> and search for `eagle`. Browser must report **0 matches** on the page — this is the `::before { content: attr(data-char) }` bypass at work.
- [ ] Click the hidden word. `CelebrationPopup` appears centred with: `Found!`, the word `eagle`, the search duration in seconds, and `no hint`. The word's stripe turns green.
- [ ] Click the dimmed backdrop — popup dismisses.
- [ ] Open the popup → **Stats**. A row with `eagle`, the duration, `—` for hint, and a link back to the article appears.

### Hint timer (#21)

- [ ] In **Settings** lower hint delay to `0.05` min (3 s). Reload the smoke article and wait 3 seconds without clicking the hidden word. The `HintTooltip` fades in at top-right with the blue dot and the text "The word is hidden on this page".

### NoParagraphBanner (#21)

- [ ] Open a page with **no qualifying paragraph** (e.g. an empty `about:blank`, the Chrome new-tab page, or any short-text page) while an ActiveWord is set. A banner appears at top-center for 3 seconds then auto-removes.

### Stats reactivity

- [ ] Find the word again on a fresh article tab (any long-text page works). Open the popup → Stats — the new row is visible without manually reopening the popup.

### Clear flows

- [ ] **Settings → Clear all hunts**: `Stats` tab returns to the editorial empty state.
- [ ] **Play → Clear**: the ActiveWord card returns to "No active word".

## Known fixture quirks

- The article uses `<article>` + 3 `<p>` blocks (77 / 77 / 79 words). `ParagraphSelector` qualifies all four; `WordRenderer` picks one at random, so reloading lands the HiddenWord in different paragraphs across runs.
- The fixture deliberately contains no words from the default Animals or Pokémon lists, so any pick is safe for the Ctrl+F bypass check.
