# Pokédex Theme — Phase 0 (Foundation & Plumbing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the invisible foundation for a second extension theme — the `theme` storage key (default `slate`), a read-once `useTheme()` hook, the `.pdx`/`wh` scope class on the popup root, the mirrored `theme-pokedex.css`, and the self-hosted pixel fonts — without changing anything the user sees.

**Architecture:** The Pokédex theme is a *parallel skin*: all `--pdx-*` tokens live under a `.pdx` scope and are loaded *alongside* (never replacing) the Slate `--wh-*` tokens. Phase 0 wires the mechanism but renders only the existing Slate tree, so with the default theme nothing changes visually. Component forks come in later phases.

**Tech Stack:** Vite + Preact + TypeScript (Manifest V3 extension), Jest + jsdom + @testing-library/preact, `chrome.storage.local`, `@fontsource` self-hosted fonts.

**Spec:** `docs/superpowers/specs/2026-05-29-pokedex-theme-design.md` (see §4 Architecture, §7 Phase 0).

---

## File Structure

**Design-system reference (brought into repo, not shipped in the bundle):**
- `design-system/themes/theme-pokedex.css`, `design-system/themes/POKEDEX-IMPLEMENTATION.md`
- `design-system/preview/pokedex/*`, `design-system/ui_kits/{extension-popup,in-page-overlay}-pokedex/*`
- updated `design-system/README.md`, `design-system/ui_kits/README.md`

**Source (shipped):**
- Create: `src/shared/styles/theme-pokedex.css` — mirror of the design-system token file (one responsibility: `--pdx-*` tokens + `.pdx` primitives).
- Create: `src/popup/hooks/useTheme.ts` — read-once theme reader for the popup.
- Modify: `src/shared/types.ts` — add the `Theme` union type.
- Modify: `src/shared/constants.ts` — add `DEFAULT_THEME`.
- Modify: `src/shared/storage.ts` — add `theme` to `StorageSchema` + `getTheme()` content/shared helper.
- Modify: `src/popup/App.tsx` — apply the scope class to the popup root.
- Modify: `src/popup/main.tsx` — import the pokedex stylesheet + the two pixel fonts.
- Modify: `package.json` — add `@fontsource/press-start-2p`, `@fontsource/vt323`.

**Docs:**
- Create: `docs/adr/007-theme-architecture.md`

**Tests:**
- Create: `tests/shared/theme-storage.test.ts`
- Create: `tests/popup/hooks/use-theme.test.ts`
- Create: `tests/popup/app-theme.test.tsx`

**Out of scope for Phase 0 (deferred):** content-bundle scope class + content `getTheme` read-at-injection (Phase 4); the Settings theme picker + reopen notice (Phase 5); the `Icon` pokedex branch + `ThemeProvider` context (Phase 1); any pokedex component markup/CSS forks.

---

## Task 1: Bring the Pokédex design-system files into the repo

The Pokédex design files currently exist only as untracked files in the main checkout. Copy them into this branch so it has a stable reference. No code, no tests — reference material + docs.

**Files:**
- Create (copy): `design-system/themes/`, `design-system/preview/pokedex/`, `design-system/ui_kits/extension-popup-pokedex/`, `design-system/ui_kits/in-page-overlay-pokedex/`
- Modify (copy over): `design-system/README.md`, `design-system/ui_kits/README.md`

- [ ] **Step 1: Copy the untracked + modified design-system files from the main checkout**

Run (Git Bash; the main checkout is at `/c/Users/vinde/Documents/development/word-hunter`):

```bash
SRC="/c/Users/vinde/Documents/development/word-hunter/design-system"
cp -r "$SRC/themes" "design-system/themes"
cp -r "$SRC/preview/pokedex" "design-system/preview/pokedex"
cp -r "$SRC/ui_kits/extension-popup-pokedex" "design-system/ui_kits/extension-popup-pokedex"
cp -r "$SRC/ui_kits/in-page-overlay-pokedex" "design-system/ui_kits/in-page-overlay-pokedex"
cp "$SRC/README.md" "design-system/README.md"
cp "$SRC/ui_kits/README.md" "design-system/ui_kits/README.md"
```

- [ ] **Step 2: Verify the files arrived (and exclude the binary thumbnail cache)**

Run: `git status --short design-system/`
Expected: modified `design-system/README.md`, `design-system/ui_kits/README.md`; untracked `design-system/themes/`, `design-system/preview/pokedex/`, `design-system/ui_kits/extension-popup-pokedex/`, `design-system/ui_kits/in-page-overlay-pokedex/`. (Do **not** copy or stage `design-system/.thumbnail`.)

- [ ] **Step 3: Stage and commit**

