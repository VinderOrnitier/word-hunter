# Pokédex Theme — Phase 2b (Play Content Forks) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the Play-tab content surface into Pokédex sibling components (`.pdx.tsx`) so the LCD body well shows the device-accurate Play screen (ActiveWordCard, list selector, progress, filter, collection grid) with a sticky raspberry action bar outside the LCD — without touching any Slate behaviour.

**Architecture:** Parallel skins (ADR 007). Each Slate Play child gets a `*.pdx.tsx` sibling that shares the same props/data but renders the Pokédex DOM shape. A new `PlayTab.pdx.tsx` is the logic owner: it duplicates `PlayTab.tsx`'s hooks/state and renders the Pokédex tree, including its own `.pdx-popup__body` well and the `.pdx-popup__action-bar` (which the design places as a sibling of the LCD body, not inside it). `App.tsx`'s Pokédex branch routes the Play tab to `PlayTab.pdx` and keeps the generic body well for the not-yet-forked tabs. Content CSS is appended to `src/popup/styles/popup.pdx.css`, mirrored from the kit `popup.css`.

**Tech Stack:** Vite + Preact + TypeScript, Jest + jsdom + @testing-library/preact, biome, pnpm.

**Out of scope (deferred):** `CustomWordModal.pdx` and `ReloadHint.pdx` are Phase 2c. In 2b, `PlayTab.pdx` renders the existing Slate `CustomWordModal` and `ReloadHint` wrapped in a `<div class="wh">` bridge so those features stay functional; 2c replaces them.

**Source of truth:** `design-system/preview/pokedex/play-tab.html` (states 1–3), `design-system/ui_kits/extension-popup-pokedex/popup.css`, `design-system/themes/POKEDEX-IMPLEMENTATION.md` §5 + traps.

---

## File Structure

**Create:**
- `src/popup/play/ActiveWordCard.pdx.tsx`
- `src/popup/play/ProgressRow.pdx.tsx`
- `src/popup/collection/CollectionSlot.pdx.tsx`
- `src/popup/collection/CollectionGrid.pdx.tsx`
- `src/popup/components/BottomActionBar.pdx.tsx`
- `src/popup/tabs/PlayTab.pdx.tsx`
- Test files mirroring each, under `tests/popup/...`

**Modify:**
- `src/popup/components/pixelarticons.ts` — add `bookmark` body
- `src/popup/components/Icon.tsx` — add `bookmark` IconName + slate case + slug map entry
- `src/i18n/messages/en.ts` — add Pokédex Play copy keys
- `src/popup/styles/popup.pdx.css` — append Play content classes
- `src/popup/App.tsx` — route Pokédex Play tab to `PlayTab.pdx`

**Guarantee:** No `wh-*` markup, `popup.css`, or `tokens.css` is changed except `App.tsx`'s Pokédex branch (Slate branch stays behaviourally identical). Verify with `git diff` after the final task.

---

### Task 1: Add `bookmark` icon (foundation for the list selector)

The Pokédex list-selector keys carry a Pixelarticons `bookmark` glyph, which is not yet in the offline body map. Add it through the shared `Icon` abstraction so the 1:1 role mapping (POKEDEX-IMPLEMENTATION.md §4) stays uniform.

**Files:**
- Modify: `src/popup/components/pixelarticons.ts`
- Modify: `src/popup/components/Icon.tsx`
- Test: `tests/popup/components/icon-bookmark.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/components/icon-bookmark.test.tsx
import { render } from "@testing-library/preact";
import { Icon } from "../../../src/popup/components/Icon";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

describe("Icon bookmark", () => {
  it("renders a Lucide bookmark under slate", () => {
    const { container } = render(
      <ThemeContext.Provider value="slate">
        <Icon name="bookmark" size={16} />
      </ThemeContext.Provider>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("16");
  });

  it("renders the offline Pixelarticons bookmark body under pokedex", () => {
    const { container } = render(
      <ThemeContext.Provider value="pokedex">
        <Icon name="bookmark" size={16} />
      </ThemeContext.Provider>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // offline body is committed markup (path with the bookmark outline)
    expect(svg?.innerHTML).toContain("M6 2h12v2H6z");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm jest tests/popup/components/icon-bookmark.test.tsx`
Expected: FAIL — `"bookmark"` is not assignable to `IconName` (typecheck) / renders nothing.

- [ ] **Step 3: Add the bookmark body to the map**

