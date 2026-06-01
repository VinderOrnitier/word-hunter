# Pokédex Theme — Phase 6 (a11y / reduced-motion / smoke / PR) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out the Pokédex theme initiative: make the forked Pokédex surfaces respect `prefers-reduced-motion`, give every interactive Pokédex control a consistent visible keyboard-focus indicator, extend the manual smoke checklist to cover both themes, then open the PR to merge the whole theme to master.

**Architecture:** CSS-only a11y hardening on the forked `popup.pdx.css` / `overlay.pdx.css` (the shared `theme-pokedex.css` already ships a reduced-motion block for `.pdx-key`/`.pdx-slot`; Slate `popup.css` already has its own). Plus a docs update to the smoke checklist and a final verification + PR. No component logic changes.

**Tech Stack:** CSS custom properties (`--pdx-*`); Markdown checklist; `pnpm typecheck/test/build`; superpowers:finishing-a-development-branch for the PR.

---

### Task 6.1: Reduced-motion for the forked popup surface

**Files:**
- Modify: `src/popup/styles/popup.pdx.css` (append at end of file)

**Context:** `popup.pdx.css` has exactly one motion transition not covered by any reduced-motion block — `.pdx-switch-mini__cap` (`transition: transform …` at ~line 1354, the toggle slide). The reduced-motion block in `theme-pokedex.css` only resets `.pdx-key`/`.pdx-slot`. `overlay.pdx.css` has NO transitions/animations (toasts and celebration appear instantly), so it needs no reduced-motion block.

- [ ] **Step 1: Append the reduced-motion block**

```css

/* ---------- Reduced motion (Phase 6) ----------
   theme-pokedex.css already resets .pdx-key/.pdx-slot transforms; this
   covers the one motion transition local to the forked popup surface. */
@media (prefers-reduced-motion: reduce) {
  .pdx-switch-mini__cap {
    transition: none;
  }
}
```

- [ ] **Step 2: Verify the toggle still works visually (logic unaffected) and build compiles**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(pokedex): honour prefers-reduced-motion on the settings switch"
```

---

### Task 6.2: Consistent keyboard-focus indicator on Pokédex controls

**Files:**
- Modify: `src/popup/styles/popup.pdx.css` (append at end, after the reduced-motion block)
- Modify: `src/content/styles/overlay.pdx.css` (append at end)

**Context:** Only `.pdx-select` currently has a themed `:focus-visible` style. Every other interactive Pokédex control (tabs, header Rules button, collection slots, keys, mini-switch, stepper keys, theme tiles, action-bar buttons, modal buttons, footer buttons, and the in-page toast/celebration buttons) falls back to the browser default ring. No element resets `outline`, so keyboard focus is not broken — this task makes the indicator consistent with the pixel aesthetic (yellow LED ring, matching `.pdx-select`). A single grouped descendant rule per file keeps it robust against future markup without enumerating every class.

- [ ] **Step 1: Append the popup focus rule to `popup.pdx.css`**

```css

/* ---------- Keyboard focus indicator (Phase 6) ----------
   Unified pixel-yellow focus ring for every interactive control inside the
   Pokédex popup (the modal renders inside .pdx-popup too). Matches the
   existing .pdx-select:focus-visible treatment. */
.pdx-popup button:focus-visible,
.pdx-popup a:focus-visible,
.pdx-popup [tabindex]:focus-visible {
  outline: 2px solid var(--pdx-led-yellow);
  outline-offset: 1px;
  border-radius: 2px;
}
```

- [ ] **Step 2: Append the overlay focus rule to `overlay.pdx.css`**

```css

/* ---------- Keyboard focus indicator (Phase 6) ----------
   Same pixel-yellow ring for the in-page toast and celebration controls,
   which mount under a `.pdx` host outside .pdx-popup. */
.pdx-toast button:focus-visible,
.pdx-celebration-overlay button:focus-visible {
  outline: 2px solid var(--pdx-led-yellow);
  outline-offset: 1px;
  border-radius: 2px;
}
```

- [ ] **Step 3: Build + run the full suite (no test asserts CSS focus; confirm nothing regressed)**

Run: `pnpm build && pnpm test`
Expected: PASS (89 suites)

- [ ] **Step 4: Commit**

```bash
git add src/popup/styles/popup.pdx.css src/content/styles/overlay.pdx.css
git commit -m "feat(pokedex): add a consistent keyboard-focus ring to all controls"
```

---

### Task 6.3: Extend the smoke checklist for both themes

**Files:**
- Modify: `tests/fixtures/smoke-checklist.md`

**Context:** The checklist is Slate-only. Add a theme-switch step plus a focused Pokédex pass that re-verifies the surfaces most likely to break under the fork (device chrome, LCD controls, in-page overlays), without duplicating every Slate assertion.

- [ ] **Step 1: Add a theme-switch note to the Setup section**

After the existing Setup step 4 (open the fixture), append:

```markdown
5. **Theme:** the extension ships two themes (**Slate** default, **Pokédex**). Switch in **Settings → Theme** (click a tile, then reopen the popup) or via DevTools console: `await chrome.storage.local.set({ theme: "pokedex" })` (then reopen). Run the **whole** checklist once per theme; the Pokédex-specific section below covers the forked surfaces that need extra scrutiny.
```

- [ ] **Step 2: Append a new "Pokédex theme" section before "Known issues / limitations"**

```markdown
### Pokédex theme (run after switching `theme` to `pokedex` and reopening)