```bash
git add design-system/themes design-system/preview/pokedex \
  "design-system/ui_kits/extension-popup-pokedex" \
  "design-system/ui_kits/in-page-overlay-pokedex" \
  design-system/README.md design-system/ui_kits/README.md
git commit -m "docs(design-system): add Pokédex theme source (tokens, previews, ui-kits)"
```

Expected: commit succeeds; `biome check` pre-commit hook passes (it does not lint `.css`/`.html`/`.md` content here, only the staged JS/TS — there is none).

---

## Task 2: ADR — theme architecture

Record the "parallel skins, not token override" decision in the codebase's ADR log (next number after `006-i18n-architecture.md`).

**Files:**
- Create: `docs/adr/007-theme-architecture.md`

- [ ] **Step 1: Write the ADR**

Create `docs/adr/007-theme-architecture.md`:

```markdown
# 7. Theme architecture: parallel skins, not token override

Date: 2026-05-29

## Status

Accepted

## Context

Word Hunter is adding a second, user-selectable theme ("Pokédex", a
game-device skin) alongside the default ("Slate"). The two themes diverge on
more than colour: different DOM structure (LCD wells need scan-line/glare
sibling nodes; key caps need a border-bottom 3D treatment Slate has no use
for), different font families and metric scales (Press Start 2P at 12px ≈
Space Grotesk at 18px in advance width), different on-foreground rules
(Pokédex text colour depends on the surface — shell/LCD/key), and a different
copy voice (Slate sentence case vs Pokédex ALL CAPS + abbreviations).

## Decision

Build the themes as **parallel skins**, not as value-overrides of one token
set.

- **CSS layer.** Pokédex ships a separate stylesheet whose tokens live under a
  `.pdx` scope (`--pdx-*`). It is loaded *in addition to* the Slate stylesheet
  (`--wh-*`, at `:root`), never replacing it. No `--wh-*` value is redefined.
- **Component layer.** Each top-level surface renders a Slate *or* a Pokédex
  subtree. They share data hooks and domain logic; they do not share markup,
  because the DOM shapes differ.
- **Selection.** A new `theme: "slate" | "pokedex"` key in
  `chrome.storage.local` (default `slate`). The popup reads it once on mount
  and sets the scope class on its root. Switching themes prompts a popup
  re-open rather than a live re-render.

## Consequences

- Slate is fully insulated: no `--wh-*` token or Slate component markup is
  edited when adding Pokédex; with the default theme the Pokédex stylesheet is
  inert (nothing cascades without a `.pdx` ancestor).
- The cost is duplicated markup per forked surface. Accepted: the divergence in
  DOM shape, fonts, and copy makes a shared-markup approach carry tombstone
  elements and themed font tokens, defeating the point.
- Storage uses `chrome.storage.local` (not `sync` as the design-system handoff
  suggested) to stay consistent with every existing setting and avoid a split
  store.
```

- [ ] **Step 2: Commit**

```bash
git add docs/adr/007-theme-architecture.md
git commit -m "docs(adr): 007 theme architecture — parallel skins, not token override"
```

---

## Task 3: Mirror `theme-pokedex.css` into `src/`

Mirror the design-system token file into the shipped source tree (same convention as `src/shared/styles/tokens.css` mirroring `colors_and_type.css`), with the production font change applied.

**Files:**
- Create: `src/shared/styles/theme-pokedex.css`

- [ ] **Step 1: Copy the design-system file into src**

```bash
cp "design-system/themes/theme-pokedex.css" "src/shared/styles/theme-pokedex.css"
```

- [ ] **Step 2: Remove the Google Fonts `@import` (production self-hosts fonts)**

In `src/shared/styles/theme-pokedex.css`, delete this line near the top (the fonts are added via `@fontsource` in Task 7):

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
```

Leave everything else (the `.pdx { … }` token block and all `.pdx-*` primitive rules) unchanged.

- [ ] **Step 3: Verify the scope is intact**

Run: `grep -c "^.pdx" src/shared/styles/theme-pokedex.css`
Expected: a non-zero count (the file still defines the `.pdx` scope and its primitives). Confirm the `@import` line is gone: `grep -c "fonts.googleapis.com" src/shared/styles/theme-pokedex.css` → `0`.

- [ ] **Step 4: Commit**

```bash
git add src/shared/styles/theme-pokedex.css
git commit -m "feat(theme): mirror Pokédex token stylesheet into src (no Google Fonts import)"
```

---

## Task 4: `Theme` type, `DEFAULT_THEME`, `theme` storage key + `getTheme()` (TDD)

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/constants.ts`
- Modify: `src/shared/storage.ts`
- Test: `tests/shared/theme-storage.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/shared/theme-storage.test.ts`:

