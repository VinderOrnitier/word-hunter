# Word Hunter — Smoke checklist

End-to-end manual verification. Run after `pnpm build` produces a fresh `dist/`.

## Setup

1. Open `chrome://extensions` → toggle **Developer mode** on.
2. Click **Load unpacked** → select the `dist/` directory in this repo.
3. On the extension card, enable **Allow access to file URLs** (needed because the smoke fixture is served via `file://`).
4. Open `tests/fixtures/smoke-article.html` directly in Chrome (drag the file into a tab, or `file:///…/tests/fixtures/smoke-article.html`).

## Acceptance checks

### Popup — Play tab (Hunt Collection)

- [ ] Toolbar icon opens the popup. Dark theme, Word Hunter wordmark, 3 tabs (Play / Statistics / Settings) + Rules icon in header.
- [ ] **ActiveWord card** at the top shows "No active word — pick a word below to start the hunt." on a fresh profile.
- [ ] **CollectionToolbar** has two chip rows. Top: `Animals | Pokémon` (Animals selected). Bottom: `All | Caught | Uncaught` (All selected). Exactly one chip per row is highlighted.
- [ ] **ProgressHeader** shows `ANIMALS` eyebrow + `0 / 54` (mono), a 0 %-wide progress bar, `0d streak` and `0 catches` chips, and five `AchievementBadge`s — all dimmed (locked).
- [ ] Hover a locked badge → tooltip appears (e.g. "Catch 27 more to reach 50 %", "Hunt 7 days in a row").
- [ ] **CollectionGrid**: 4-column grid of 54 Animals slots, every slot shows `???` in mono.
- [ ] Click the **Fox** slot. ActiveWord card updates to "Fox" with animals badge. The Fox slot gets a primary-yellow glow (`is-active` class).
- [ ] Switch toolbar to **Pokémon** → grid swaps to 5-column, 151 slots, all silhouettes (`brightness(0) opacity(0.35)` on the sprite `<img>`).
- [ ] Scroll the grid — Pokémon sprites lazy-load (`loading="lazy"` on `<img>`).
- [ ] **Custom word block** below the grid: text input with placeholder "type your own…", live counter `0 / 25`, "New word" button (primary yellow), "Clear" button (ghost).
- [ ] **Stats**: shows the editorial empty state ("your hunts will appear here.") in Fraunces italic.
- [ ] **Settings**: range slider for minimum paragraph length (default **30**, range 30–150, step 10) with a mono value badge showing the current value. Two number inputs below: hint delay **5** / celebration hover **1.5**. "Clear all hunts" button visible in danger zone.
- [ ] **Rules**: opens with the Fraunces italic line "a quiet game while you read." and the 3 markers (30 + / 1× / —).

### Hunt Collection — find loop

After finding `Fox` on the smoke article (see "Content script — overlays" below):

- [ ] Reopen the popup. Fox slot is now caught: 🦊 emoji + `×1` counter, no longer dimmed.
- [ ] ActiveWord card returns to the empty state (cleared after the FindEvent).
- [ ] ProgressHeader: `1 / 54`, progress bar ~2 % filled, `1d streak`, `1 catches`. **First catch** achievement is now solid (unlocked, primary-yellow dot).
- [ ] Find Fox again. Slot reads `×2`. Total catches `2 catches`. Streak still `1d`.
- [ ] Filter chips → **Caught**: only Fox is shown in the grid.
- [ ] Filter chips → **Uncaught**: 53 silhouettes, no Fox.
- [ ] Switch to **Pokémon** with the **Caught** filter still selected → empty state appears: "No caught words yet — go hunt!".

### Hunt Collection — custom word isolation

- [ ] In **Animals**, filter **All**. Type `dragon` in the custom block → click **New word**. ActiveWord card shows "dragon" with the neutral (custom) badge. The collection grid is unchanged.
- [ ] Find `dragon` on the smoke article (insert it manually in a paragraph for the smoke check). Reopen the popup: collection still reads `1 / 54` — custom words do **not** count toward the collection.

### Hunt Collection — clear flows

- [ ] **Settings → Clear all hunts → confirm**: open Play tab. Collection resets to `0 / 54`, all achievements locked again, streak `0d`. (Confirms zero denormalisation — see ADR 003.)
- [ ] Set an ActiveWord by clicking any slot, then click **Clear** below the custom block. ActiveWord card returns to the empty state. The slot loses its glow.

### Content script — overlays

- [ ] Reload the smoke article. A `.hw-word` span appears somewhere inside one of the article's prose elements (use DevTools → Elements to confirm). Note: the byline `<p>` is grouped with the three long paragraphs by the ParagraphGroup algorithm, so it can occasionally be the target too.
- [ ] In DevTools → Elements, locate the `.hw-host` span. The **text node immediately after it** must start with a space — confirm by inspecting its `nodeValue` in the console: `document.querySelector('.hw-host').nextSibling.nodeValue`. The word must not run directly into the next word (e.g. `"eagle update"` not `"eagleupdate"`).
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