**Popup chrome**

- [ ] Popup renders as a raspberry game-device shell: lens + 3 LEDs (red/green/yellow) in the header, pixel `WORD HUNTER` wordmark, cream key-cap tabs (`PLAY` / `STATS` / `SETS`), a ridge strip, and a cyan LCD body well. No Slate (flat dark) chrome leaks through.
- [ ] **Theme picker** (Settings, first field): two preview tiles — a dark **SLATE** tile (yellow accent bar) and a raspberry **POKEDEX** tile (cyan accent bar). The active theme's tile has the golden frame/glow. Helper line reads "switching reopens the popup". Click **SLATE** → reopen → the popup is back to the Slate skin (round-trip works).

**LCD form controls (Settings)**

- [ ] **MIN PARAGRAPH** is a 12-cell LCD strip with a numeric chip; dragging fills cells left-to-right and the chip tracks the value. **HINT DELAY** / **CURSOR REVEAL** are keys-only steppers (minus / LCD value+unit / plus) — no text field. **RELOAD HINT** / **SHOW NEXT WORD** / the notification toggles are mini key-cap switches showing OFF/ON. Changing any value slides up the LCD footer with an `UNSAVED EDITS` message + Cancel/Save keys.

**Keyboard + motion a11y**

- [ ] Tab through the popup: every focusable control (tabs, slots, action-bar buttons, switches, stepper keys, theme tiles, modal buttons) shows a **yellow focus ring**. No control is unreachable or invisibly focused.
- [ ] In OS settings enable "reduce motion" (or DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`). Toggle a settings switch — it changes state **without** the sliding cap animation; key/slot press no longer lifts. Colours and state still update.

**In-page overlays**

- [ ] On the smoke article with `theme: "pokedex"`: the hidden word renders as an LED lit-cell highlight (reversed text, `.pdx-highlight`), and Ctrl+F for the word still reports **0 matches**.
- [ ] Trigger the hint toast (lower hint delay) → `.pdx-toast` device-chrome toast at top-right with a lens button, the message, and a cream key-cap close. The find key (when present) is a cream pixel key.
- [ ] Find the word → `.pdx-celebration` centred LCD device over a dark scrim: lens + LEDs header, `REGISTERED!`-style found cue (green) + the word on the LCD, duration/hint meta. Clicking the backdrop dismisses; re-clicking the green word reopens with a **Clear/Remove** key. With **Show next word preview** on + Auto-Continue, a `.pdx-next` pill shows the upcoming word.
- [ ] Switch `theme` back to `slate`, reload the article → overlays render in the original Slate skin (no `.pdx-*` classes leak).
```

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/smoke-checklist.md
git commit -m "docs(smoke): extend checklist to cover the Pokedex theme"
```

---

### Task 6.4: Final verification + open the PR

**Files:** none (verification + PR only)

- [ ] **Step 1: Full green gate**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: PASS — typecheck clean, 89 suites pass, build succeeds.

- [ ] **Step 2: Confirm the Slate-touch surface is exactly as intended**

Run: `git diff --stat master -- src/ | grep -v pdx`
Expected: the only non-`.pdx` source files changed across the whole branch are the intentional shared ones — `SettingsTab.tsx`, `popup.css` (theme picker, Phase 5), `Icon.tsx` (theme branch, Phase 1), `App.tsx` (shell fork, Phase 2a), the content wiring (`index.ts`, `word-renderer.ts`, `HiddenWordHost.tsx`, `mount-toast.ts`, `celebration-manager.ts`, `hint-timer.ts`, `auto-mode-toast.ts`, `no-paragraph-notification.ts`), `types.ts`/`constants.ts`/`storage.ts` (theme key), i18n message files, and the shared CSS/font entry points. No *other* Slate component `.tsx` should appear. Investigate anything unexpected before opening the PR.

- [ ] **Step 3: Open the PR via the finishing-a-development-branch skill**

Invoke **superpowers:finishing-a-development-branch**. Present the merge/PR options to the user; on their choice, push `claude/vigorous-nash-817b43` and open a PR titled `feat: add the Pokédex theme (parallel skin)` summarising Phases 0–6, linking ADR 007, and noting: parallel-skins architecture, user-switchable from both skins, Slate behaviour preserved (only the shared theme-picker + plumbing touch Slate files), all suites green, manual smoke checklist covers both themes. CI must be green; squash-merge per the repo workflow.

---

## Self-Review

- **Spec coverage:** reduced-motion (6.1 popup; overlays have none; theme-pokedex.css + popup.css already covered), focus a11y (6.2 popup + overlays), smoke both themes (6.3), PR (6.4). ✓
- **No placeholders:** every CSS/markdown block is concrete; commands explicit. ✓
- **Token consistency:** `--pdx-led-yellow` is the same token `.pdx-select:focus-visible` already uses. ✓
- **Risk:** focus/reduced-motion can't be asserted in jsdom — verified via build + the new manual checklist items (6.3), which is the appropriate tool for CSS-state behaviour.