In `src/popup/components/pixelarticons.ts`, add this entry to the `PIXELARTICONS_BODIES` object (keep the file's single-quote convention — the body contains `"`):

```ts
  bookmark:
    '<path d="M6 2h12v2H6zM4 4h2v18H4zm14 0h2v18h-2zm-2 16h2v2h-2zm-2-2h2v2h-2zm-8 2h2v2H6zm2-2h2v2H8zm2-2h4v2h-4z"/>',
```

- [ ] **Step 4: Wire `bookmark` into the Icon component**

`Icon.tsx` does **not** use `lucide-preact` — the slate branch hand-rolls inline `<svg>` markup in a `switch` (each case spreads the shared `props` object). The pokedex branch reads `PIXELARTICONS_SLUG[name]` from the body map and ignores `filled`. So:

1. Add `"bookmark"` to the `IconName` union type.
2. Add `bookmark: "bookmark"` to the `PIXELARTICONS_SLUG` map.
3. Add a slate inline-SVG case in the `switch`, before `default`, matching the existing case format (Lucide bookmark outline):

```tsx
    case "bookmark":
      return (
        <svg {...props} aria-hidden="true">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );
```

(No import changes — the slate side is inline SVG like every other case; the pokedex side resolves automatically once the slug + body exist.)

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm jest tests/popup/components/icon-bookmark.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm tsc --noEmit && pnpm biome check src/popup/components/Icon.tsx src/popup/components/pixelarticons.ts`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/popup/components/pixelarticons.ts src/popup/components/Icon.tsx tests/popup/components/icon-bookmark.test.tsx
git commit -m "feat(theme): add bookmark icon for the Pokedex list selector"
```

---

### Task 2: Add Pokédex Play copy keys to i18n

Pokédex voice diverges from Slate (POKEDEX-IMPLEMENTATION.md §7). Add the per-theme Play strings as English keys so `.pdx` components use `useT()` (never hardcode). List names (`play_list_animals/pokemon`) and the stop/action-bar arias are reused from Slate; CSS `text-transform: uppercase` handles casing, so only genuinely different copy gets new keys.

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Test: `tests/i18n/pdx-play-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/i18n/pdx-play-keys.test.ts
import { en } from "../../src/i18n/messages/en";

describe("Pokédex Play copy keys", () => {
  it("defines the Play-surface pokedex strings", () => {
    expect(en.pdx_active_now_hunting).toBe("Now hunting");
    expect(en.pdx_active_no_hunt).toBe("No hunt");
    expect(en.pdx_active_empty_hint).toBe("pick a slot below to start.");
    expect(en.pdx_progress_caught_label).toBe("CGHT");
    expect(en.pdx_filter_label).toBe("Show");
    expect(en.pdx_filter_all).toBe("All");
    expect(en.pdx_filter_caught).toBe("CGHT");
    expect(en.pdx_filter_uncaught).toBe("MISS");
    expect(en.pdx_collection_empty_caught).toBe("No catches — go hunt!");
    expect(en.pdx_collection_empty_uncaught).toBe("All caught!");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm jest tests/i18n/pdx-play-keys.test.ts`
Expected: FAIL — properties do not exist on `en`.

- [ ] **Step 3: Add the keys**

In `src/i18n/messages/en.ts`, add a new section before the closing `}` (place after the existing `play_*` block for locality):

```ts
  // Pokédex Play surface (theme-specific voice)
  pdx_active_now_hunting: "Now hunting",
  pdx_active_no_hunt: "No hunt",
  pdx_active_empty_hint: "pick a slot below to start.",
  pdx_progress_caught_label: "CGHT",
  pdx_filter_label: "Show",
  pdx_filter_all: "All",
  pdx_filter_caught: "CGHT",
  pdx_filter_uncaught: "MISS",
  pdx_collection_empty_caught: "No catches — go hunt!",
  pdx_collection_empty_uncaught: "All caught!",
```

> Note: `pdx_active_now_hunting`/`pdx_active_no_hunt`/`pdx_filter_label`/`pdx_filter_all` render uppercase via CSS (`text-transform: uppercase`); store them in normal case so other locales translate naturally. `CGHT`/`MISS` are intentional pixel abbreviations (kept literal).

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm jest tests/i18n/pdx-play-keys.test.ts`
Expected: PASS. `MessageKey` (`keyof typeof en`) now includes the new keys automatically.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm tsc --noEmit && pnpm biome check src/i18n/messages/en.ts`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/messages/en.ts tests/i18n/pdx-play-keys.test.ts
git commit -m "feat(theme): add Pokedex Play copy keys (NOW HUNTING, CGHT/MISS, …)"
```

---

### Task 3: Append Play content classes to `popup.pdx.css`

Fold the kit `popup.css` content classes (lines 110–235) into the existing `popup.pdx.css`, plus three additions not in the kit: `.pdx-active__spacer` (replaces the design's inline `width:28px` span), `.pdx-collection-empty` (empty-grid message), and the `.pdx-progress__panel*` expansion block (the user-approved simple LCD expansion — no kit equivalent).

**Files:**
- Modify: `src/popup/styles/popup.pdx.css`

- [ ] **Step 1: Append the content classes**

Append the following to the end of `src/popup/styles/popup.pdx.css`. (biome may reflow long gradient/shadow values on save — that is fine, the values are preserved.)

```css
/* ===== Section eyebrow (LCD body) ====================== */
.pdx-section-eyebrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pdx-section-eyebrow__title { font-family: var(--pdx-font-pixel); font-size: 9px; letter-spacing: 0.08em; color: var(--pdx-lcd-ink); text-transform: uppercase; }
.pdx-section-eyebrow__title .count { color: var(--pdx-lcd-frame-2); margin-left: 6px; }

/* ===== ActiveWordCard ================================== */
.pdx-active {
  display: grid; grid-template-columns: 48px 1fr 28px; gap: 10px; align-items: center;
  padding: 8px; background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2); border-bottom-width: 2px; border-radius: 5px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}
.pdx-active__art {
  width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 100%);
  border: 2px solid var(--pdx-led-yellow); border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15), 0 0 6px rgba(255, 210, 63, 0.55);
  overflow: hidden;
}
.pdx-active__art img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
.pdx-active__art .emoji { font-size: 30px; line-height: 1; }
.pdx-active__art--empty { border-color: var(--pdx-key-2); box-shadow: 0 0 0 1px rgba(0,0,0,0.05); color: var(--pdx-key-ink-2); }
.pdx-active__art--empty iconify-icon, .pdx-active__art--empty svg { font-size: 18px; color: var(--pdx-lcd-ink-2); }
.pdx-active__body { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pdx-active__eyebrow { font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.08em; color: var(--pdx-key-ink-2); text-transform: uppercase; }
.pdx-active__word { font-family: var(--pdx-font-lcd); font-size: 24px; line-height: 1.05; color: var(--pdx-key-ink); text-transform: lowercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pdx-active__hint { font-family: var(--pdx-font-ui); font-size: 11px; color: var(--pdx-key-ink-2); line-height: 1.3; }
.pdx-active__spacer { width: 28px; }
.pdx-active__stop {
  width: 28px; height: 28px; background: var(--pdx-key); border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px; border-radius: 3px; cursor: pointer; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7); color: var(--pdx-on-key);
}
.pdx-active__stop iconify-icon, .pdx-active__stop svg { font-size: 12px; }

/* ===== List selector =================================== */
.pdx-list-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.pdx-list-key {
  padding: 6px 8px; background: var(--pdx-key); border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px; border-radius: 4px; color: var(--pdx-on-key); cursor: pointer;
  font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
}
.pdx-list-key iconify-icon, .pdx-list-key svg { font-size: 11px; flex: 0 0 auto; }
.pdx-list-key.is-active {
  background: linear-gradient(180deg, #3F8BD6 0%, #1F5C9E 100%); border-color: #0E3A66; color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 1px rgba(141, 195, 240, 0.45), 0 1px 0 rgba(0,0,0,0.3);
}
.pdx-list-key.is-active iconify-icon, .pdx-list-key.is-active svg { color: #fff; }
.pdx-list-key__count { font-family: var(--pdx-font-lcd); font-size: 14px; line-height: 1; opacity: 0.85; margin-left: 4px; }
.pdx-list-key.is-active .pdx-list-key__count { opacity: 1; }

/* ===== ProgressRow ===================================== */
.pdx-progress-wrap { display: flex; flex-direction: column; gap: 6px; }
.pdx-progress {
  display: grid; grid-template-columns: auto auto 1fr 18px; gap: 8px; align-items: center;
  padding: 5px 8px 5px 10px; background: rgba(15, 42, 64, 0.18);
  border: 1px solid rgba(15, 42, 64, 0.35); border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(15,42,64,0.3);
}
.pdx-progress__label { font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink); text-transform: uppercase; }
.pdx-progress__bar { width: 100px; height: 8px; background: var(--pdx-lcd-frame); border-radius: 2px; padding: 1px; display: grid; grid-template-columns: repeat(10, 1fr); gap: 1px; }
.pdx-progress__cell { background: rgba(58, 138, 166, 0.3); border-radius: 1px; }
.pdx-progress__cell.is-filled { background: linear-gradient(180deg, #94DDEC 0%, #6FC8DC 100%); }
.pdx-progress__cell.is-head { background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%); box-shadow: 0 0 4px rgba(255,210,63,0.6); }
.pdx-progress__count { font-family: var(--pdx-font-lcd); font-size: 14px; line-height: 1; color: var(--pdx-lcd-ink); white-space: nowrap; text-align: right; }
.pdx-progress__chev { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; color: var(--pdx-lcd-ink-2); cursor: pointer; background: transparent; border: 0; padding: 0; }
.pdx-progress__chev iconify-icon, .pdx-progress__chev svg { font-size: 12px; }

/* expansion panel (no kit equivalent — simple LCD inset) */
.pdx-progress__panel { padding: 8px 10px; background: rgba(15, 42, 64, 0.18); border: 1px solid rgba(15, 42, 64, 0.35); border-radius: 4px; box-shadow: inset 0 1px 2px rgba(15,42,64,0.3); display: flex; flex-direction: column; gap: 8px; }
.pdx-progress__section { display: flex; flex-direction: column; gap: 4px; }
.pdx-progress__eyebrow { font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink); text-transform: uppercase; }
.pdx-progress__streak-stats { display: flex; gap: 16px; }
.pdx-progress__stat { display: flex; flex-direction: column; gap: 2px; }
.pdx-progress__stat-value { font-family: var(--pdx-font-lcd); font-size: 18px; line-height: 1; color: var(--pdx-lcd-ink); }
.pdx-progress__stat-label { font-family: var(--pdx-font-pixel); font-size: 6px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink-2); text-transform: uppercase; }
.pdx-progress__ach-list { display: flex; flex-wrap: wrap; gap: 4px; }
.pdx-progress__ach { display: inline-flex; align-items: center; gap: 4px; padding: 3px 5px; background: var(--pdx-key); border: 1px solid var(--pdx-key-2); border-radius: 3px; font-family: var(--pdx-font-ui); font-size: 9px; color: var(--pdx-key-ink); }
.pdx-progress__ach.is-locked { opacity: 0.5; }
.pdx-progress__ach-icon { display: inline-flex; color: var(--pdx-led-yellow); }
.pdx-progress__ach-icon svg { font-size: 9px; }

/* ===== Filter chips ==================================== */
.pdx-filter { display: flex; gap: 4px; align-items: center; }
.pdx-filter__label { font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink); text-transform: uppercase; margin-right: 4px; }
.pdx-filter__key {
  padding: 4px 8px; background: var(--pdx-key); border: 1px solid var(--pdx-key-2); border-bottom-width: 2px;
  border-radius: 3px; color: var(--pdx-on-key); cursor: pointer;
  font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.06em; text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}