```ts
import { getTheme } from "../../src/shared/storage";

function setupChromeMock(initial: Record<string, unknown> = {}): Record<string, unknown> {
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
      onChanged: { addListener: jest.fn() },
    },
  };
  return store;
}

describe("Theme storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChromeMock();
  });

  it("defaults to 'slate' when no theme is stored", async () => {
    expect(await getTheme()).toBe("slate");
  });

  it("returns the stored theme when set to 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    expect(await getTheme()).toBe("pokedex");
  });

  it("treats a legacy record (theme undefined) as 'slate'", async () => {
    setupChromeMock({ settings: { hintDelayMinutes: 5 } });
    expect(await getTheme()).toBe("slate");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm jest tests/shared/theme-storage.test.ts`
Expected: FAIL — `getTheme` is not exported from `src/shared/storage`.

- [ ] **Step 3: Add the `Theme` type**

In `src/shared/types.ts`, add (e.g. just below `export type WordSource = …`):

```ts
export type Theme = "slate" | "pokedex";
```

- [ ] **Step 4: Add `DEFAULT_THEME`**

In `src/shared/constants.ts`, update the type import and add the constant:

```ts
import type { FeatureFlags, GameSettings, Theme } from "./types";
```

```ts
export const DEFAULT_THEME: Theme = "slate";
```

- [ ] **Step 5: Add the storage key + helper**

In `src/shared/storage.ts`, update the imports:

```ts
import { DEFAULT_SETTINGS, DEFAULT_THEME } from "./constants";
import type { ActiveWord, FeatureFlags, GameSettings, HuntRecord, Theme, WordListName } from "./types";
```

Add `theme` to the schema:

```ts
export type StorageSchema = {
  finds: HuntRecord[];
  settings: GameSettings;
  activeWord: ActiveWord | null;
  selectedList: WordListName;
  locale: Locale;
  featureFlags: FeatureFlags;
  theme: Theme;
};
```

Add the helper (next to `getSettings`):

```ts
export async function getTheme(): Promise<Theme> {
  return (await get("theme")) ?? DEFAULT_THEME;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm jest tests/shared/theme-storage.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 7: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts src/shared/storage.ts tests/shared/theme-storage.test.ts
git commit -m "feat(theme): add Theme type, DEFAULT_THEME, theme storage key + getTheme"
```

---

## Task 5: `useTheme()` read-once hook (TDD)

The popup reads the theme **once on mount** (no live subscription) — switching prompts a re-open, so a reactive hook would be wrong here.

**Files:**
- Create: `src/popup/hooks/useTheme.ts`
- Test: `tests/popup/hooks/use-theme.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/hooks/use-theme.test.ts`:

```ts
import { act, renderHook, waitFor } from "@testing-library/preact";
import { useTheme } from "../../../src/popup/hooks/useTheme";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
) => void;

function setupChromeMock(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
  const listeners: StorageChangeListener[] = [];
  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
      onChanged: {
        addListener: jest.fn((fn: StorageChangeListener) => listeners.push(fn)),
        removeListener: jest.fn((fn: StorageChangeListener) => {
          const i = listeners.indexOf(fn);
          if (i !== -1) listeners.splice(i, 1);
        }),
      },
    },
  };
  return {
    fireStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      listeners.forEach((fn) => fn(changes, "local"));
    },
  };
}

describe("useTheme", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 'slate' before storage resolves", () => {
    setupChromeMock({ theme: "pokedex" });
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("slate");
  });

  it("returns the stored theme after mount", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current).toBe("pokedex"));
  });

  it("does NOT react to later storage changes (read once on mount)", async () => {
    const { fireStorageChange } = setupChromeMock({ theme: "slate" });
    const { result } = renderHook(() => useTheme());
    await act(async () => {});
    expect(result.current).toBe("slate");

    await act(async () => {
      fireStorageChange({ theme: { oldValue: "slate", newValue: "pokedex" } });
    });

    expect(result.current).toBe("slate");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm jest tests/popup/hooks/use-theme.test.ts`
Expected: FAIL — cannot find module `useTheme`.

- [ ] **Step 3: Write the hook**

Create `src/popup/hooks/useTheme.ts`:

```ts
import { useEffect, useState } from "preact/hooks";
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";

/**
 * Reads the stored theme ONCE on mount. Deliberately does not subscribe to
 * chrome.storage.onChanged: switching themes prompts a popup re-open, so the
 * mounted tree keeps its theme for the life of the popup.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    chrome.storage.local.get("theme").then((result) => {
      if (cancelled) return;
      const stored = result.theme as Theme | undefined;
      if (stored) setTheme(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return theme;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm jest tests/popup/hooks/use-theme.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add src/popup/hooks/useTheme.ts tests/popup/hooks/use-theme.test.ts
git commit -m "feat(theme): add read-once useTheme hook"
```

---

## Task 6: Apply the scope class on the popup root (TDD)

