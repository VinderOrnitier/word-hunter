# Pokédex Theme — Phase 3c (Rules tab + LCD select) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the Rules view into a Pokédex sibling (`RulesTab.pdx.tsx`), style the language `<select class="pdx-select">` placeholder introduced in 3b, route the pokedex Rules view from `App.tsx`, and retire the now-dead generic body well from the pokedex branch — without touching Slate.

**Architecture:** Parallel skins (ADR 007). `RulesTab.pdx` owns its own `.pdx-popup__body > .pdx-popup__body-inner` well (mirrors `StatsTab.pdx`/`SettingsTab.pdx`) and renders the same informational content as Slate `RulesTab` (editorial line, body, three numbered steps, settings hint, disclaimer) using Pokédex markup (`.rules-content`, `.rules-list`). After this fork, all four destinations (play/stats/settings/rules) are forked, so the pokedex branch's final `else` generic well is removed.

**Tech Stack:** Preact + TypeScript, Jest + @testing-library/preact, CSS custom properties scoped under `.pdx`.

---

## Context for the implementer (read before starting)

- **Slate source of truth:** `src/popup/tabs/RulesTab.tsx` — renders `rules_editorial`, `rules_body`, `rules_step_1/2/3`, a settings-hint row (`<Icon name="settings"/>` + `rules_settings`), and `rules_disclaimer`. The Pokédex fork keeps the SAME content (full parity), only the markup/visual treatment changes.
- **Design markup/CSS:** `design-system/preview/pokedex/screens-tabs.html` Rules section (~lines 1218–1236) and its `<style>` (`.rules-content*`, `.rules-list*`, `.rules-kbd` ~lines 590–638). **Note:** the preview's rule TEXT ("hidden in paragraphs of 30 words", "CTRL F" hint, etc.) is placeholder flavor that does NOT match the real `rules_*` strings — per POKEDEX-IMPLEMENTATION the real i18n strings win. We render `rules_step_1/2/3` ("Pick a word…", "Press Start…", "Reload the page…") with `01/02/03` markers. We do NOT render the preview's CTRL+F kbd line (no backing string), so `.rules-kbd` CSS is intentionally NOT added (would be dead).
- **No new i18n keys.** Reuse `rules_editorial`, `rules_body`, `rules_step_1`, `rules_step_2`, `rules_step_3`, `rules_settings`, `rules_disclaimer`, and `header_rules_aria` ("Rules") for the section eyebrow title.
- **No SearchableSelect fork.** `SearchableSelect` is unused in the popup; the language picker is a native `<select>`. 3b already renders `<select class="pdx-select">` in `SettingsTab.pdx`; this phase only adds the `.pdx-select` CSS to style it.
- **Eyebrow + body-well pattern:** mirror `StatsTab.pdx.tsx` — `<div class="pdx-popup__body"><div class="pdx-popup__body-inner"> <div class="pdx-section-eyebrow"><span class="pdx-section-eyebrow__title">…</span></div> … </div></div>`.
- **Icon under pokedex:** `<Icon name="settings" />` forks to the pixelarticons "sliders" glyph (already used by the settings tab — valid `IconName`).
- **App pokedex routing today** (`src/popup/App.tsx`): `active === "play" ? <PlayTabPdx/> : active === "stats" ? <StatsTabPdx/> : active === "settings" ? <SettingsTabPdx/> : (<div class="pdx-popup__body"><div class="pdx-popup__body-inner">{panels}</div></div>)`. The `panels` variable is still consumed by the Slate branch (`<main class="wh-popup__main">{panels}</main>`) — keep it; only stop using it in the pokedex branch.
- **After each task:** `pnpm test`, `pnpm typecheck`, `pnpm build` green, and Slate untouched: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css src/popup/tabs/RulesTab.tsx` must be EMPTY. Commit per task. PostToolUse hook runs `biome check --write`; re-stage if it reformats.

---

### Task 3c.1: Append Rules + `.pdx-select` CSS to `popup.pdx.css`

**Files:**
- Modify: `src/popup/styles/popup.pdx.css` (append at end)

No test (pure CSS).

- [ ] **Step 1: Append** to the END of `src/popup/styles/popup.pdx.css`:

```css
/* =========================================================
   RULES VIEW (Phase 3c)
   ========================================================= */