.pdx-filter__key.is-active { background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%); border-color: #B89E50; color: #4A3A0E; }

/* ===== Collection grid + slots ========================= */
.pdx-grid { display: grid; gap: 5px; grid-template-columns: repeat(5, 1fr); }
.pdx-collection-empty { font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink-2); text-transform: uppercase; text-align: center; padding: 16px 8px; }
.pdx-slot-v2 {
  position: relative; aspect-ratio: 1 / 1;
  background: var(--pdx-key); border: 1px solid var(--pdx-key-2); border-bottom-width: 2px;
  border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 3px; overflow: hidden;
}
.pdx-slot-v2:hover { background: #FBF7EB; }
.pdx-slot-v2.is-active { background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%); border-color: #B89E50; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px rgba(255,210,63,0.5), 0 0 6px rgba(255, 210, 63, 0.55); }
.pdx-slot-v2.is-pending { background: linear-gradient(180deg, #B6D8F5 0%, #6FAEDF 100%); border-color: #1F5C9E; box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px rgba(141,195,240,0.45), 0 0 6px rgba(42,133,214,0.4); }
.pdx-slot-v2__emoji { font-size: 22px; line-height: 1; }
.pdx-slot-v2__ph { font-family: var(--pdx-font-lcd); font-size: 16px; line-height: 1; color: var(--pdx-key-ink-2); }
.pdx-slot-v2__sprite { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
.pdx-slot-v2__sprite.is-silhouette { filter: brightness(0) opacity(0.35); }
.pdx-slot-v2__count {
  position: absolute; bottom: 1px; right: 2px;
  font-family: var(--pdx-font-lcd); font-size: 11px; line-height: 1; color: var(--pdx-key-ink);
  background: rgba(244, 239, 226, 0.92); border-radius: 2px; padding: 0 2px; pointer-events: none;
}

/* ===== Bottom action bar =============================== */
.pdx-popup__action-bar {
  flex: 0 0 auto; padding: 10px 12px 12px; display: flex; gap: 6px; align-items: stretch;
  background: linear-gradient(180deg, var(--pdx-shell-2) 0%, var(--pdx-shell-deep) 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 -2px 6px rgba(0, 0, 0, 0.18);
  border-top: 1px solid rgba(0,0,0,0.35);
}
.pdx-action-icon {
  flex: 0 0 38px; width: 38px; height: 38px; background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2); border-bottom-width: 2px; border-radius: 4px; color: var(--pdx-on-key);
  cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}
.pdx-action-icon iconify-icon, .pdx-action-icon svg { font-size: 14px; }
.pdx-action-icon.is-on { background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%); border-color: #B89E50; color: #4A3A0E; box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 0 0 1px rgba(255,210,63,0.5); }
.pdx-action-primary {
  flex: 1; background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%);
  border: 1px solid #B89E50; border-bottom-width: 2px; border-radius: 4px; color: #3A1208;
  font-family: var(--pdx-font-pixel); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; padding: 0 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 0 10px rgba(255,210,63,0.5);
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.pdx-action-primary[disabled] { opacity: 0.45; cursor: not-allowed; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4); }
.pdx-action-primary iconify-icon, .pdx-action-primary svg { font-size: 11px; color: #3A1208; }
```

- [ ] **Step 2: Verify build picks up the CSS**

Run: `pnpm build`
Expected: build succeeds; no CSS parse errors.

- [ ] **Step 3: Confirm Slate stylesheets untouched**

Run: `git diff --stat src/popup/styles/popup.css src/shared/styles/tokens.css`
Expected: empty output.

- [ ] **Step 4: Lint**

Run: `pnpm biome check src/popup/styles/popup.pdx.css`
Expected: clean (biome may auto-format; that is acceptable).

- [ ] **Step 5: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(theme): add Pokedex Play content classes to popup.pdx.css"
```

---

### Task 4: `ActiveWordCard.pdx.tsx`

Pokédex ActiveWordCard: cream key cap with cyan LCD art well + yellow ring. Active state shows "NOW HUNTING" pixel eyebrow + VT323 word + stop key; empty state shows search glyph + "NO HUNT" + sans hint + a 28px spacer (the design's grid reserves the third column). Same props as the Slate `ActiveWordCard`.

**Files:**
- Create: `src/popup/play/ActiveWordCard.pdx.tsx`
- Test: `tests/popup/play/active-word-card-pdx.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/play/active-word-card-pdx.test.tsx
import { render } from "@testing-library/preact";
import { ActiveWordCardPdx } from "../../../src/popup/play/ActiveWordCard.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderPdx(ui: preact.ComponentChildren) {
  return render(<ThemeContext.Provider value="pokedex">{ui}</ThemeContext.Provider>);
}

describe("ActiveWordCardPdx", () => {
  it("renders the empty state with NO HUNT eyebrow and a spacer", () => {
    const { container, getByText } = renderPdx(
      <ActiveWordCardPdx activeWord={null} onClear={() => {}} />
    );
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-active__art--empty")).not.toBeNull();
    expect(container.querySelector(".pdx-active__spacer")).not.toBeNull();
    expect(getByText("No hunt")).toBeInTheDocument();
  });

  it("renders the active word with NOW HUNTING eyebrow and a stop button", () => {
    const onClear = jest.fn();
    const { container, getByText, getByRole } = renderPdx(
      <ActiveWordCardPdx
        activeWord={{ word: "pikachu", list: "pokemon", insertedAt: 0 }}
        onClear={onClear}
      />
    );
    expect(getByText("Now hunting")).toBeInTheDocument();
    expect(container.querySelector(".pdx-active__word")?.textContent).toBe("pikachu");
    getByRole("button").click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm jest tests/popup/play/active-word-card-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

```tsx
// src/popup/play/ActiveWordCard.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { resolveArtView } from "../../shared/art-resolver";
import type { ActiveWord, WordSource } from "../../shared/types";
import { Icon } from "../components/Icon";

interface ActiveWordCardProps {
  activeWord: ActiveWord | null;
  onClear: () => void;
}

export function ActiveWordCardPdx({ activeWord, onClear }: ActiveWordCardProps): JSX.Element {
  const t = useT();

  if (!activeWord) {
    return (
      <div class="pdx-active">
        <div class="pdx-active__art pdx-active__art--empty" aria-hidden="true">
          <Icon name="search" size={18} />
        </div>
        <div class="pdx-active__body">
          <span class="pdx-active__eyebrow">{t("pdx_active_no_hunt")}</span>
          <span class="pdx-active__hint">{t("pdx_active_empty_hint")}</span>
        </div>
        <span class="pdx-active__spacer" aria-hidden="true" />
      </div>
    );
  }

  const source: WordSource = activeWord.list ?? "custom";
  const art = resolveArtView(activeWord.word, source);

  return (
    <div class="pdx-active">
      <div class="pdx-active__art" aria-hidden="true">
        {renderArt(art)}
      </div>
      <div class="pdx-active__body">
        <span class="pdx-active__eyebrow">{t("pdx_active_now_hunting")}</span>
        <span class="pdx-active__word">{activeWord.word}</span>
      </div>
      <button
        type="button"
        class="pdx-active__stop"
        title={t("active_word_stop_title")}
        aria-label={t("active_word_stop_aria")}
        onClick={onClear}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}

function renderArt(art: ReturnType<typeof resolveArtView>): JSX.Element {
  switch (art.kind) {
    case "sprite":
      return <img src={art.url} alt="" width={44} height={44} loading="lazy" decoding="async" />;
    case "emoji":
      return <span class="emoji">{art.char}</span>;
    default:
      return <Icon name="pencil" size={18} />;
  }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm jest tests/popup/play/active-word-card-pdx.test.tsx`
Expected: PASS (2/2).

- [ ] **Step 5: Typecheck + lint, then commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/play/ActiveWordCard.pdx.tsx
git add src/popup/play/ActiveWordCard.pdx.tsx tests/popup/play/active-word-card-pdx.test.tsx
git commit -m "feat(theme): add ActiveWordCard.pdx (cyan LCD art well + NOW HUNTING)"
```

---

### Task 5: `ProgressRow.pdx.tsx` (TRAP #4 — 4-col grid + expansion)

Pokédex ProgressRow: inset mini-LCD row with a pixel label, a 10-cell discrete bar, a VT323 count, and a chevron. **The `.pdx-progress` grid has exactly four direct children and four columns (`auto auto 1fr 18px`)** — adding/removing a child means re-counting the template (TRAP #4). The chevron toggles a simple LCD expansion panel (streak + achievements), per the approved design decision.

Bar fill logic: `filled = min(10, floor(pct/10))`; the leading cell after the filled run is the `is-head` cell (omitted at 100%).

**Files:**
- Create: `src/popup/play/ProgressRow.pdx.tsx`
- Test: `tests/popup/play/progress-row-pdx.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/play/progress-row-pdx.test.tsx
import { fireEvent, render } from "@testing-library/preact";
import { ProgressRowPdx } from "../../../src/popup/play/ProgressRow.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";
import type { Achievement, CollectionStats, StreakStats } from "../../../src/popup/collection/types";

const stats: CollectionStats = { caught: 31, total: 151, totalCatches: 42, ratio: 31 / 151 };
const streak: StreakStats = { current: 3, longest: 7 };
const achievements: Achievement[] = [
  { id: "first-catch", label: "First catch", unlocked: true },
  { id: "half-way", label: "Half way", unlocked: false, hint: "Catch half" },
];

function renderPdx() {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ProgressRowPdx stats={stats} streak={streak} achievements={achievements} />
    </ThemeContext.Provider>
  );
}

describe("ProgressRowPdx", () => {
  it("renders exactly 4 grid children and a 10-cell bar (TRAP #4)", () => {
    const { container } = renderPdx();
    const row = container.querySelector(".pdx-progress");
    expect(row?.children.length).toBe(4);
    expect(container.querySelectorAll(".pdx-progress__cell").length).toBe(10);
  });

  it("fills floor(pct/10) cells with a head cell after them", () => {
    // 31/151 = 20.5% -> 2 filled, head at index 2
    const { container } = renderPdx();
    expect(container.querySelectorAll(".pdx-progress__cell.is-filled").length).toBe(2);
    const head = container.querySelectorAll(".pdx-progress__cell.is-head");
    expect(head.length).toBe(1);
  });

  it("shows the spaced count text", () => {
    const { getByText } = renderPdx();
    expect(getByText("31 / 151")).toBeInTheDocument();
  });

  it("toggles the expansion panel via the chevron", () => {
    const { container, getByRole } = renderPdx();
    expect(container.querySelector(".pdx-progress__panel")).toBeNull();
    fireEvent.click(getByRole("button"));
    expect(container.querySelector(".pdx-progress__panel")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-progress__ach").length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm jest tests/popup/play/progress-row-pdx.test.tsx`
Expected: FAIL — module not found.

> **Before implementing:** confirm the `CollectionStats`/`StreakStats`/`Achievement` shapes in `src/popup/collection/types.ts` match the test fixtures (`ratio`, `caught`, `total`; `current`, `longest`; `id`, `label`, `unlocked`, `hint`). If a field name differs, align the test and component to the real type — do not invent fields.

- [ ] **Step 3: Implement the component**

```tsx
// src/popup/play/ProgressRow.pdx.tsx
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { Achievement, CollectionStats, StreakStats } from "../collection/types";
import { Icon } from "../components/Icon";

interface ProgressRowProps {
  stats: CollectionStats;
  streak: StreakStats;
  achievements: Achievement[];
}

const CELL_COUNT = 10;

export function ProgressRowPdx({ stats, streak, achievements }: ProgressRowProps): JSX.Element {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(stats.ratio * 100);
  const filled = Math.min(CELL_COUNT, Math.floor(pct / 10));
  const headIndex = filled < CELL_COUNT ? filled : -1;
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div class="pdx-progress-wrap">
      <div class="pdx-progress">
        <span class="pdx-progress__label">{t("pdx_progress_caught_label")}</span>
        <div class="pdx-progress__bar" aria-hidden="true">
          {Array.from({ length: CELL_COUNT }, (_, i) => (
            <span
              key={i}
              class={`pdx-progress__cell${i < filled ? " is-filled" : ""}${
                i === headIndex ? " is-head" : ""
              }`}
            />
          ))}
        </div>
        <span class="pdx-progress__count">
          {stats.caught} / {stats.total}
        </span>
        <button
          type="button"
          class="pdx-progress__chev"
          aria-expanded={expanded}
          aria-label={t("progress_aria_label", {
            caught: stats.caught,
            total: stats.total,
            unlocked,
            achTotal: achievements.length,
          })}
          onClick={() => setExpanded((v) => !v)}
        >
          <Icon name="chevron-down" size={12} />
        </button>
      </div>

      {expanded && (
        <div class="pdx-progress__panel">
          <div class="pdx-progress__section">
            <span class="pdx-progress__eyebrow">{t("progress_streak_eyebrow")}</span>
            <div class="pdx-progress__streak-stats">
              <div class="pdx-progress__stat">
                <span class="pdx-progress__stat-value">{streak.current}d</span>
                <span class="pdx-progress__stat-label">{t("progress_current_label")}</span>
              </div>
              <div class="pdx-progress__stat">
                <span class="pdx-progress__stat-value">{streak.longest}d</span>
                <span class="pdx-progress__stat-label">{t("progress_longest_label")}</span>
              </div>
            </div>
          </div>
          <div class="pdx-progress__section">
            <span class="pdx-progress__eyebrow">{t("progress_achievements_eyebrow")}</span>
            <div class="pdx-progress__ach-list">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  class={`pdx-progress__ach${a.unlocked ? "" : " is-locked"}`}
                  title={a.hint ?? a.label}
                >
                  <span class="pdx-progress__ach-icon" aria-hidden="true">
                    <Icon name="star" size={9} filled={a.unlocked} />
                  </span>
                  <span class="pdx-progress__ach-label">{a.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm jest tests/popup/play/progress-row-pdx.test.tsx`
Expected: PASS (4/4).

- [ ] **Step 5: Typecheck + lint, then commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/play/ProgressRow.pdx.tsx
git add src/popup/play/ProgressRow.pdx.tsx tests/popup/play/progress-row-pdx.test.tsx
git commit -m "feat(theme): add ProgressRow.pdx (10-cell bar, 4-col grid, expansion)"
```

---

### Task 6: `CollectionSlot.pdx.tsx` + `CollectionGrid.pdx.tsx`

Pokédex slots: `.pdx-slot-v2` cream caps. `is-active` = yellow ring, `is-pending` = cyan ring. Caught sprite renders full-colour; uncaught sprite renders as a silhouette (`is-silhouette`); emoji caught renders the glyph, uncaught renders `???`; the `none` art kind always renders `???`. Caught count badge reads `xN` (lowercase, per design). The grid mirrors `CollectionGrid`'s filter logic; empty states use the pokedex copy keys.

**Files:**
- Create: `src/popup/collection/CollectionSlot.pdx.tsx`
- Create: `src/popup/collection/CollectionGrid.pdx.tsx`
- Test: `tests/popup/collection/collection-slot-pdx.test.tsx`
- Test: `tests/popup/collection/collection-grid-pdx.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/popup/collection/collection-slot-pdx.test.tsx
import { render } from "@testing-library/preact";
import { CollectionSlotPdx } from "../../../src/popup/collection/CollectionSlot.pdx";

describe("CollectionSlotPdx", () => {
  it("renders a caught animal emoji with an xN badge", () => {
    const { container, getByText } = render(
      <CollectionSlotPdx word="fox" source="animals" count={3} isActive={false} onClick={() => {}} />
    );
    expect(container.querySelector(".pdx-slot-v2")).not.toBeNull();
    expect(getByText("x3")).toBeInTheDocument();
  });

  it("renders ??? for an uncaught emoji slot and no badge", () => {
    const { container, getByText } = render(
      <CollectionSlotPdx word="fox" source="animals" count={0} isActive={false} onClick={() => {}} />
    );
    expect(getByText("???")).toBeInTheDocument();
    expect(container.querySelector(".pdx-slot-v2__count")).toBeNull();
  });

  it("applies is-active and is-pending modifiers", () => {
    const { container } = render(
      <CollectionSlotPdx word="fox" source="animals" count={1} isActive isPending onClick={() => {}} />
    );
    const el = container.querySelector(".pdx-slot-v2");
    expect(el?.classList.contains("is-active")).toBe(true);
    expect(el?.classList.contains("is-pending")).toBe(true);
  });
});
```

```tsx
// tests/popup/collection/collection-grid-pdx.test.tsx
import { render } from "@testing-library/preact";
import { CollectionGridPdx } from "../../../src/popup/collection/CollectionGrid.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderGrid(filter: "all" | "caught" | "uncaught", counts: Map<string, number>) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <CollectionGridPdx
        list="animals"
        filter={filter}
        counts={counts}
        activeWord={null}
        pendingWord={null}
        onPick={() => {}}
      />
    </ThemeContext.Provider>
  );
}

describe("CollectionGridPdx", () => {
  it("renders a .pdx-grid of slots for the all filter", () => {
    const { container } = renderGrid("all", new Map());
    expect(container.querySelector(".pdx-grid")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-slot-v2").length).toBeGreaterThan(0);
  });

  it("shows the pokedex empty message when no caught words match", () => {
    const { container, getByText } = renderGrid("caught", new Map());
    expect(container.querySelector(".pdx-collection-empty")).not.toBeNull();
    expect(getByText("No catches — go hunt!")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm jest tests/popup/collection/collection-slot-pdx.test.tsx tests/popup/collection/collection-grid-pdx.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `CollectionSlot.pdx.tsx`**

```tsx
// src/popup/collection/CollectionSlot.pdx.tsx
import type { JSX } from "preact";
import { resolveArtView } from "../../shared/art-resolver";
import type { WordListName } from "../word-lists";

interface CollectionSlotProps {
  word: string;
  source: WordListName;
  count: number;
  isActive: boolean;
  isPending?: boolean;
  onClick: () => void;
}

export function CollectionSlotPdx({
  word,
  source,
  count,
  isActive,
  isPending,
  onClick,
}: CollectionSlotProps): JSX.Element {
  const caught = count > 0;
  const art = resolveArtView(word, source);
  const classes = [
    "pdx-slot-v2",
    isActive ? "is-active" : "",
    isPending === true ? "is-pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabel = caught
    ? `${word}, caught ${count} ${count === 1 ? "time" : "times"}`
    : `${word}, not caught yet`;

  return (
    <button type="button" class={classes} onClick={onClick} aria-label={ariaLabel} title={word}>
      {renderArt(art, caught)}
      {caught && <span class="pdx-slot-v2__count">x{count}</span>}
    </button>
  );
}

function renderArt(art: ReturnType<typeof resolveArtView>, caught: boolean): JSX.Element {
  switch (art.kind) {
    case "sprite":
      return (
        <img
          class={`pdx-slot-v2__sprite${caught ? "" : " is-silhouette"}`}
          src={art.url}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
        />
      );
    case "emoji":
      return caught ? (
        <span class="pdx-slot-v2__emoji">{art.char}</span>
      ) : (
        <span class="pdx-slot-v2__ph">???</span>
      );
    default:
      return <span class="pdx-slot-v2__ph">???</span>;
  }
}
```

- [ ] **Step 4: Implement `CollectionGrid.pdx.tsx`**

```tsx
// src/popup/collection/CollectionGrid.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { CollectionSlotPdx } from "./CollectionSlot.pdx";
import type { CatchCounts, CollectionFilter } from "./types";

interface CollectionGridProps {
  list: WordListName;
  filter: CollectionFilter;
  counts: CatchCounts;
  activeWord: string | null;
  pendingWord?: string | null;
  onPick: (word: string) => void;
}

export function CollectionGridPdx({
  list,
  filter,
  counts,
  activeWord,
  pendingWord,
  onPick,
}: CollectionGridProps): JSX.Element {
  const t = useT();
  const words = WORD_LISTS[list];
  const slots = words
    .map((word) => ({ word, count: counts.get(word) ?? 0 }))
    .filter(({ count }) => {
      if (filter === "caught") return count > 0;
      if (filter === "uncaught") return count === 0;
      return true;
    });

  if (slots.length === 0) {
    const message =
      filter === "caught" ? t("pdx_collection_empty_caught") : t("pdx_collection_empty_uncaught");
    return <div class="pdx-collection-empty">{message}</div>;
  }

  return (
    <div class={`pdx-grid pdx-grid--${list}`}>
      {slots.map(({ word, count }) => (
        <CollectionSlotPdx
          key={word}
          word={word}
          source={list}
          count={count}
          isActive={activeWord === word}
          isPending={(pendingWord ?? null) === word}
          onClick={() => onPick(word)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `pnpm jest tests/popup/collection/collection-slot-pdx.test.tsx tests/popup/collection/collection-grid-pdx.test.tsx`
Expected: PASS.

- [ ] **Step 6: Typecheck + lint, then commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/collection/CollectionSlot.pdx.tsx src/popup/collection/CollectionGrid.pdx.tsx
git add src/popup/collection/CollectionSlot.pdx.tsx src/popup/collection/CollectionGrid.pdx.tsx tests/popup/collection/collection-slot-pdx.test.tsx tests/popup/collection/collection-grid-pdx.test.tsx
git commit -m "feat(theme): add CollectionSlot.pdx + CollectionGrid.pdx (.pdx-slot-v2)"
```

---

### Task 7: `BottomActionBar.pdx.tsx`

Pokédex action bar: raised raspberry housing. Auto-continue cream icon key (`is-on` → yellow), yellow pixel primary CTA (play glyph + "START HUNT", disabled when nothing picked), shuffle and custom cream icon keys. Same props as Slate `BottomActionBar`.

**Files:**
- Create: `src/popup/components/BottomActionBar.pdx.tsx`
- Test: `tests/popup/components/bottom-action-bar-pdx.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/components/bottom-action-bar-pdx.test.tsx
import { render } from "@testing-library/preact";
import { BottomActionBarPdx } from "../../../src/popup/components/BottomActionBar.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderBar(props: Partial<Parameters<typeof BottomActionBarPdx>[0]> = {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <BottomActionBarPdx
        onStart={props.onStart ?? (() => {})}
        onShuffle={props.onShuffle ?? (() => {})}
        onCustom={props.onCustom ?? (() => {})}
        startDisabled={props.startDisabled}
        autoContinue={props.autoContinue}
        onAutoContinue={props.onAutoContinue ?? (() => {})}
      />
    </ThemeContext.Provider>
  );
}

describe("BottomActionBarPdx", () => {
  it("renders the raspberry action bar with a primary CTA", () => {
    const { container } = renderBar();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
    expect(container.querySelector(".pdx-action-primary")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-action-icon").length).toBe(3);
  });

  it("disables the primary CTA and marks auto-continue on", () => {
    const { container } = renderBar({ startDisabled: true, autoContinue: true });
    expect(container.querySelector<HTMLButtonElement>(".pdx-action-primary")?.disabled).toBe(true);
    expect(container.querySelector(".pdx-action-icon.is-on")).not.toBeNull();
  });

  it("fires onStart when the CTA is clicked", () => {
    const onStart = jest.fn();
    const { container } = renderBar({ onStart });
    container.querySelector<HTMLButtonElement>(".pdx-action-primary")?.click();
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm jest tests/popup/components/bottom-action-bar-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

```tsx
// src/popup/components/BottomActionBar.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface BottomActionBarProps {
  onStart: () => void;
  onShuffle: () => void;
  onCustom: () => void;
  startDisabled?: boolean;
  autoContinue?: boolean;
  onAutoContinue?: () => void;
}

export function BottomActionBarPdx({
  onStart,
  onShuffle,
  onCustom,
  startDisabled = false,
  autoContinue = false,
  onAutoContinue,
}: BottomActionBarProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__action-bar">
      <button
        type="button"
        role="switch"
        class={`pdx-action-icon${autoContinue ? " is-on" : ""}`}
        aria-checked={autoContinue}
        title={t("action_bar_auto_continue_title")}
        aria-label={t("action_bar_auto_continue_aria")}
        onClick={onAutoContinue}
      >
        <Icon name="refresh" size={14} />
      </button>
      <button
        type="button"
        class="pdx-action-primary"
        onClick={onStart}
        disabled={startDisabled}
      >
        <Icon name="play" size={11} filled />
        <span>{t("action_bar_start")}</span>
      </button>
      <button
        type="button"
        class="pdx-action-icon"
        title={t("action_bar_shuffle_title")}
        aria-label={t("action_bar_shuffle_aria")}
        onClick={onShuffle}
      >
        <Icon name="shuffle" size={14} />
      </button>
      <button
        type="button"
        class="pdx-action-icon"
        title={t("action_bar_custom_title")}
        aria-label={t("action_bar_custom_aria")}
        onClick={onCustom}
      >
        <Icon name="pencil" size={14} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm jest tests/popup/components/bottom-action-bar-pdx.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 5: Typecheck + lint, then commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/components/BottomActionBar.pdx.tsx
git add src/popup/components/BottomActionBar.pdx.tsx tests/popup/components/bottom-action-bar-pdx.test.tsx
git commit -m "feat(theme): add BottomActionBar.pdx (raspberry keypad, yellow CTA)"
```

---

### Task 8: `PlayTab.pdx.tsx` (logic owner) + App routing

`PlayTab.pdx` duplicates `PlayTab.tsx`'s hooks/state/handlers exactly, but renders the Pokédex tree: its own `.pdx-popup__body > .pdx-popup__body-inner` (scrolling content) followed by the `.pdx-popup__action-bar` (sibling of the body, sticky) — matching the device layout where the action bar sits on the shell, not inside the LCD. The list selector becomes `.pdx-list-selector` keys (bookmark icon + label + per-list caught count); the filter becomes `.pdx-filter` keys.

`App.tsx`'s Pokédex branch routes the Play tab to `PlayTab.pdx` and keeps the generic `.pdx-popup__body` well for the not-yet-forked tabs (stats/settings/rules).

> **TEMPORARY (Phase 2c):** `PlayTab.pdx` renders the Slate `ReloadHint` and Slate `CustomWordModal` wrapped in `<div class="wh">` so those features stay functional and styled until 2c forks them. The wrapper is marked with a `TODO(phase-2c)` comment.

**Files:**
- Create: `src/popup/tabs/PlayTab.pdx.tsx`
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/tabs/play-tab-pdx.test.tsx`
- Test: `tests/popup/app-play-pdx.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/popup/tabs/play-tab-pdx.test.tsx
import { act, render, waitFor } from "@testing-library/preact";
import { PlayTabPdx } from "../../../src/popup/tabs/PlayTab.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function setupChromeMock(initial: Record<string, unknown> = {}): void {
  const store: Record<string, unknown> = { ...initial };
  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
      onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
    },
    tabs: { query: jest.fn() },
    scripting: { executeScript: jest.fn() },
  };
}

function renderPlay() {
  return render(
    <ThemeContext.Provider value="pokedex">
      <PlayTabPdx />
    </ThemeContext.Provider>
  );
}

describe("PlayTabPdx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the LCD body well, list selector, progress, filter, grid, and action bar", async () => {
    setupChromeMock();
    const { container } = renderPlay();
    await act(async () => {});
    expect(container.querySelector(".pdx-popup__body")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__body-inner")).not.toBeNull();
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-list-selector")).not.toBeNull();
    expect(container.querySelector(".pdx-progress")).not.toBeNull();
    expect(container.querySelector(".pdx-filter")).not.toBeNull();
    expect(container.querySelector(".pdx-grid")).not.toBeNull();
    // action bar is a sibling of the body, not inside the LCD well
    const body = container.querySelector(".pdx-popup__body");
    expect(body?.querySelector(".pdx-popup__action-bar")).toBeNull();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
  });
});
```

```tsx
// tests/popup/app-play-pdx.test.tsx
import { render, waitFor } from "@testing-library/preact";
import { App } from "../../src/popup/App";

function setupChromeMock(initial: Record<string, unknown> = {}): void {
  const store: Record<string, unknown> = { ...initial };
  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
      onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
    },
    tabs: { query: jest.fn() },
    scripting: { executeScript: jest.fn() },
  };
}

describe("App Pokédex Play routing", () => {
  beforeEach(() => jest.clearAllMocks());

  it("routes the Play tab to the Pokédex play surface", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm jest tests/popup/tabs/play-tab-pdx.test.tsx tests/popup/app-play-pdx.test.tsx`
Expected: FAIL — module not found / App still renders Slate `PlayTab` in the well.

> **Before implementing:** open `src/popup/tabs/PlayTab.tsx` and copy its hook/state/handler block verbatim into `PlayTab.pdx` (same `useStorage`/`useState`/`useMemo`/`useFeatureFlags` calls, same `startHunt`/`handleReload`/`shufflePick`/`submitCustom`/`clear`/`toggleAutoContinue`). Only the returned markup differs. This keeps behaviour identical and avoids drift.

- [ ] **Step 3: Implement `PlayTab.pdx.tsx`**

```tsx
// src/popup/tabs/PlayTab.pdx.tsx
import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { ActiveWord } from "../../shared/types";
import { CollectionGridPdx } from "../collection/CollectionGrid.pdx";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import { pickRandomWord } from "../collection/pickRandomWord";
import type { CollectionFilter } from "../collection/types";
import { BottomActionBarPdx } from "../components/BottomActionBar.pdx";
import { Icon } from "../components/Icon";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useStorage } from "../hooks/useStorage";
import { ActiveWordCardPdx } from "../play/ActiveWordCard.pdx";
import { CustomWordModal } from "../play/CustomWordModal";
import { ProgressRowPdx } from "../play/ProgressRow.pdx";
import { ReloadHint } from "../play/ReloadHint";
import { WORD_LISTS, type WordListName } from "../word-lists";

const LIST_CHIPS: Array<{ value: WordListName; labelKey: MessageKey }> = [
  { value: "animals", labelKey: "play_list_animals" },
  { value: "pokemon", labelKey: "play_list_pokemon" },
];

const PDX_FILTER_CHIPS: Array<{ value: CollectionFilter; labelKey: MessageKey }> = [
  { value: "all", labelKey: "pdx_filter_all" },
  { value: "caught", labelKey: "pdx_filter_caught" },
  { value: "uncaught", labelKey: "pdx_filter_uncaught" },
];

export function PlayTabPdx(): JSX.Element {
  const t = useT();
  const [activeWord, setActiveWord] = useStorage("activeWord", null);
  const [finds] = useStorage("finds", []);
  const [list, setList] = useStorage("selectedList", "animals");
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const flags = useFeatureFlags();

  useEffect(() => {
    if (!flags.pokemon && list === "pokemon") {
      void chrome.storage.local.set({ selectedList: "animals" });
    }
  }, [flags.pokemon, list]);

  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [customOpen, setCustomOpen] = useState(false);
  const [pendingWord, setPendingWord] = useState<string | null>(null);
  const [showReloadBanner, setShowReloadBanner] = useState(false);

  const counts = useMemo(() => computeCatchCounts(finds, list), [finds, list]);
  const stats = useMemo(
    () => computeCollectionStats(counts, WORD_LISTS[list].length),
    [counts, list]
  );
  const streak = useMemo(() => computeStreak(finds, Date.now()), [finds]);
  const achievements = useMemo(() => listAchievements(stats, streak), [stats, streak]);

  const availableLists = useMemo(
    () =>
      LIST_CHIPS.filter((chip) => chip.value !== "pokemon" || flags.pokemon).map((chip) => {
        const listCounts = computeCatchCounts(finds, chip.value);
        const listStats = computeCollectionStats(listCounts, WORD_LISTS[chip.value].length);
        return { value: chip.value, labelKey: chip.labelKey, caught: listStats.caught };
      }),
    [finds, flags.pokemon]
  );

  const pickFromCollection = (word: string): void => {
    setPendingWord(word);
  };

  const startHunt = (): void => {
    if (!pendingWord) return;
    setActiveWord({ word: pendingWord, list, insertedAt: Date.now() });
    setPendingWord(null);
    if (settings.showReloadHint) setShowReloadBanner(true);
  };

  const handleReload = (): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.location.reload(),
        });
      }
    });
    setShowReloadBanner(false);
  };

  const shufflePick = (): void => {
    const word = pickRandomWord(list, counts, "uncaught");
    setPendingWord(word);
  };

  const submitCustom = (word: string): void => {
    const next: ActiveWord = { word, list: "custom", insertedAt: Date.now() };
    setActiveWord(next);
    setCustomOpen(false);
    if (settings.showReloadHint) setShowReloadBanner(true);
  };

  const clear = (): void => {
    setActiveWord(null);
  };

  const toggleAutoContinue = (): void => {
    setSettings({ ...settings, autoContinue: !settings.autoContinue });
  };

  const activeWordValue = activeWord?.word ?? null;

  return (
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <ActiveWordCardPdx activeWord={activeWord} onClear={clear} />

          <div class="pdx-list-selector" role="tablist" aria-label={t("play_word_list_aria")}>
            {availableLists.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                class={`pdx-list-key${list === item.value ? " is-active" : ""}`}
                aria-selected={list === item.value}
                onClick={() => setList(item.value)}
              >
                <Icon name="bookmark" size={11} />
                {t(item.labelKey)}
                <span class="pdx-list-key__count">{item.caught}</span>
              </button>
            ))}
          </div>

          <ProgressRowPdx stats={stats} streak={streak} achievements={achievements} />

          <div class="pdx-filter" role="tablist" aria-label={t("play_filter_aria")}>
            <span class="pdx-filter__label">{t("pdx_filter_label")}</span>
            {PDX_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                role="tab"
                class={`pdx-filter__key${filter === chip.value ? " is-active" : ""}`}
                aria-selected={filter === chip.value}
                onClick={() => setFilter(chip.value)}
              >
                {t(chip.labelKey)}
              </button>
            ))}
          </div>

          <CollectionGridPdx
            list={list}
            filter={filter}
            counts={counts}
            activeWord={activeWordValue}
            pendingWord={pendingWord}
            onPick={pickFromCollection}
          />
        </div>
      </div>

      <BottomActionBarPdx
        onStart={startHunt}
        onShuffle={shufflePick}
        onCustom={() => setCustomOpen(true)}
        startDisabled={pendingWord === null}
        autoContinue={settings.autoContinue}
        onAutoContinue={toggleAutoContinue}
      />

      {/* TODO(phase-2c): replace with ReloadHint.pdx / CustomWordModal.pdx.
          Slate fallbacks wrapped in `.wh` so they stay styled + functional. */}
      <div class="wh">
        {showReloadBanner && activeWord && (
          <ReloadHint onReload={handleReload} onDismiss={() => setShowReloadBanner(false)} />
        )}
        <CustomWordModal open={customOpen} onClose={() => setCustomOpen(false)} onSubmit={submitCustom} />
      </div>
    </>
  );
}
```

> Implementer note: if biome flags the `availableLists` `useMemo` dep array or the `role="tablist"` a11y pattern, mirror exactly what `PlayTab.tsx` does for its chip groups (it uses `role="tablist"`/`role="tab"`/`aria-selected`). Keep the dependency arrays identical to the Slate originals where the logic is shared.

- [ ] **Step 4: Route the Play tab in `App.tsx`**

In `src/popup/App.tsx`:
1. Add the import: `import { PlayTabPdx } from "./tabs/PlayTab.pdx";`
2. Replace the Pokédex-branch body region so the Play tab uses `PlayTabPdx` (which owns its own `.pdx-popup__body` + action bar) and other tabs keep the generic well. Change the Pokédex `return` block to:

```tsx
  if (theme === "pokedex") {
    return (
      <ThemeContext.Provider value={theme}>
        <div class="pdx">
          <div class="pdx-popup">
            <PopupHeaderPdx onRules={handleRules} rulesActive={active === "rules"} />
            <TabsPdx active={active} onNavigate={handleTabNavigate} />
            <div class="pdx-popup__ridge" />
            {active === "play" ? (
              <PlayTabPdx />
            ) : (
              <div class="pdx-popup__body">
                <div class="pdx-popup__body-inner">{panels}</div>
              </div>
            )}
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }
```

> The `panels` fragment still renders all four `wh-tab-panel` divs, but in the Pokédex non-play branch only the active non-play tab's panel is shown (the `play` panel only renders when `active === "play"`, which this branch excludes). The Slate `return` below is unchanged.

- [ ] **Step 5: Run the new tests, verify they pass**

Run: `pnpm jest tests/popup/tabs/play-tab-pdx.test.tsx tests/popup/app-play-pdx.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the existing shell tests, verify still green**

Run: `pnpm jest tests/popup/app-shell-pdx.test.tsx tests/popup/app-theme.test.tsx`
Expected: PASS (the `.pdx-popup__body-inner` assertion still holds — `PlayTabPdx` renders it for the default `active="play"`).

- [ ] **Step 7: Full verification**

Run: `pnpm test && pnpm tsc --noEmit && pnpm build`
Expected: all suites pass; typecheck clean; build succeeds.

- [ ] **Step 8: Confirm Slate untouched**

Run: `git diff --stat HEAD~7 -- src/popup/styles/popup.css src/shared/styles/tokens.css`
Expected: empty (only `App.tsx`'s Pokédex branch changed among shipped Slate-affecting files; `App.tsx` Slate branch is behaviourally identical).

- [ ] **Step 9: Commit**

```bash
git add src/popup/tabs/PlayTab.pdx.tsx src/popup/App.tsx tests/popup/tabs/play-tab-pdx.test.tsx tests/popup/app-play-pdx.test.tsx
git commit -m "feat(theme): fork Play content into PlayTab.pdx + route it from App"
```

---

## Self-Review

**Spec coverage** (POKEDEX-IMPLEMENTATION.md §5 Play-surface rows):
- PopupHeader / Tabs — done in Phase 2a. ✓
- ActiveWordCard → Task 4 ✓
- ProgressRow (4-col grid, TRAP #4) → Task 5 ✓
- CollectionSlot (`.pdx-slot-v2`, silhouette, rings) → Task 6 ✓
- BottomActionBar → Task 7 ✓
- list selector + filter (part of the Play surface, not a separate module) → Task 8 ✓
- CustomWordModal, ReloadHint → **deferred to Phase 2c** (documented; Slate fallbacks bridge 2b). 
- Stats/Settings/Rules/form controls/overlays → Phases 3–4.

**Trap checklist:**
- TRAP #1 (`.pdx` scope) — inherited from Phase 2a App root; new components render inside it. ✓
- TRAP #3 (no `<iconify-icon>`) — all icons via the offline `Icon` component (bookmark added in Task 1). ✓
- TRAP #4 (grid columns == children) — `.pdx-progress` has 4 children + 4 columns; asserted in Task 5 test. ✓

**Type consistency:** `ActiveWordCardProps`, `BottomActionBarProps`, `CollectionGridProps`, `CollectionSlotProps`, `ProgressRowProps` reuse the Slate prop shapes verbatim. `CatchCounts`/`CollectionFilter`/`CollectionStats`/`StreakStats`/`Achievement` imported from `../collection/types`. `MessageKey` auto-extends from the Task 2 keys. Component export names use the `…Pdx` suffix consistently.

**Placeholder scan:** every code step contains complete code; the bookmark SVG body is the real Pixelarticons path; i18n values are concrete; CSS is the full mirrored block. ✓

**Open risk flagged for review:** the Slate `bookmark` inline-SVG case (Task 1) is unused by Slate today — it exists to keep the role mapping uniform per §4 (Slate never renders a bookmark currently). If the code-quality reviewer objects to the unused case, the fallback is to render the list-key bookmark via a pokedex-only path; note and proceed.