- [ ] Lower hint delay to `0.05` min (3 s) via DevTools console: `await chrome.storage.local.set({ settings: { hintDelayMinutes: 0.05, celebrationHoverSeconds: 1.5, minWordThreshold: 30 } })`. Reload the smoke article and wait 3 seconds without clicking the hidden word. The `InPageToast` (hint variant) fades in at top-right with the blue dot and the text "The word is hidden on this page."
- [ ] Click the word — `CelebrationPopup` shows `hint used`. Dismiss. Set a **new** word and reload. Find it immediately — popup shows `no hint` (stale hint flag is cleared when a new hunt starts).

### Settings — minWordThreshold slider

- [ ] Open **Settings**. Drag the slider to **150** (max) — the mono value badge next to it updates to `150` in real time.
- [ ] Drag back to **30** — badge shows `30`. Reload the smoke article: the hidden word still appears (the fixture's combined group ~239 words exceeds any slider value).
- [ ] Open a page with moderate-length paragraphs (50–140 words each, e.g. a short blog post). With slider at **30** the word is hidden; drag to **150** and reload — if no paragraph group exceeds 150 combined words, the `InPageToast` (info variant) appears instead.

### No-paragraph toast

- [ ] Open a page with **no qualifying paragraph** (use `tests/fixtures/smoke-short-page.html`) while an ActiveWord is set. The `InPageToast` (info variant) appears at top-center with "Not enough text to hide the word." Dismiss it with the × button. Note: content scripts don't run on `data:` URLs, so use a `file://` or `http://` page.

### Hidden element exclusion

Tests that `ParagraphGroup` skips elements hidden via CSS class rules — not just inline styles.  
Use `tests/fixtures/smoke-hidden-elements.html` (open as a `file://` URL with an ActiveWord already set).

- [ ] The `.hw-word` span appears **only inside `#visible-1` or `#visible-2`**. Confirm in DevTools → Elements; the word must not appear inside `#hidden-display-none`, `#hidden-visibility`, or `#hidden-sr-only`.
- [ ] In DevTools console, run:
  ```js
  document.querySelectorAll('#hidden-display-none .hw-word, #hidden-visibility .hw-word, #hidden-sr-only .hw-word').length
  ```
  Must return **0**.
- [ ] Set the `minWordThreshold` slider to **150** (max) and reload. The hidden word still appears — the visible group's combined word count (~155 words) exceeds 150.
- [ ] To confirm the class-based hiding is what matters, run in console:
  ```js
  getComputedStyle(document.getElementById('hidden-display-none')).display  // → "none"
  getComputedStyle(document.getElementById('hidden-visibility')).visibility  // → "hidden"
  document.getElementById('hidden-sr-only').getBoundingClientRect()          // width: 1, height: 1
  ```

### Stats reactivity

- [ ] Find the word on a fresh article tab. Open the popup → Stats — the new row is visible without manually reopening the popup.

### Clear flows

- [ ] **Settings → Clear all hunts**: `Stats` tab returns to the editorial empty state; the Hunt Collection on the Play tab returns to `0 / N` with every slot a silhouette.
- [ ] **Play → Clear**: the ActiveWord card returns to "No active word"; the previously active slot loses its primary-yellow glow.

## Known issues / limitations

- **React/SPA timing race (issue #30):** On pages where the DOM is built by a client-side framework (e.g. GitHub), `inject()` may run before semantic wrappers (`<nav>`, `<ul>`) are fully mounted around navigation widgets. At that intermediate state `ParagraphSelector` can find `<li>` nodes from sidebars or file trees as qualifying groups, injecting the word into UI chrome instead of prose. Confirmed on `github.com` — the word appeared in the file-tree sidebar `<li>` rather than the README `<p>` content. Proposed fixes: ARIA-role guard in `ParagraphSelector` + DOM-stability delay. Tracked in [#30](https://github.com/VinderOrnitier/word-hunter/issues/30).

## Known fixture quirks

- The article uses `<article>` + 3 `<p>` blocks (77 / 77 / 79 words) plus a `<p class="byline">` (~6 words). The ParagraphGroup algorithm scans siblings: `<h1>` triggers a group flush (BREAK tag), then the byline and all three paragraphs are grouped together into **one group** with ~239 combined words. `WordRenderer` picks a random element from that group, so the target can be the byline or any of the three paragraphs.
- The qualifying threshold is `minWordThreshold` from `GameSettings` (default **30**). The fixture's combined group (239 words) exceeds even the slider maximum of 150, so the no-paragraph toast will never appear on this fixture regardless of the slider value.
- `WordRenderer` skips text nodes whose closest ancestor is `a`, `button`, `code`, `kbd`, `samp`, `var`, `abbr`, or `acronym`. The smoke fixture has none of these in its article body, so all text nodes are eligible.
- The fixture deliberately contains no words from the default Animals or Pokémon lists, so any pick is safe for the Ctrl+F bypass check.
- `smoke-article.html` has **no CSS-class-hidden elements**, so the `getComputedStyle` + bbox guard in `isHidden()` is not exercised by the main article checks. Use `smoke-hidden-elements.html` for that coverage (see "Hidden element exclusion" section above).
- `smoke-hidden-elements.html` contains three hidden elements: `#hidden-display-none` (class-applied `display:none`), `#hidden-visibility` (class-applied `visibility:hidden`), and `#hidden-sr-only` (1 × 1 px `sr-only` clip pattern). Only `#visible-1` and `#visible-2` form a qualifying ParagraphGroup.