.rules-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 4px 0;
}
.rules-content__intro {
  font-family: var(--pdx-font-lcd);
  font-size: 20px;
  line-height: 1.15;
  color: var(--pdx-lcd-ink);
}
.rules-content__body {
  font-family: var(--pdx-font-ui);
  font-size: 12px;
  line-height: 1.55;
  color: var(--pdx-lcd-ink);
}
.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rules-list li {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 8px;
  font-family: var(--pdx-font-ui);
  font-size: 12px;
  line-height: 1.5;
  color: var(--pdx-lcd-ink);
}
.rules-list__marker {
  font-family: var(--pdx-font-pixel);
  font-size: 10px;
  color: var(--pdx-shell-deep);
  line-height: 1.5;
}
.rules-settings {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--pdx-font-ui);
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--pdx-lcd-ink-2);
}
.rules-settings svg {
  flex: 0 0 auto;
}
.rules-disclaimer {
  font-family: var(--pdx-font-ui);
  font-size: 10.5px;
  line-height: 1.4;
  color: var(--pdx-lcd-ink-2);
  margin: 0;
}

/* --- LCD-styled native select (language picker) --- */
.pdx-select {
  width: 100%;
  font-family: var(--pdx-font-ui);
  font-size: 12px;
  color: var(--pdx-lcd-ink);
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 100%);
  border: 1px solid var(--pdx-lcd-frame);
  border-radius: 3px;
  padding: 6px 8px;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25);
}
.pdx-select:focus-visible {
  outline: 2px solid var(--pdx-led-yellow);
  outline-offset: 1px;
}
```

- [ ] **Step 2: Verify Slate CSS untouched + build parses**

Run: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css`
Expected: empty.

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(pokedex): add Rules view + LCD select CSS"
```

---

### Task 3c.2: `RulesTab.pdx` component

**Files:**
- Create: `src/popup/tabs/RulesTab.pdx.tsx`
- Test: `tests/popup/tabs/rules-tab-pdx.test.tsx`

- [ ] **Step 1: Write the failing test** in `tests/popup/tabs/rules-tab-pdx.test.tsx`:

```tsx
import { render } from "@testing-library/preact";
import { RulesTabPdx } from "../../../src/popup/tabs/RulesTab.pdx";
import en from "../../../src/i18n/messages/en";

describe("RulesTabPdx", () => {
  it("renders its own LCD body well", () => {
    const { container } = render(<RulesTabPdx />);
    expect(container.querySelector(".pdx-popup__body")).toBeTruthy();
    expect(container.querySelector(".pdx-popup__body-inner")).toBeTruthy();
    expect(container.querySelector(".rules-content")).toBeTruthy();
  });

  it("renders the editorial intro and body copy", () => {
    const { getByText } = render(<RulesTabPdx />);
    expect(getByText(en.rules_editorial)).toBeTruthy();
    expect(getByText(en.rules_body)).toBeTruthy();
  });

  it("renders the three steps with zero-padded markers", () => {
    const { container, getByText } = render(<RulesTabPdx />);
    const items = container.querySelectorAll(".rules-list li");
    expect(items).toHaveLength(3);
    const markers = Array.from(container.querySelectorAll(".rules-list__marker")).map(
      (m) => m.textContent,
    );
    expect(markers).toEqual(["01", "02", "03"]);
    expect(getByText(en.rules_step_1)).toBeTruthy();
    expect(getByText(en.rules_step_2)).toBeTruthy();
    expect(getByText(en.rules_step_3)).toBeTruthy();
  });

  it("renders the settings hint and disclaimer (parity with Slate)", () => {
    const { getByText, container } = render(<RulesTabPdx />);
    expect(getByText(en.rules_settings)).toBeTruthy();
    expect(getByText(en.rules_disclaimer)).toBeTruthy();
    expect(container.querySelector(".rules-settings svg")).toBeTruthy();
  });
});
```

> **Implementer:** `import en from ".../messages/en"` — confirm the module's default export shape by checking an existing test that imports the messages (e.g. how `tests/i18n` imports them). If `en` is a named export, adjust the import accordingly.

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/popup/tabs/rules-tab-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/popup/tabs/RulesTab.pdx.tsx`:**

```tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { Icon } from "../components/Icon";

const STEP_KEYS: MessageKey[] = ["rules_step_1", "rules_step_2", "rules_step_3"];

export function RulesTabPdx(): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-popup__body">
      <div class="pdx-popup__body-inner">
        <div class="pdx-section-eyebrow">
          <span class="pdx-section-eyebrow__title">{t("header_rules_aria")}</span>
        </div>
        <div class="rules-content">
          <span class="rules-content__intro">{t("rules_editorial")}</span>
          <p class="rules-content__body">{t("rules_body")}</p>
          <ol class="rules-list">
            {STEP_KEYS.map((key, i) => (
              <li key={key}>
                <span class="rules-list__marker">{String(i + 1).padStart(2, "0")}</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
          <div class="rules-settings">
            <Icon name="settings" size={12} />
            <span>{t("rules_settings")}</span>
          </div>
          <p class="rules-disclaimer">{t("rules_disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/popup/tabs/rules-tab-pdx.test.tsx`
