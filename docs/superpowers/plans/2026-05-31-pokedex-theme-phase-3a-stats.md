# Pokédex Theme — Phase 3a (Stats Tab + Confirm Overlay) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fork the Stats tab into a Pokédex sibling — an LCD list of past hunts (squared dots, VT323 values, cyan hint cells), an empty state, and a "CLEAR" cream key that arms a sticky raspberry confirm footer.

**Architecture:** `StatsTab.pdx.tsx` owns its own `.pdx-popup__body` LCD well + a sticky `.pdx-popup__confirm` footer (sibling of the body, like `PlayTab.pdx`'s action bar). `ConfirmOverlay.pdx.tsx` renders that footer. `App` routes the pokedex Stats tab to `StatsTabPdx` (the generic well now serves only Settings/Rules until Phase 3c). Shared data/format helpers (`useStorage`, `useConfirmAction`, `formatDuration`, `formatRelative`) are reused verbatim. All copy is reused from the Slate `stats_*` keys (CSS handles uppercasing) — **no new i18n keys**.

**Tech Stack:** Vite + Preact + TypeScript, Jest + jsdom + @testing-library/preact, biome, pnpm.

**Source of truth:** `design-system/preview/pokedex/screens-tabs.html` (Stats markup + `.stats-*`/`.pdx-popup__confirm` CSS), POKEDEX-IMPLEMENTATION.md §5 (Stats row, ConfirmOverlay row).

---

## File Structure

**Create:**
- `src/popup/components/ConfirmOverlay.pdx.tsx`
- `src/popup/tabs/StatsTab.pdx.tsx`
- `tests/popup/components/confirm-overlay-pdx.test.tsx`
- `tests/popup/tabs/stats-tab-pdx.test.tsx`

**Modify:**
- `src/popup/styles/popup.pdx.css` — append Stats + confirm + footer/button classes
- `src/popup/App.tsx` — route pokedex Stats tab to `StatsTabPdx`
- `tests/popup/app-play-pdx.test.tsx` or a new app test — (optional) assert stats routing

**Guarantee:** No `wh-*` markup or Slate stylesheet changes except `App.tsx`'s pokedex branch. Verify with `git diff` after the final task.

---

### Task 1: Append Stats + confirm CSS to `popup.pdx.css`

These classes live only in the preview's inline `<style>`. Fold them in.

**Files:** Modify `src/popup/styles/popup.pdx.css`.

- [ ] **Step 1: Append the block** (biome may reflow long values — fine):

```css
/* ===== Stats keycap action (CLEAR) ===================== */
.pdx-keycap-action {
  background: var(--pdx-key); border: 1px solid var(--pdx-key-2); border-bottom-width: 2px;
  border-radius: 4px; padding: 4px 8px; font-family: var(--pdx-font-pixel); font-size: 8px;
  letter-spacing: 0.06em; color: var(--pdx-on-key); text-transform: uppercase; cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7); display: inline-flex; align-items: center; gap: 5px;
}
.pdx-keycap-action iconify-icon, .pdx-keycap-action svg { font-size: 10px; color: var(--pdx-led-red); }
.pdx-keycap-action--danger { color: #8C0F31; }
.pdx-keycap-action--danger iconify-icon, .pdx-keycap-action--danger svg { color: var(--pdx-led-red); }

/* ===== Stats tab ======================================= */
.pdx-stats__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 2px 2px; }
.stats-list { display: flex; flex-direction: column; gap: 1px; background: rgba(15, 42, 64, 0.18); border: 1px solid rgba(15, 42, 64, 0.25); border-radius: 3px; overflow: hidden; }
.stats-row { display: grid; grid-template-columns: 1.5fr 1fr 0.9fr 14px 14px; align-items: center; gap: 6px; padding: 6px 8px; background: rgba(148, 221, 236, 0.32); }
.stats-row--header { background: rgba(15, 42, 64, 0.18); padding: 4px 8px 3px; }
.stats-row--header .col { font-family: var(--pdx-font-pixel); font-size: 6px; letter-spacing: 0.08em; color: var(--pdx-lcd-frame-2); text-transform: uppercase; }
.stats-row__word { display: flex; align-items: center; gap: 6px; font-family: var(--pdx-font-lcd); font-size: 16px; color: var(--pdx-lcd-ink); line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stats-row__dot { width: 6px; height: 6px; background: currentColor; border-radius: 1px; flex: 0 0 auto; }
.stats-row__time, .stats-row__dur { font-family: var(--pdx-font-lcd); font-size: 14px; line-height: 1; color: var(--pdx-lcd-ink-2); }
.stats-row__hint { width: 7px; height: 7px; border-radius: 1px; background: var(--pdx-lens); box-shadow: 0 0 3px var(--pdx-lens); margin: 0 auto; }
.stats-row__hint--empty { background: transparent; border: 1px solid var(--pdx-lcd-frame-2); box-shadow: none; }
.stats-row__link { display: flex; align-items: center; justify-content: center; color: var(--pdx-lens-deep); }
.stats-row__link iconify-icon, .stats-row__link svg { font-size: 12px; }
.stats-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 24px 32px; text-align: center; }
.stats-empty iconify-icon, .stats-empty svg { font-size: 36px; color: var(--pdx-lcd-frame-2); }
.stats-empty__line { font-family: var(--pdx-font-pixel); font-size: 9px; letter-spacing: 0.08em; color: var(--pdx-lcd-ink); text-transform: uppercase; }
.stats-empty__flavor { font-family: var(--pdx-font-lcd); font-size: 17px; color: var(--pdx-lcd-ink-2); line-height: 1; margin-top: -2px; }

/* ===== Footer + buttons (settings save / stats confirm) = */
.pdx-popup__footer { flex: 0 0 auto; padding: 10px 14px 12px; display: flex; gap: 8px; background: linear-gradient(180deg, var(--pdx-shell-2) 0%, var(--pdx-shell-deep) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 2px 0 var(--pdx-shell-deep), 0 -2px 6px rgba(0, 0, 0, 0.18); border-top: 1px solid rgba(0,0,0,0.35); }
.pdx-popup__footer-msg { flex: 1; align-self: center; font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; color: rgba(255,255,255,0.85); text-transform: uppercase; }
.pdx-btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.45); color: var(--pdx-on-shell); font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
.pdx-btn-primary { background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%); border: 1px solid #B89E50; border-bottom-width: 2px; color: #3A1208; font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; border-radius: 4px; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 0 8px rgba(255,210,63,0.35); }
.pdx-btn-danger { background: linear-gradient(180deg, #FF7A7A 0%, var(--pdx-led-red) 100%); border: 1px solid #B22020; border-bottom-width: 2px; color: #fff; font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; border-radius: 4px; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 0 8px rgba(255,59,59,0.35); text-shadow: 0 1px 0 rgba(0,0,0,0.3); }

/* ===== Stats confirm footer (sticky over the body) ===== */
.pdx-popup__confirm {
  position: absolute; left: 0; right: 0; bottom: 0; flex: 0 0 auto;
  padding: 10px 14px 12px; display: flex; gap: 8px; align-items: center;
  background: linear-gradient(180deg, var(--pdx-shell-2) 0%, var(--pdx-shell-deep) 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 -2px 6px rgba(0, 0, 0, 0.18);
  border-top: 1px solid rgba(0,0,0,0.35); z-index: 6;
}
```

> `.pdx-popup__confirm` is `position: absolute; bottom: 0` and resolves against `.pdx-popup` (already `position: relative`). It overlays the bottom of the LCD when armed — the solid raspberry gradient covers cleanly. We deliberately omit the preview's `.pdx-popup--with-confirm .pdx-popup__body { margin-bottom }` rule (it would need App to toggle a class on `.pdx-popup`; the brief overlay is acceptable).

- [ ] **Step 2: Build + Slate guard + lint**

```bash
pnpm build                                                              # succeeds
git diff --stat src/popup/styles/popup.css src/shared/styles/tokens.css # empty
pnpm biome check src/popup/styles/popup.pdx.css                         # clean
```

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(theme): add Pokedex Stats + confirm-footer CSS to popup.pdx.css

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `ConfirmOverlay.pdx.tsx`

Sticky raspberry confirm footer: a prompt message, a red danger key (confirm), and a ghost key (cancel). Same props as Slate `ConfirmOverlay`: `{ prompt: string; onConfirm: () => void; onCancel: () => void }`. Reuses `confirm_yes` + `settings_cancel` i18n keys.

**Files:**
- Create: `src/popup/components/ConfirmOverlay.pdx.tsx`
- Test: `tests/popup/components/confirm-overlay-pdx.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/components/confirm-overlay-pdx.test.tsx
import { render } from "@testing-library/preact";
import { ConfirmOverlayPdx } from "../../../src/popup/components/ConfirmOverlay.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderOverlay(onConfirm = () => {}, onCancel = () => {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ConfirmOverlayPdx prompt="Clear all hunts?" onConfirm={onConfirm} onCancel={onCancel} />
    </ThemeContext.Provider>
  );
}

describe("ConfirmOverlayPdx", () => {
  it("renders the raspberry confirm footer with the prompt", () => {
    const { container, getByText } = renderOverlay();
    expect(container.querySelector(".pdx-popup__confirm")).not.toBeNull();
    expect(container.querySelector(".pdx-btn-danger")).not.toBeNull();
    expect(container.querySelector(".pdx-btn-ghost")).not.toBeNull();
    expect(getByText("Clear all hunts?")).toBeInTheDocument();
  });

  it("fires onConfirm (danger) and onCancel (ghost)", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { container } = renderOverlay(onConfirm, onCancel);
    container.querySelector<HTMLButtonElement>(".pdx-btn-danger")?.click();
    container.querySelector<HTMLButtonElement>(".pdx-btn-ghost")?.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run, verify fail** — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/popup/components/ConfirmOverlay.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";

interface ConfirmOverlayProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmOverlayPdx({ prompt, onConfirm, onCancel }: ConfirmOverlayProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__confirm">
      <span class="pdx-popup__footer-msg">{prompt}</span>
      <button type="button" class="pdx-btn-danger" onClick={onConfirm}>
        {t("confirm_yes")}
      </button>
      <button type="button" class="pdx-btn-ghost" onClick={onCancel}>
        {t("settings_cancel")}
      </button>
    </div>
  );
}
```

> Confirm `confirm_yes` and `settings_cancel` exist in `en.ts` (the Slate `ConfirmOverlay` uses both). If `confirm_yes` does not exist, use whatever key the Slate version passes to its danger `Button`.

- [ ] **Step 4: Run, verify pass** — 2/2.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/components/ConfirmOverlay.pdx.tsx tests/popup/components/confirm-overlay-pdx.test.tsx
git add src/popup/components/ConfirmOverlay.pdx.tsx tests/popup/components/confirm-overlay-pdx.test.tsx
git commit -m "feat(theme): add ConfirmOverlay.pdx (raspberry confirm footer)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `StatsTab.pdx.tsx` + App routing

`StatsTab.pdx` duplicates `StatsTab.tsx`'s data/logic (`useStorage("finds")`, `useConfirmAction`, the `sorted` derivation, the empty-state branch) but renders the Pokédex tree: its own `.pdx-popup__body > .pdx-popup__body-inner` containing the header (hunt count + CLEAR keycap) and the `.stats-list` table; the armed `ConfirmOverlayPdx` renders as a sibling of the body (sticky footer). `App` routes `active === "stats"` to `StatsTabPdx`.

**Files:**
- Create: `src/popup/tabs/StatsTab.pdx.tsx`
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/tabs/stats-tab-pdx.test.tsx`

> **Before implementing:** re-read `src/popup/tabs/StatsTab.tsx` and copy its hooks/derivations verbatim. Confirm the `useConfirmAction` API (`{ arm, armed, confirm, cancel }`), `HuntRecord` fields (`word`, `foundAt`, `searchDurationSeconds`, `hintUsed`, `pageUrl`, `pageTitle`, `list`), and `formatRelative`/`formatDuration` signatures from `../utils/format`. Confirm the `stats_*` i18n keys used below all exist (they are the same ones the Slate StatsTab uses): `stats_empty_body`, `stats_empty_editorial`, `stats_n_hunts`, `stats_clear`, `stats_clear_confirm`, `stats_col_word`, `stats_col_found`, `stats_col_duration_tooltip`, `stats_col_hint_header`, `stats_col_page`, `stats_hint_used_aria`, `stats_no_hint_aria`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/tabs/stats-tab-pdx.test.tsx
import { act, fireEvent, render } from "@testing-library/preact";
import { StatsTabPdx } from "../../../src/popup/tabs/StatsTab.pdx";
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
  };
}

function renderStats() {
  return render(
    <ThemeContext.Provider value="pokedex">
      <StatsTabPdx />
    </ThemeContext.Provider>
  );
}

const REC = {
  word: "otter",
  foundAt: Date.now(),
  searchDurationSeconds: 12,
  hintUsed: false,
  pageUrl: "https://example.com",
  pageTitle: "Example",
  list: "animals" as const,
};

describe("StatsTabPdx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the LCD empty state when there are no hunts", async () => {
    setupChromeMock({ finds: [] });
    const { container } = renderStats();
    await act(async () => {});
    expect(container.querySelector(".stats-empty")).not.toBeNull();
  });

  it("renders the LCD list with a row per hunt and a CLEAR keycap", async () => {
    setupChromeMock({ finds: [REC] });
    const { container, getByText } = renderStats();
    await act(async () => {});
    expect(container.querySelector(".pdx-popup__body")).not.toBeNull();
    expect(container.querySelector(".stats-list")).not.toBeNull();
    // header row + 1 data row
    expect(container.querySelectorAll(".stats-row").length).toBe(2);
    expect(container.querySelector(".pdx-keycap-action")).not.toBeNull();
    expect(getByText("otter")).toBeInTheDocument();
  });

  it("arms a confirm footer when CLEAR is clicked", async () => {
    setupChromeMock({ finds: [REC] });
    const { container } = renderStats();
    await act(async () => {});
    fireEvent.click(container.querySelector(".pdx-keycap-action") as HTMLButtonElement);
    expect(container.querySelector(".pdx-popup__confirm")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail** — module not found.

- [ ] **Step 3: Implement `StatsTab.pdx.tsx`**

```tsx
// src/popup/tabs/StatsTab.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { HuntRecord, WordSource } from "../../shared/types";
import { ConfirmOverlayPdx } from "../components/ConfirmOverlay.pdx";
import { Icon } from "../components/Icon";
import { useConfirmAction } from "../hooks/useConfirmAction";
import { useStorage } from "../hooks/useStorage";
import { formatDuration, formatRelative } from "../utils/format";

const DOT_COLOR: Record<WordSource, string> = {
  animals: "var(--pdx-led-green)",
  pokemon: "var(--pdx-led-red)",
  custom: "var(--pdx-lcd-ink-2)",
};

export function StatsTabPdx(): JSX.Element {
  const t = useT();
  const [finds, setFinds] = useStorage("finds", []);
  const clearAction = useConfirmAction({ onConfirm: () => setFinds([]) });

  if (finds.length === 0) {
    return (
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="stats-empty">
            <Icon name="search" size={36} />
            <span class="stats-empty__line">{t("stats_empty_body")}</span>
            <span class="stats-empty__flavor">{t("stats_empty_editorial")}</span>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...finds].sort((a, b) => b.foundAt - a.foundAt);

  return (
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="pdx-stats__header">
            <span class="pdx-progress__label">{t("stats_n_hunts", { count: finds.length })}</span>
            <button type="button" class="pdx-keycap-action pdx-keycap-action--danger" onClick={clearAction.arm}>
              <Icon name="trash" size={10} />
              {t("stats_clear")}
            </button>
          </div>
          <div class="stats-list">
            <div class="stats-row stats-row--header" aria-hidden="true">
              <span class="col">{t("stats_col_word")}</span>
              <span class="col">{t("stats_col_found")}</span>
              <span class="col">
                <Icon name="timer" size={10} />
              </span>
              <span class="col">{t("stats_col_hint_header")}</span>
              <span class="col">{t("stats_col_page")}</span>
            </div>
            {sorted.map((r) => (
              <StatsRowPdx key={`${r.word}-${r.foundAt}`} record={r} />
            ))}
          </div>
        </div>
      </div>

      {clearAction.armed && (
        <ConfirmOverlayPdx
          prompt={t("stats_clear_confirm")}
          onConfirm={clearAction.confirm}
          onCancel={clearAction.cancel}
        />
      )}
    </>
  );
}

function StatsRowPdx({ record }: { record: HuntRecord }): JSX.Element {
  const t = useT();
  const dotColor = record.list ? DOT_COLOR[record.list] : "var(--pdx-lcd-ink-2)";
  return (
    <div class="stats-row">
      <span class="stats-row__word" title={record.word}>
        <span class="stats-row__dot" style={{ color: dotColor }} />
        {record.word}
      </span>
      <span class="stats-row__time">{formatRelative(record.foundAt)}</span>
      <span class="stats-row__dur">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={`stats-row__hint${record.hintUsed ? "" : " stats-row__hint--empty"}`}
        role="img"
        aria-label={record.hintUsed ? t("stats_hint_used_aria") : t("stats_no_hint_aria")}
      />
      <a
        class="stats-row__link"
        href={record.pageUrl}
        target="_blank"
        rel="noopener"
        aria-label={record.pageTitle}
      >
        <Icon name="external" size={12} />
      </a>
    </div>
  );
}
```

> Note the `.stats-row__dot` uses `color` (the CSS sets `background: currentColor`). The header row has exactly 5 `.col` children matching the 5-column grid (TRAP #4). If `stats_n_hunts` interpolates `{count}`, keep the same param name the Slate version uses.

- [ ] **Step 4: Route Stats in `App.tsx`**

Add `import { StatsTabPdx } from "./tabs/StatsTab.pdx";` and extend the pokedex-branch body routing so Stats joins Play in owning its surface:

```tsx
            {active === "play" ? (
              <PlayTabPdx />
            ) : active === "stats" ? (
              <StatsTabPdx />
            ) : (
              <div class="pdx-popup__body">
                <div class="pdx-popup__body-inner">{panels}</div>
              </div>
            )}
```

- [ ] **Step 5: Run the new tests**

Run: `pnpm jest tests/popup/tabs/stats-tab-pdx.test.tsx tests/popup/components/confirm-overlay-pdx.test.tsx` → PASS.

- [ ] **Step 6: Full verification**

```bash
pnpm test            # all suites pass
pnpm tsc --noEmit    # clean
pnpm build           # succeeds
git diff --stat 7981218 -- src/popup/styles/popup.css src/shared/styles/tokens.css   # empty
```

- [ ] **Step 7: Commit**

```bash
git add src/popup/tabs/StatsTab.pdx.tsx src/popup/App.tsx tests/popup/tabs/stats-tab-pdx.test.tsx
git commit -m "feat(theme): fork Stats tab into StatsTab.pdx + route it from App

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:** StatsTab (LCD list rows, squared dots, cyan hint cell, CLEAR → confirm footer) → all tasks ✓. ConfirmOverlay (raspberry sliding footer, red destructive key) → Task 2 ✓.

**Trap #4:** `.stats-row` (data + header) has exactly 5 children for the 5-column grid. Asserted indirectly via row count.

**Behaviour preserved:** `useStorage`/`useConfirmAction`/`formatRelative`/`formatDuration` reused; empty-state and sort logic copied from Slate. Tooltips (`wh-tooltip`/`data-tooltip`) are intentionally dropped — the Slate tooltip system is `wh`-scoped; pokedex uses native `title`/`aria-label` instead (a deliberate, documented simplification; revisit in Phase 6 if tooltips are wanted on the device).

**Type consistency:** `ConfirmOverlayProps` matches Slate. `HuntRecord`/`WordSource` from `../../shared/types`. Exports use the `…Pdx` suffix. App routing mirrors the established Play pattern.

**No new i18n keys:** all `stats_*` / `confirm_yes` / `settings_cancel` reused; CSS `text-transform: uppercase` handles pixel casing.

**Open risk for review:** the confirm footer overlaps the bottom rows of the list when armed (we omitted the `margin-bottom` push to avoid App coupling). Acceptable for a transient confirm; note for Phase 6 smoke test.