**Files:**
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/app-theme.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/app-theme.test.tsx`:

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

describe("App theme scope class", () => {
  beforeEach(() => jest.clearAllMocks());

  it("applies the 'wh' scope class on the popup root by default (slate)", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    const root = container.querySelector(".wh-popup");
    expect(root).toHaveClass("wh");
    expect(root).not.toHaveClass("pdx");
  });

  it("applies the 'pdx' scope class on the popup root when theme is 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".wh-popup")).toHaveClass("pdx"));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm jest tests/popup/app-theme.test.tsx`
Expected: FAIL — the root `.wh-popup` element has neither `wh` nor `pdx` class yet.

- [ ] **Step 3: Apply the scope class in `App.tsx`**

In `src/popup/App.tsx`, add the import and read the theme; change the root element's class.

Add to the imports:

```tsx
import { useTheme } from "./hooks/useTheme";
```

Inside `App`, read the theme at the top of the component body:

```tsx
export function App(): JSX.Element {
  const theme = useTheme();
  const [active, setActive] = useState<TabId>("play");
```

Change the root element:

```tsx
  return (
    <div class={`wh-popup ${theme === "pokedex" ? "pdx" : "wh"}`}>
```

(Everything inside stays exactly as is — Phase 0 still renders the Slate tree.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm jest tests/popup/app-theme.test.tsx`
Expected: PASS (2 passing).

- [ ] **Step 5: Run the existing App test to confirm no regression**

Run: `pnpm jest tests/popup/app.test.tsx`
Expected: PASS (all existing assertions still green — they don't inspect the scope class, and the default theme keeps the Slate tree).

- [ ] **Step 6: Commit**

```bash
git add src/popup/App.tsx tests/popup/app-theme.test.tsx
git commit -m "feat(theme): apply pdx/wh scope class on the popup root from useTheme"
```

---

## Task 7: Load the pokedex stylesheet + self-host the pixel fonts

**Files:**
- Modify: `package.json`
- Modify: `src/popup/main.tsx`

- [ ] **Step 1: Add the font packages**

Run: `pnpm add @fontsource/press-start-2p @fontsource/vt323`
Expected: both appear under `dependencies` in `package.json`; `pnpm-lock.yaml` updates. (Requires network access to the registry.)

- [ ] **Step 2: Import the stylesheet + fonts in `main.tsx`**

In `src/popup/main.tsx`, add the two font imports after the existing Fraunces imports, and the pokedex stylesheet import right after `tokens.css`:

```tsx
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/press-start-2p";
import "@fontsource/vt323";
import "../shared/styles/tokens.css";
import "../shared/styles/theme-pokedex.css";
import "./styles/popup.css";
```

(Order matters only in that `theme-pokedex.css` is scoped to `.pdx` and cannot collide with the `:root` Slate tokens; place it after `tokens.css`, before `popup.css`.)

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Run the full test suite (regression guard)**

Run: `pnpm test`
Expected: all tests pass — including the existing Slate suites. CSS/font imports are mapped to mocks by `jest.config.ts` (`\\.(css|woff2?)$` → `tests/style-mock.ts`), so the new imports do not affect tests.

- [ ] **Step 5: Build (verify the bundle compiles with the new stylesheet + fonts)**

Run: `pnpm build`
Expected: build succeeds; the popup bundle includes `theme-pokedex.css` and the two `@fontsource` font faces.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/popup/main.tsx
git commit -m "feat(theme): load Pokédex stylesheet + self-host Press Start 2P & VT323 fonts"
```

---

## Phase 0 exit criteria

- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm lint` all green.
- [ ] With the default theme, the popup is visually + behaviourally identical to before (manually load the unpacked build, open the popup — Slate looks unchanged).
- [ ] Setting `chrome.storage.local` `theme: "pokedex"` (via DevTools) and reopening the popup puts the `pdx` class on the root (the Slate tree still renders — full Pokédex visuals arrive in later phases).
- [ ] No `--wh-*` token and no Slate component markup was modified.

---

## Self-Review (completed during planning)

- **Spec coverage (§7 Phase 0):** design-system files in repo (Task 1) ✓; mirror `theme-pokedex.css` minus Google Fonts (Task 3) ✓; `theme` key default slate + `getTheme` (Task 4) ✓; `useTheme` read-once (Task 5) ✓; scope class on App root (Task 6) ✓; import stylesheet + self-host fonts (Task 7) ✓; optional ADR (Task 2) ✓. Content-bundle scope class and content `getTheme` are explicitly deferred to Phase 4 (noted under "Out of scope").
- **Placeholder scan:** none — every code/test step contains complete content and exact commands.
- **Type consistency:** `Theme` (`src/shared/types.ts`) is used consistently by `DEFAULT_THEME` (constants), `StorageSchema.theme` + `getTheme(): Promise<Theme>` (storage), and `useTheme(): Theme` (hook). `getTheme` is the only new exported symbol referenced by a test (Task 4); `useTheme` is referenced by Tasks 5 & 6.