Expected: PASS (all 4).

- [ ] **Step 5: Commit**

```bash
git add src/popup/tabs/RulesTab.pdx.tsx tests/popup/tabs/rules-tab-pdx.test.tsx
git commit -m "feat(pokedex): add RulesTab.pdx surface"
```

---

### Task 3c.3: Route the pokedex Rules view + retire the generic well

**Files:**
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/app-play-pdx.test.tsx` (extend)

- [ ] **Step 1: Add the import** in `src/popup/App.tsx` (alphabetical with the other `.pdx` tab imports — after `RulesTab`):

```tsx
import { RulesTabPdx } from "./tabs/RulesTab.pdx";
```

- [ ] **Step 2: Replace the pokedex body region ternary** — route rules and drop the generic well. Change:

```tsx
{active === "play" ? (
  <PlayTabPdx />
) : active === "stats" ? (
  <StatsTabPdx />
) : active === "settings" ? (
  <SettingsTabPdx />
) : (
  <div class="pdx-popup__body">
    <div class="pdx-popup__body-inner">{panels}</div>
  </div>
)}
```

to:

```tsx
{active === "play" ? (
  <PlayTabPdx />
) : active === "stats" ? (
  <StatsTabPdx />
) : active === "settings" ? (
  <SettingsTabPdx />
) : (
  <RulesTabPdx />
)}
```

(All four destinations are now forked; `active` is one of play/stats/settings/rules, so the final `else` is the rules view.)

- [ ] **Step 3: Add the routing test** to `tests/popup/app-play-pdx.test.tsx` (the Rules toggle lives on the header info key — click the button with the `header_rules_aria` accessible name, "Rules"):

```tsx
it("routes the Rules view to the Pokédex rules surface via the header info key", async () => {
  setupChromeMock({ theme: "pokedex" });
  const { container } = render(<App />);
  await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());

  fireEvent.click(screen.getByRole("button", { name: /rules/i }));

  await waitFor(() => expect(container.querySelector(".rules-content")).not.toBeNull());
  // Slate rules surface must NOT be present
  expect(container.querySelector(".wh-rules")).toBeNull();
});
```

(`fireEvent`, `screen`, `waitFor` are already imported in this file from 3b.7.)

- [ ] **Step 4: Run the App test + full suite + typecheck**

Run: `pnpm test tests/popup/app-play-pdx.test.tsx`
Expected: PASS (3 tests).

Run: `pnpm test && pnpm typecheck`
Expected: green.

- [ ] **Step 5: Verify the Slate branch unchanged + Slate files untouched**

Run: `git diff -- src/popup/App.tsx`
Expected: only the new `RulesTabPdx` import + the pokedex-branch ternary change; the Slate `return` block and the `panels` definition unchanged.

Run: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css src/popup/tabs/RulesTab.tsx`
Expected: empty.

- [ ] **Step 6: Build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/popup/App.tsx tests/popup/app-play-pdx.test.tsx
git commit -m "feat(pokedex): route Rules view to RulesTab.pdx and retire generic well"
```

---

## Self-Review (controller, before dispatch)

- **Spec coverage:** Rules forked ✓ (3c.2); Rules + `.pdx-select` CSS ✓ (3c.1); language select now styled ✓; App routing + generic-well removal ✓ (3c.3).
- **Content parity:** RulesTab.pdx renders the SAME strings as Slate (`rules_editorial`/`rules_body`/`rules_step_1-3`/`rules_settings`/`rules_disclaimer`); no invented copy; preview's CTRL+F line and `.rules-kbd` deliberately omitted.
- **No new keys / no SearchableSelect fork** (both confirmed unnecessary).
- **Type consistency:** `STEP_KEYS: MessageKey[]` keeps `t(key)` type-safe; markers via `padStart(2,"0")`.
- **Slate guarantee:** every task ends with a `git diff --stat` on Slate files; `RulesTab.tsx`/`popup.css`/`tokens.css` must stay empty in the diff.
- **Out of scope (deferred):** theme picker (Phase 5); in-page overlays (Phase 4); reduced-motion/a11y polish + smoke test + PR (Phase 6).
- **Milestone note:** after 3c, the entire popup (all surfaces + form controls) is forked. Phase 4 moves to in-page (content-script) overlays.
