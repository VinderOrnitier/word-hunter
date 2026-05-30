# Pokédex theme — Phase 2a: Popup shell fork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fork the popup *shell* (the device chrome: header, tabs, ridge, LCD body well) into a Pokédex variant, so that when `theme === "pokedex"` the popup renders the raspberry "game-device" frame instead of the Slate frame — Slate left byte-identical.

**Architecture:** Per the agreed mechanism, each presentational surface gets a **sibling `.pdx.tsx` file**; the logic owner picks the variant by `useThemeContext()`. `App.tsx` is the shell owner — it branches its `return` on theme. For pokedex it renders `<div class="pdx"><div class="pdx-popup"> header + tabs + ridge + {active tab panel} </div></div>`. Each tab's pokedex variant (built in 2b+) renders its own `.pdx-popup__body` LCD well + footer/action-bar as siblings (Option B — tabs stay self-contained, matching how Slate's `PlayTab` already owns its scroll + action bar). This 2a phase only builds the shell + header + tabs; tab *bodies* keep rendering their current Slate components inside a temporary LCD well wrapper so the popup is coherent end-to-end.

**Tech Stack:** Preact + TypeScript, Jest + jsdom + @testing-library/preact, biome, pnpm.

---

## Context for the implementer

- Branch `claude/vigorous-nash-817b43`. Phases 0, 1 done: `useThemeContext()` (`src/popup/theme/ThemeContext.ts`) returns `"slate" | "pokedex"`; `Icon` already forks (renders Pixelarticons under pokedex); `theme-pokedex.css` (all `--pdx-*` tokens scoped under `.pdx`) is imported in `main.tsx`.
- **Source of truth for markup + CSS:** `design-system/preview/pokedex/play-tab.html` (the shell appears identically in all 4 states, e.g. lines 625-643) and `design-system/ui_kits/extension-popup-pokedex/popup.css`. If code drifts from the preview, the **code** is the bug.
- **Don't break Slate:** do not edit `tokens.css`, `popup.css`, or any `wh-*` markup except `App.tsx`'s `return` (which legitimately forks). All Pokédex CSS goes in a new `popup.pdx.css` using self-namespaced `.pdx-*` classes (they only resolve under the `.pdx` token scope, so they're inert for Slate).
- **TRAP #1:** every `var(--pdx-*)` resolves empty without a `.pdx` ancestor — the pokedex root MUST carry class `pdx`.
- **TRAP #5:** bordered sliding/3D elements need `box-sizing: border-box`. Add a scoped reset in `popup.pdx.css` (`.pdx-popup *, …`).
- Localization: pokedex copy differences are handled in Phase 5. For 2a, the wordmark "WORD HUNTER" is a brand constant (not localized — same as Slate's `<span>Word Hunter</span>` literal). Tab labels reuse the existing i18n keys (`tab_play`, `tab_stats`, `tab_settings`) with CSS uppercase; no new keys.
- All code/comments English. Use the Bash tool. Do NOT run `git commit`/`git add` — the controller commits.

---

## File structure

- **Create** `src/popup/styles/popup.pdx.css` — Pokédex shell component classes (this phase: shell, header, tabs, ridge, LCD body well + scoped box-sizing). Grows in 2b/2c.
- **Create** `src/popup/components/PopupHeader.pdx.tsx` — lens + 3 LED dots + pixel wordmark + cream info key. Same props as `PopupHeader`.
- **Create** `src/popup/components/Tabs.pdx.tsx` — cream key-cap tab row; icon-left-of-label; `is-active` → yellow LED cap. Same props + `TabId` reused from `Tabs.tsx`.
- **Modify** `src/popup/main.tsx` — import `popup.pdx.css` after `popup.css`.
- **Modify** `src/popup/App.tsx` — branch the shell on theme.
- **Modify** `tests/popup/app-theme.test.tsx` — update scope-class assertions for the new shell roots (invariant preserved).
- **Create** tests: `tests/popup/components/popup-header-pdx.test.tsx`, `tests/popup/components/tabs-pdx.test.tsx`, `tests/popup/app-shell-pdx.test.tsx`.

---

## Task 1: popup.pdx.css — shell stylesheet + wire-up

**Files:**
- Create: `src/popup/styles/popup.pdx.css`
- Modify: `src/popup/main.tsx`

- [ ] **Step 1: Create `src/popup/styles/popup.pdx.css`** with exactly this content (shell subset, mirrored from the kit + play-tab.html; `iconify-icon` selectors kept harmlessly alongside `svg`):

```css
/* =========================================================
   Word Hunter — Pokédex popup shell (component classes).
   Loaded by the popup bundle alongside popup.css; every class
   is self-namespaced .pdx-* and only resolves under the .pdx
   token scope, so it is inert when theme = slate.
   Markup source of truth: design-system/preview/pokedex/play-tab.html
   ========================================================= */

.pdx-popup *,
.pdx-popup *::before,
.pdx-popup *::after {
  box-sizing: border-box;
}

/* ===== Popup shell (360 x 560) ===== */
.pdx-popup {
  width: var(--pdx-popup-width);
  height: var(--pdx-popup-min-h);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--pdx-shell-hi) 0%, var(--pdx-shell) 22%, var(--pdx-shell-2) 100%);
  border-radius: 10px 10px 14px 14px;
  overflow: hidden;
  box-shadow: var(--pdx-shadow-popup);
  position: relative;
  color: var(--pdx-on-shell);
}
.pdx-popup::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--pdx-shell-edge);
  opacity: 0.55;
  pointer-events: none;
  z-index: 5;
}

/* ===== Header ===== */
.pdx-popup__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 10px;
  flex: 0 0 auto;
}
.pdx-popup__lens {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  background: radial-gradient(circle at 35% 30%, var(--pdx-lens-hi) 0%, var(--pdx-lens) 55%, var(--pdx-lens-deep) 100%);
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--pdx-lens-rim), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
}
.pdx-popup__lens::before {
  content: "";
  position: absolute;
  top: 14%;
  left: 16%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  filter: blur(1px);
}
.pdx-popup__leds {
  display: flex;
  gap: 5px;
  flex: 0 0 auto;
}
.pdx-popup__leds .led {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}
.pdx-popup__leds .led--red {
  background: var(--pdx-led-red);
  box-shadow: 0 0 4px var(--pdx-led-red), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}
.pdx-popup__leds .led--green {
  background: var(--pdx-led-green);
  box-shadow: 0 0 4px var(--pdx-led-green), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}
.pdx-popup__leds .led--yellow {
  background: var(--pdx-led-yellow);
  box-shadow: 0 0 4px var(--pdx-led-yellow), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}
.pdx-popup__wordmark {
  font-family: var(--pdx-font-pixel);
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--pdx-on-shell);
  text-transform: uppercase;
  flex: 1;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
}
.pdx-popup__info {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 4px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pdx-popup__info iconify-icon,
.pdx-popup__info svg {
  font-size: 16px;
  color: var(--pdx-on-key);
}
.pdx-popup__info.is-active {
  background: linear-gradient(180deg, #3f8bd6 0%, #1f5c9e 100%);
  border-color: #0e3a66;
}
.pdx-popup__info.is-active iconify-icon,
.pdx-popup__info.is-active svg {
  color: #fff;
}

/* ===== Tabs ===== */
.pdx-popup__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  padding: 0 14px 10px;
  flex: 0 0 auto;
}
.pdx-popup__tab {
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: var(--pdx-r-key);
  padding: 6px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  color: var(--pdx-on-key);
}
.pdx-popup__tab iconify-icon,
.pdx-popup__tab svg {
  font-size: 14px;
  color: var(--pdx-on-key);
  flex: 0 0 auto;
}
.pdx-popup__tab-label {
  font-family: var(--pdx-font-pixel);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pdx-popup__tab.is-active {
  background: linear-gradient(180deg, #ffe9b0 0%, var(--pdx-led-yellow) 100%);
  border-color: #b89e50;
  color: #4a3a0e;
}
.pdx-popup__tab.is-active iconify-icon,
.pdx-popup__tab.is-active svg {
  color: #4a3a0e;
}

/* ===== Ridge (between tabs and body) ===== */
.pdx-popup__ridge {
  height: 4px;
  background: linear-gradient(180deg, var(--pdx-shell-deep) 0%, var(--pdx-shell-2) 50%, var(--pdx-shell-hi) 100%);
  position: relative;
  flex: 0 0 auto;
}
.pdx-popup__ridge::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.3);
}

/* ===== Body LCD well ===== */
.pdx-popup__body {
  flex: 1;
  margin: 10px 12px;
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 18%, var(--pdx-lcd) 80%, var(--pdx-lcd-lo) 100%);
  border-radius: 6px;
  border: 1px solid var(--pdx-lcd-frame);
  box-shadow: inset 0 2px 6px rgba(15, 42, 64, 0.35), inset 0 -2px 0 rgba(255, 255, 255, 0.18);
  position: relative;
  overflow: hidden;
  color: var(--pdx-lcd-ink);
}
.pdx-popup__body::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(0deg, rgba(15, 42, 64, 0.1) 0, rgba(15, 42, 64, 0.1) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: multiply;
  pointer-events: none;
}
.pdx-popup__body-inner {
  position: relative;
  z-index: 2;
  padding: 10px 12px 12px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: none;
}
.pdx-popup__body-inner::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Wire it into the bundle.** In `src/popup/main.tsx`, add an import for the new stylesheet immediately after the existing `import "./styles/popup.css";` line:

```ts
import "./styles/popup.css";
import "./styles/popup.pdx.css";
```

- [ ] **Step 3: Format + verify build.**

Run: `pnpm format && pnpm build`
Expected: build succeeds; biome leaves the file (it may reflow whitespace — fine).

- [ ] **Step 4: Confirm Slate CSS untouched.**

Run: `git diff --stat -- src/popup/styles/popup.css`
Expected: no output (popup.css unchanged).

---

## Task 2: PopupHeader.pdx.tsx

**Files:**
- Create: `src/popup/components/PopupHeader.pdx.tsx`
- Test: `tests/popup/components/popup-header-pdx.test.tsx`

- [ ] **Step 1: Write the failing test** — create `tests/popup/components/popup-header-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { PopupHeaderPdx } from "../../../src/popup/components/PopupHeader.pdx";

describe("PopupHeaderPdx", () => {
  it("renders the device chrome: lens, three LEDs, pixel wordmark, info key", () => {
    const { container } = render(<PopupHeaderPdx onRules={() => {}} rulesActive={false} />);
    expect(container.querySelector(".pdx-popup__lens")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-popup__leds .led")).toHaveLength(3);
    expect(container.querySelector(".pdx-popup__wordmark")?.textContent).toBe("WORD HUNTER");
    expect(container.querySelector(".pdx-popup__info")).not.toBeNull();
  });

  it("marks the info key active and fires onRules when clicked", () => {
    const onRules = jest.fn();
    const { container, rerender } = render(<PopupHeaderPdx onRules={onRules} rulesActive={true} />);
    const info = container.querySelector(".pdx-popup__info");
    expect(info).toHaveClass("is-active");
    expect(info).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(info as Element);
    expect(onRules).toHaveBeenCalledTimes(1);
    rerender(<PopupHeaderPdx onRules={onRules} rulesActive={false} />);
    expect(container.querySelector(".pdx-popup__info")).not.toHaveClass("is-active");
  });
});
```

- [ ] **Step 2: Run it, confirm it FAILS** (module not found):
`pnpm test -- tests/popup/components/popup-header-pdx.test.tsx`

- [ ] **Step 3: Implement** `src/popup/components/PopupHeader.pdx.tsx`:

```tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeaderPdx({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  const t = useT();
  return (
    <header class="pdx-popup__header">
      <span class="pdx-popup__lens" aria-hidden="true" />
      <div class="pdx-popup__leds" aria-hidden="true">
        <span class="led led--red" />
        <span class="led led--green" />
        <span class="led led--yellow" />
      </div>
      <span class="pdx-popup__wordmark">WORD HUNTER</span>
      <button
        type="button"
        class={`pdx-popup__info${rulesActive ? " is-active" : ""}`}
        aria-label={t("header_rules_aria")}
        aria-pressed={rulesActive ? "true" : "false"}
        onClick={onRules}
      >
        <Icon name="info" size={16} />
      </button>
    </header>
  );
}
```

- [ ] **Step 4: Run the test, confirm PASS** (2 tests):
`pnpm test -- tests/popup/components/popup-header-pdx.test.tsx`

- [ ] **Step 5: typecheck + lint clean.** `pnpm typecheck && pnpm format && pnpm lint`

---

## Task 3: Tabs.pdx.tsx

**Files:**
- Create: `src/popup/components/Tabs.pdx.tsx`
- Test: `tests/popup/components/tabs-pdx.test.tsx`

- [ ] **Step 1: Write the failing test** — create `tests/popup/components/tabs-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { TabsPdx } from "../../../src/popup/components/Tabs.pdx";

describe("TabsPdx", () => {
  it("renders three key-cap tabs with labels", () => {
    const { container } = render(<TabsPdx active="play" onNavigate={() => {}} />);
    const tabs = container.querySelectorAll(".pdx-popup__tab");
    expect(tabs).toHaveLength(3);
    expect(container.querySelectorAll(".pdx-popup__tab-label")).toHaveLength(3);
  });

  it("marks the active tab and fires onNavigate on click", () => {
    const onNavigate = jest.fn();
    const { container } = render(<TabsPdx active="play" onNavigate={onNavigate} />);
    const tabs = container.querySelectorAll(".pdx-popup__tab");
    expect(tabs[0]).toHaveClass("is-active");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabs[1] as Element);
    expect(onNavigate).toHaveBeenCalledWith("stats");
  });
});
```

- [ ] **Step 2: Run it, confirm it FAILS:**
`pnpm test -- tests/popup/components/tabs-pdx.test.tsx`

- [ ] **Step 3: Implement** `src/popup/components/Tabs.pdx.tsx` (reuse the `TABS` shape from `Tabs.tsx` but inline it to keep the file self-contained; same i18n keys):

```tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { Icon, type IconName } from "./Icon";
import type { TabId } from "./Tabs";

interface TabDescriptor {
  id: Exclude<TabId, "rules">;
  labelKey: MessageKey;
  icon: IconName;
}

const TABS: TabDescriptor[] = [
  { id: "play", labelKey: "tab_play", icon: "search" },
  { id: "stats", labelKey: "tab_stats", icon: "bar-chart" },
  { id: "settings", labelKey: "tab_settings", icon: "settings" },
];

interface TabsProps {
  active: TabId;
  onNavigate: (next: TabId) => void;
}

export function TabsPdx({ active, onNavigate }: TabsProps): JSX.Element {
  const t = useT();
  return (
    <nav class="pdx-popup__tabs">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive ? "true" : "false"}
            class={`pdx-popup__tab${isActive ? " is-active" : ""}`}
            onClick={() => onNavigate(tab.id)}
          >
            <Icon name={tab.icon} size={14} />
            <span class="pdx-popup__tab-label">{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run the test, confirm PASS** (2 tests):
`pnpm test -- tests/popup/components/tabs-pdx.test.tsx`

- [ ] **Step 5: typecheck + lint clean.** `pnpm typecheck && pnpm format && pnpm lint`

---

## Task 4: Fork App.tsx shell + update Phase-0 scope test

**Files:**
- Modify: `src/popup/App.tsx`
- Modify: `tests/popup/app-theme.test.tsx`
- Test: `tests/popup/app-shell-pdx.test.tsx`

**Note on the temporary LCD-well wrapper:** in 2a the tab *bodies* are still the Slate tab components. To keep the popup coherent, the pokedex branch wraps the active tab panel in a `.pdx-popup__body` > `.pdx-popup__body-inner`. In 2b the Play tab will get its own `.pdx` body + action bar and PlayTab will be swapped for `PlayTab.pdx`; the temporary wrapper stays valid for the not-yet-forked tabs.

- [ ] **Step 1: Update the Phase-0 scope test** `tests/popup/app-theme.test.tsx`. Replace the two `it(...)` bodies so they assert the *new* shell roots (keep the `setupChromeMock` helper as-is):

```tsx
  it("uses the Slate shell (.wh-popup.wh) by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    const root = container.querySelector(".wh-popup");
    expect(root).toHaveClass("wh");
    expect(root).not.toHaveClass("pdx");
    expect(container.querySelector(".pdx-popup")).toBeNull();
  });

  it("uses the Pokédex device shell (.pdx > .pdx-popup) when theme is 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    const scope = container.querySelector(".pdx");
    expect(scope).not.toBeNull();
    expect(container.querySelector(".wh-popup")).toBeNull();
  });
```

Ensure `waitFor` is imported (it already is in this file alongside `act`, `render`).

- [ ] **Step 2: Write the new shell test** — create `tests/popup/app-shell-pdx.test.tsx`:

```tsx
import { act, render, waitFor } from "@testing-library/preact";
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
  };
}

describe("App Pokédex shell", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the device chrome (header, tabs, ridge, LCD body) under pokedex", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    expect(container.querySelector(".pdx-popup__header")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__tabs")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__ridge")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__body-inner")).not.toBeNull();
  });

  it("keeps Slate chrome (.wh-header/.wh-tabs) by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    expect(container.querySelector(".wh-header")).not.toBeNull();
    expect(container.querySelector(".pdx-popup")).toBeNull();
  });
});
```

- [ ] **Step 3: Run both, confirm they FAIL** (pokedex still renders Slate shell):
`pnpm test -- tests/popup/app-shell-pdx.test.tsx tests/popup/app-theme.test.tsx`

- [ ] **Step 4: Fork `src/popup/App.tsx`.** Add imports near the existing ones:

```tsx
import { PopupHeaderPdx } from "./components/PopupHeader.pdx";
import { TabsPdx } from "./components/Tabs.pdx";
```

Extract the four tab panels into a local variable so both shells share it (place it just before the `return`):

```tsx
  const panels = (
    <>
      {active === "play" && (
        <div class="wh-tab-panel wh-tab-panel--play" data-testid="tab-panel-play">
          <PlayTab />
        </div>
      )}
      {active === "stats" && (
        <div class="wh-tab-panel" data-testid="tab-panel-stats">
          <StatsTab />
        </div>
      )}
      {active === "settings" && (
        <div class="wh-tab-panel wh-tab-panel--settings" data-testid="tab-panel-settings">
          <SettingsTab />
        </div>
      )}
      {active === "rules" && (
        <div class="wh-tab-panel" data-testid="tab-panel-rules">
          <RulesTab />
        </div>
      )}
    </>
  );

  if (theme === "pokedex") {
    return (
      <ThemeContext.Provider value={theme}>
        <div class="pdx">
          <div class="pdx-popup">
            <PopupHeaderPdx onRules={handleRules} rulesActive={active === "rules"} />
            <TabsPdx active={active} onNavigate={handleTabNavigate} />
            <div class="pdx-popup__ridge" />
            <div class="pdx-popup__body">
              <div class="pdx-popup__body-inner">{panels}</div>
            </div>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div class="wh-popup wh">
        <PopupHeader onRules={handleRules} rulesActive={active === "rules"} />
        <Tabs active={active} onNavigate={handleTabNavigate} />
        <main class="wh-popup__main">{panels}</main>
      </div>
    </ThemeContext.Provider>
  );
```

Replace the old single `return (...)` with the two returns above. (The Slate root class becomes the literal `"wh-popup wh"` — previously it was templated; behaviour is identical for slate.)

- [ ] **Step 5: Run the full App test set + the icon-propagation test, confirm PASS:**
`pnpm test -- tests/popup/app-shell-pdx.test.tsx tests/popup/app-theme.test.tsx tests/popup/app-icon-propagation.test.tsx`
Expected: all green (the icon-propagation test still finds pokedex `svg[fill]:not([stroke])` because `Icon` renders inside the new shell too).

- [ ] **Step 6: typecheck + lint clean.** `pnpm typecheck && pnpm format && pnpm lint`

---

## Final verification (after all tasks)

- [ ] `pnpm test` — full suite green.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean.
- [ ] `git diff --stat -- src/popup/styles/popup.css src/shared/styles/tokens.css` — empty (Slate styles untouched).
- [ ] Slate markup untouched except `App.tsx` (the only edited `wh-*` file; its slate branch is behaviourally identical).

> **Visual check (controller, optional):** load `dist/` unpacked, set `chrome.storage.local.set({theme:"pokedex"})`, reopen popup → the raspberry device frame (lens + LEDs + pixel wordmark + cream key tabs + LCD body well) should appear, with the current Slate tab content sitting inside the LCD well (full Pokédex content lands in 2b). Compare the chrome against `play-tab.html` at 360×560.
