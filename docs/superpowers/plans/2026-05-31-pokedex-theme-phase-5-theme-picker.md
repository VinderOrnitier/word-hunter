# Pokédex Theme — Phase 5 (Theme picker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a THEME picker as the first field of the Settings tab in BOTH skins (Slate + Pokédex), letting the user switch the active extension theme; the picker writes the top-level `theme` storage key and tells the user to reopen the popup to apply.

**Architecture:** Parallel skins (ADR 007). Each `SettingsTab` owns its own picker markup — no shared component. The picker writes `theme` via `useStorage("theme", DEFAULT_THEME)` (immediate write, NOT part of the draft/isDirty/Save flow, because `theme` is a top-level key, not in `GameSettings`). No live swap: `useTheme()` reads once on mount, so a static helper line tells the user "switching reopens the popup". This is the FIRST intentional modification of the Slate `SettingsTab.tsx` — the theme picker is a genuine shared feature; the "Slate byte-identical" invariant ends at this phase, by design.

**Tech Stack:** Preact + TypeScript; Jest + jsdom + @testing-library/preact; CSS custom properties (`--wh-*` / `--pdx-*`); i18n via `useT()` + `en.ts` keys (all 4 locales kept complete).

---

### Task 5.1: i18n keys for the theme picker

**Files:**
- Modify: `src/i18n/messages/en.ts` (after `settings_save: "Save",`)
- Modify: `src/i18n/messages/de.ts`, `src/i18n/messages/uk.ts`, `src/i18n/messages/ja.ts` (same insertion point — EN-fallback stubs, per-milestone translation later)

- [ ] **Step 1: Add keys to `en.ts`**

Insert immediately after the `settings_save: "Save",` line:

```ts
  settings_theme_label: "Theme",
  settings_theme_slate: "Slate",
  settings_theme_pokedex: "Pokédex",
  settings_theme_reopen_hint: "switching reopens the popup",
```

- [ ] **Step 2: Add the SAME four keys (English values, fallback stubs) to `de.ts`, `uk.ts`, `ja.ts`**

Each file gets the identical block after its `settings_save` entry:

```ts
  settings_theme_label: "Theme",
  settings_theme_slate: "Slate",
  settings_theme_pokedex: "Pokédex",
  settings_theme_reopen_hint: "switching reopens the popup",
```

- [ ] **Step 3: Verify typecheck passes (all four locales are `Record<MessageKey, string>`)**

Run: `pnpm typecheck`
Expected: PASS (no missing-key errors across locales)

- [ ] **Step 4: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/de.ts src/i18n/messages/uk.ts src/i18n/messages/ja.ts
git commit -m "feat(i18n): add theme-picker strings (settings_theme_*)"
```

---

### Task 5.2: Pokédex theme-tile CSS

**Files:**
- Modify: `src/popup/styles/popup.pdx.css` (append after the last `.settings-field*` block, before the next component section)

- [ ] **Step 1: Append the theme-tile CSS**

```css
/* ---------- Theme picker tiles (Phase 5) ----------
   Swatch colours are intentional literals: each tile previews the OTHER
   skin's real shell/accent colours, so they must NOT use --pdx-* tokens. */
