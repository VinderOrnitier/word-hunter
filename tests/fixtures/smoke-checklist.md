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
- [ ] **ActiveWordCard** at the top shows "No active word — pick a word below to start the hunt." on a fresh profile (compact one-line layout with no art square).
- [ ] **List chip group**: `Animals | Pokémon` (Animals selected). **Filter chip group** below the ProgressRow: `All | Caught | Uncaught` (All selected). Exactly one chip per row is highlighted.
- [ ] **ProgressRow** (collapsed): single row with `0/68` count (mono), 0 %-wide progress bar, `0/5` achievement counter (star icon dim), chevron-down. Clicking it expands the accordion.
- [ ] **ProgressRow** (expanded): shows a **Streak** block with `0d current` / `0d longest` and an **Achievements** list of five dimmed pills (`First catch`, `Half-way`, `Master hunter`, `7-day streak`, `30-day streak`). Hover a locked pill → tooltip appears.
- [ ] **CollectionGrid**: 4-column grid of 68 Animals slots, every slot shows `???` in mono.
- [ ] Click the **Fox** slot. ActiveWordCard updates to "Fox" with the animal art (🦊). The Fox slot gets a primary-yellow glow (`is-active` class).
- [ ] Switch the list chips to **Pokémon** → grid swaps to 5-column, 151 slots, all silhouettes (`brightness(0) opacity(0.35)` on the sprite `<img>`).
- [ ] Click the **Pikachu** slot. `ActiveWordCard` updates: art area shows a sprite `<img>` (not an emoji span or pencil icon). Verify in DevTools → Elements: `.wh-active-card__sprite` is present, `src` contains `PokeAPI/sprites`. Switch back to Animals list and click Fox again to continue.
- [ ] Scroll the grid — Pokémon sprites lazy-load (`loading="lazy"` on `<img>`).
- [ ] **BottomActionBar** (pinned at the bottom, edge-to-edge): 4 buttons from left to right — Auto-Continue toggle (refresh icon, `role="switch"`, dim when off / yellow when on), primary `Start a hunt` button (yellow with play icon, disabled until a word is pending), shuffle icon, pencil icon. Clicking `Start a hunt` or the shuffle icon picks a random uncaught word from the active list and sets it as the ActiveWord.
- [ ] **CustomWordModal**: click the pencil icon → modal opens over the popup body with backdrop blur. Input has placeholder "serendipity", live counter `0 / 25`, `Cancel` (ghost) and `Start hunt` (primary). Pressing `Esc`, clicking the backdrop, or the close (×) button closes the modal. Tab cycles focus inside the dialog.
- [ ] **Stats**: shows the editorial empty state ("your hunts will appear here.") in Fraunces italic. A **Clear all hunts** button appears at the bottom once at least one hunt record exists.
- [ ] **Settings**: has the following controls (in order):
  - Range slider **Minimum paragraph length** (default **30**, range 30–150, step 10) — mono value badge updates in real time.
  - Number input **Hint delay** (default **5** min).
  - Number input **Cursor reveal delay** (default **1.5** s).
  - Toggle switch **Reload hint** (default **On**) — prompt to reload after starting a hunt.
  - Toggle switch **Show next word preview** (default **Off**) — reveals next word in the celebration popup when Auto-Continue is on.
  - **Notifications** header with a master toggle switch. Three sub-toggles below it (disabled when master is off): **Auto-Continue started**, **Hint reminder**, **No paragraphs**.
  - Disable the **Notifications** master toggle → all three sub-toggles grey out and become non-interactive. Reload a page with an active word and Auto-Continue on — **no** auto-mode toast appears. Re-enable and reload — toast reappears.
  - When any value is changed a **Save / Cancel** footer bar slides in at the bottom. Clicking Cancel reverts the draft; clicking Save persists it.
- [ ] **Rules**: opens with the Fraunces italic line "a quiet game while you read.", a body paragraph, 3 numbered timeline steps (Pick a word from the list / Press Start a hunt / Reload the page and start reading), a settings row with a gear icon, and a disclaimer paragraph about page compatibility.

### Hunt Collection — find loop

After finding `Fox` on the smoke article (see "Content script — overlays" below):

- [ ] Reopen the popup. Fox slot is now caught: 🦊 emoji + `×1` counter, no longer dimmed.
- [ ] ActiveWordCard returns to the empty state (cleared after the FindEvent).
- [ ] ProgressRow (collapsed): `1/68` count, progress bar ~1 % filled, achievement counter shows `1/5` with a primary-yellow star. Expanding the row reveals the **First catch** pill as solid (unlocked, primary-yellow star).
- [ ] Find Fox again. Slot reads `×2`. ProgressRow still shows `1/68` (catch count, not catches), streak still `1d` in the expanded panel.
- [ ] Filter chips → **Caught**: only Fox is shown in the grid.
- [ ] Filter chips → **Uncaught**: 67 silhouettes, no Fox.
- [ ] Switch to **Pokémon** with the **Caught** filter still selected → empty state appears: "No caught words yet — go hunt!".
- [ ] *(Pokémon catch — requires a real page with a Pokémon name in the text.)* Set **Pikachu** as the active word, find it on any qualifying page. Reopen the popup → Pikachu's slot changes from silhouette to full-colour sprite (no `wh-slot__silhouette` class), with `×1` counter. Filter → **Caught**: Pikachu visible; Filter → **Uncaught**: Pikachu absent.