.pdx-theme-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}
.pdx-theme-tile {
  position: relative;
  padding: 8px;
  background: linear-gradient(180deg, #0b0f19, #0f1422);
  border: 1px solid #2a3142;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}
.pdx-theme-tile.is-active {
  background: linear-gradient(180deg, #ffe9b0 0%, var(--pdx-led-yellow) 100%);
  border-color: #b89e50;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 0 6px rgba(255, 210, 63, 0.45);
}
.pdx-theme-tile__swatch {
  display: block;
  height: 36px;
  border-radius: 2px;
  margin-bottom: 6px;
  position: relative;
}
.pdx-theme-tile--slate .pdx-theme-tile__swatch {
  background: linear-gradient(180deg, #1c2030 0%, #0f1422 100%);
}
.pdx-theme-tile--pokedex .pdx-theme-tile__swatch {
  background: linear-gradient(180deg, #d32b5c, #8c0f31);
}
.pdx-theme-tile__accent {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  height: 4px;
  border-radius: 1px;
}
.pdx-theme-tile--slate .pdx-theme-tile__accent {
  background: #ffd23f;
}
.pdx-theme-tile--pokedex .pdx-theme-tile__accent {
  background: #6fc8dc;
}
.pdx-theme-tile__name {
  font-family: var(--pdx-font-pixel);
  font-size: 7px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
}
.pdx-theme-tile.is-active .pdx-theme-tile__name {
  color: #4a3a0e;
}
```

- [ ] **Step 2: Verify Slate token file untouched & build CSS compiles**

Run: `pnpm build`
Expected: PASS (build succeeds; no CSS syntax errors)

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(pokedex): add theme-picker tile styles"
```

---

### Task 5.3: Pokédex SettingsTab — THEME field (TDD)

**Files:**
- Test: `tests/popup/tabs/settings-tab-pdx.test.tsx` (add a `describe`/`it` block)
- Modify: `src/popup/tabs/SettingsTab.pdx.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe("SettingsTabPdx", ...)` block (the file's `setupChromeMock` returns `{ setMock }`; the `get` mock answers any key incl. `"theme"`):

```tsx
  it("renders the THEME field as the first settings field with two tiles", () => {
    setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTabPdx />);
    const tiles = container.querySelectorAll(".pdx-theme-tile");
    expect(tiles.length).toBe(2);
    // THEME field is first in the body
    const firstField = container.querySelector(".settings-field");
    expect(firstField?.querySelector(".pdx-theme-tiles")).toBeTruthy();
  });

  it("marks the stored theme's tile active", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<SettingsTabPdx />);
    await waitFor(() => {
      const active = container.querySelector(".pdx-theme-tile.is-active");
      expect(active?.classList.contains("pdx-theme-tile--pokedex")).toBe(true);
    });
  });

  it("writes the theme key when a tile is clicked", async () => {
    const { setMock } = setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTabPdx />);
    const slateTile = container.querySelector(".pdx-theme-tile--pokedex") as HTMLElement;
    fireEvent.click(slateTile);
    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ theme: "pokedex" });
    });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test -- settings-tab-pdx`
Expected: FAIL (`.pdx-theme-tile` not found)

- [ ] **Step 3: Implement the THEME field**

In `src/popup/tabs/SettingsTab.pdx.tsx`:

(a) Add imports at the top (with the other `../../shared` imports):

```ts
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";
```

(Keep the existing `GameSettings` type import; add `Theme` to it if it's a combined import, otherwise add a new line.)

(b) Inside the component, after the `useStorage("locale", "en")` line, add:

```ts
  const [theme, setTheme] = useStorage("theme", DEFAULT_THEME);
```

(c) Add a small typed list above the `return` (near the top of the component body, after the hooks):

```ts
  const themeTiles: Array<{ value: Theme; labelKey: "settings_theme_slate" | "settings_theme_pokedex" }> = [
    { value: "slate", labelKey: "settings_theme_slate" },
    { value: "pokedex", labelKey: "settings_theme_pokedex" },
  ];
```

(d) Insert the THEME field as the FIRST child of `.pdx-popup__body-inner`, immediately after the opening `<div class="pdx-section-eyebrow">…SETTINGS…</div>` block and BEFORE the `{/* LANGUAGE … */}` field:

```tsx
          {/* THEME */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_theme_label")}</span>
            <div class="settings-field__row">
              <div class="pdx-theme-tiles">
                {themeTiles.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    class={`pdx-theme-tile pdx-theme-tile--${value}${theme === value ? " is-active" : ""}`}
                    aria-pressed={theme === value}
                    onClick={() => setTheme(value)}
                  >
                    <span class="pdx-theme-tile__swatch">
                      <span class="pdx-theme-tile__accent" />
                    </span>
                    <span class="pdx-theme-tile__name">{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <span class="settings-field__helper">{t("settings_theme_reopen_hint")}</span>
          </div>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test -- settings-tab-pdx`
Expected: PASS

- [ ] **Step 5: Verify typecheck + the full suite still green**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/popup/tabs/SettingsTab.pdx.tsx tests/popup/tabs/settings-tab-pdx.test.tsx
git commit -m "feat(pokedex): add THEME picker to the Settings tab"
```

---

### Task 5.4: Slate theme-tile CSS

**Files:**
- Modify: `src/popup/styles/popup.css` (append near the `.wh-settings__*` block, e.g. after `.wh-settings__notif-header` / before the footer media block — append at the end of the `.wh-settings` group is fine)

- [ ] **Step 1: Append the Slate theme-tile CSS**

```css
/* ---------- Theme picker tiles (Phase 5) ----------
   Swatch colours are intentional literals previewing each skin's real
   shell/accent colours; they must NOT use --wh-* tokens. */
.wh-settings__theme-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}
.wh-settings__theme-tile {
  position: relative;
  padding: 8px;
  background: var(--wh-surface-2);
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-md);
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.wh-settings__theme-tile:hover {
  border-color: var(--wh-border-strong, var(--wh-border));
}
.wh-settings__theme-tile.is-active {
  border-color: var(--wh-selected);
  box-shadow: 0 0 0 3px var(--wh-selected-soft);
}
.wh-settings__theme-swatch {
  display: block;
  height: 36px;
  border-radius: var(--wh-radius-sm, 4px);
  margin-bottom: 6px;
  position: relative;
}
.wh-settings__theme-tile--slate .wh-settings__theme-swatch {
  background: linear-gradient(180deg, #1c2030 0%, #0f1422 100%);
}
.wh-settings__theme-tile--pokedex .wh-settings__theme-swatch {
  background: linear-gradient(180deg, #d32b5c, #8c0f31);
}
.wh-settings__theme-accent {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  height: 4px;
  border-radius: 1px;
}
.wh-settings__theme-tile--slate .wh-settings__theme-accent {
  background: #ffd23f;
}
.wh-settings__theme-tile--pokedex .wh-settings__theme-accent {
  background: #6fc8dc;
}
.wh-settings__theme-name {
  font-size: var(--wh-text-sm, 12px);
  font-weight: 600;
  color: var(--wh-text);
}
```

> Note: if any referenced token (`--wh-radius-sm`, `--wh-text-sm`, `--wh-border-strong`) does not exist in `tokens.css`, the `var(..., fallback)` second argument keeps it valid. Verify token names against `src/shared/styles/tokens.css` while implementing and drop the fallback only where the token is confirmed to exist.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.css
git commit -m "feat(settings): add theme-picker tile styles (slate)"
```

---

### Task 5.5: Slate SettingsTab — THEME field (TDD)

**Files:**
- Test: `tests/popup/settings-tab.test.tsx` (add `it` blocks)
- Modify: `src/popup/tabs/SettingsTab.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the existing `describe("SettingsTab", ...)` block (its `setupChromeMock` returns `{ store, setMock }`):

```tsx
  it("renders the THEME field as the first field with two tiles", () => {
    setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTab />);
    const tiles = container.querySelectorAll(".wh-settings__theme-tile");
    expect(tiles.length).toBe(2);
    const firstField = container.querySelector(".wh-field");
    expect(firstField?.querySelector(".wh-settings__theme-tiles")).toBeTruthy();
  });

  it("marks the stored theme's tile active", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<SettingsTab />);
    await waitFor(() => {
      const active = container.querySelector(".wh-settings__theme-tile.is-active");
      expect(active?.classList.contains("wh-settings__theme-tile--pokedex")).toBe(true);
    });
  });

  it("writes the theme key when a tile is clicked", async () => {
    const { setMock } = setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTab />);
    const pokedexTile = container.querySelector(".wh-settings__theme-tile--pokedex") as HTMLElement;
    fireEvent.click(pokedexTile);
    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ theme: "pokedex" });
    });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test -- settings-tab.test`
Expected: FAIL (`.wh-settings__theme-tile` not found)

- [ ] **Step 3: Implement the THEME field**

In `src/popup/tabs/SettingsTab.tsx`:

(a) Add imports:

```ts
import { DEFAULT_SETTINGS, DEFAULT_THEME } from "../../shared/constants";
import type { GameSettings, Theme } from "../../shared/types";
```

(Merge with the existing `DEFAULT_SETTINGS` / `GameSettings` imports — do not duplicate.)

(b) After the `useStorage("locale", "en")` line add:

```ts
  const [theme, setTheme] = useStorage("theme", DEFAULT_THEME);
```

(c) Add the tile list after the hooks (before `return`):

```ts
  const themeTiles: Array<{ value: Theme; labelKey: "settings_theme_slate" | "settings_theme_pokedex" }> = [
    { value: "slate", labelKey: "settings_theme_slate" },
    { value: "pokedex", labelKey: "settings_theme_pokedex" },
  ];
```

(d) Insert as the FIRST child of `.wh-settings__scroll`, immediately before the existing language `<Field …>`:

```tsx
        <Field label={t("settings_theme_label")} helper={t("settings_theme_reopen_hint")}>
          <div class="wh-settings__theme-tiles">
            {themeTiles.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                class={`wh-settings__theme-tile wh-settings__theme-tile--${value}${theme === value ? " is-active" : ""}`}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <span class="wh-settings__theme-swatch">
                  <span class="wh-settings__theme-accent" />
                </span>
                <span class="wh-settings__theme-name">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </Field>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test -- settings-tab.test`
Expected: PASS

- [ ] **Step 5: Verify typecheck + full suite + build**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/popup/tabs/SettingsTab.tsx tests/popup/settings-tab.test.tsx
git commit -m "feat(settings): add THEME picker to the Settings tab (slate)"
```

---

## Self-Review

- **Spec coverage:** THEME field added to both skins (5.3 pokedex, 5.5 slate); preview tiles (5.2/5.4 CSS); writes `theme` key (5.3/5.5 tests assert `setMock` called with `{ theme }`); reopen notice (`settings_theme_reopen_hint` helper); i18n complete in all 4 locales (5.1). ✓
- **No placeholders:** every step has concrete code/commands. ✓
- **Type consistency:** `Theme` ("slate" | "pokedex") used uniformly; `useStorage("theme", DEFAULT_THEME)` typed via `StorageSchema.theme`; `labelKey` union matches the two new keys. ✓
- **Slate-untouched invariant:** intentionally ends here — `SettingsTab.tsx` + `popup.css` are modified by design (shared feature). Other Slate files remain untouched; verify with `git diff --stat origin/master -- src/popup/tabs/SettingsTab.tsx` shows only the picker additions.