### Auto-Continue mode

- [ ] Enable Auto-Continue by clicking the refresh icon in `BottomActionBar` — it turns yellow. Set an ActiveWord and reload the smoke article. On page load the **auto-mode toast** ("Auto-Hunter active") appears at the top-right: Word Hunter logo button on the left, the message, and an × button. It auto-dismisses after **4 seconds**. Clicking the × dismisses it immediately.
- [ ] Find the word. `CelebrationPopup` auto-dismisses after the cursor-reveal delay and a new word is set automatically. Reopen the popup → new word is shown in `ActiveWordCard`.
- [ ] With **Show next word preview** on (Settings): find the active word. `CelebrationPopup` shows a **"Next up"** row at the bottom with the upcoming word and its art (or just the word for custom). The row is absent when the setting is off.
- [ ] Disable Auto-Continue. Find the next word — popup does not auto-dismiss; the `BottomActionBar` toggle is dim again.

### Reload hint banner

- [ ] Ensure **Reload hint** is On (Settings). Start a hunt from the popup — a `ReloadHint` banner slides in below the `ActiveWordCard` reading "Reload the page to start hunting". Clicking **Reload** reloads the active tab and dismisses the banner. Clicking the × dismisses it without reloading.

### Hunt Collection — custom word isolation

- [ ] In **Animals**, filter **All**. Click the pencil icon → modal opens. Type `dragon` → click **Start hunt**. Modal closes, ActiveWordCard shows "dragon" (no art square since custom words have no resolved art). The collection grid is unchanged.
- [ ] Find `dragon` on the smoke article (insert it manually in a paragraph for the smoke check). Reopen the popup: collection still reads `1/68` — custom words do **not** count toward the collection.

### Hunt Collection — clear flows

- [ ] **Stats → Clear all hunts → confirm**: open Play tab. Collection resets to `0/68`, all achievements locked again, streak `0d`. (Confirms zero denormalisation — see ADR 003.)
- [ ] Set an ActiveWord by clicking any slot, then click the stop button on the ActiveWordCard. ActiveWordCard returns to the empty state. The slot loses its glow.

### Content script — overlays

- [ ] Reload the smoke article. A `.hw-word` span appears somewhere inside one of the article's prose elements (use DevTools → Elements to confirm). Note: the byline `<p>` is grouped with the three long paragraphs by the ParagraphGroup algorithm, so it can occasionally be the target too.
- [ ] In DevTools → Elements, locate the `.hw-host` span. The **text node immediately after it** must start with a space — confirm by inspecting its `nodeValue` in the console: `document.querySelector('.hw-host').nextSibling.nodeValue`. The word must not run directly into the next word (e.g. `"eagle update"` not `"eagleupdate"`).
- [ ] Press <kbd>Ctrl</kbd>+<kbd>F</kbd> and search for `eagle`. Browser must report **0 matches** on the page — this is the `::before { content: attr(data-char) }` bypass at work.
- [ ] Click the hidden word. `CelebrationPopup` appears with: `Found!`, the word name, the search duration in seconds, and `no hint`. If the active word is from the **Animals** list (e.g. `Eagle`), the emoji (🦅) is visible inside the popup art area. The word's stripe turns green.
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

- [ ] Lower hint delay to `0.05` min (3 s) via DevTools console: `await chrome.storage.local.set({ settings: { hintDelayMinutes: 0.05, celebrationHoverSeconds: 1.5, minWordThreshold: 30, showReloadHint: true, showNextWordPreview: false, notificationsEnabled: true, showAutoModeToast: true, showHintToast: true, showNoParagraphToast: true, autoContinue: false } })`. Reload the smoke article and wait 3 seconds without clicking the hidden word. The `InPageToast` (hint variant) fades in at top-right: a small **Word Hunter logo button** on the left (clicking it opens the popup), the text "The word is hidden on this page.", and an × dismiss button.
- [ ] Click the logo button on the toast — the extension popup opens.
- [ ] Click the word — `CelebrationPopup` shows `hint used`. Dismiss. Set a **new** word and reload. Find it immediately — popup shows `no hint` (stale hint flag is cleared when a new hunt starts).

### Settings — minWordThreshold slider

- [ ] Open **Settings**. Drag the slider to **150** (max) — the mono value badge next to it updates to `150` in real time.
- [ ] Drag back to **30** — badge shows `30`. Reload the smoke article: the hidden word still appears (the fixture's combined group ~239 words exceeds any slider value).
- [ ] Open a page with moderate-length paragraphs (50–140 words each, e.g. a short blog post). With slider at **30** the word is hidden; drag to **150** and reload — if no paragraph group exceeds 150 combined words, the `InPageToast` (info variant) appears instead.

### No-paragraph toast

- [ ] Open a page with **no qualifying paragraph** (use `tests/fixtures/smoke-short-page.html`) while an ActiveWord is set. The `InPageToast` (info variant) appears at top-center with "Not enough text to hide the word." Dismiss it with the × button. Note: content scripts don't run on `data:` URLs, so use a `file://` or `http://` page.
- [ ] After dismissing, reload the same page — a **fresh** toast appears again. The dismissed state does not persist across page loads (each load creates a new notification instance).

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

- [ ] **Stats → Clear all hunts**: `Stats` tab returns to the editorial empty state; the Hunt Collection on the Play tab returns to `0 / N` with every slot a silhouette.
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
