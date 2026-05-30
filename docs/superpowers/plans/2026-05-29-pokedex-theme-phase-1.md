# Pokédex theme — Phase 1: Icon (theme-aware) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the popup `Icon` component theme-aware so that under the Pokédex theme it renders offline, inline-SVG Pixelarticons (zero network requests), while Slate keeps rendering its Lucide icons byte-identically.

**Architecture:** A lightweight Preact context (`ThemeContext`) carries the mounted theme down to leaf components. `App` provides it from the value it already reads via `useTheme()`. `Icon` consumes it and forks: `slate` → existing Lucide JSX (unchanged); `pokedex` → an inline `<svg>` whose body comes from a committed static Pixelarticons body map (`PIXELARTICONS_BODIES`) selected by an `IconName → slug` contract map (`PIXELARTICONS_SLUG`). No `<iconify-icon>` web component, no runtime fetch.

**Tech Stack:** Preact + TypeScript, `preact/hooks` `createContext`/`useContext`, Jest + jsdom + `@testing-library/preact`, biome (lint/format), pnpm.

---

## Context for the implementer

- This is **Phase 1** of a multi-phase feature on branch `claude/vigorous-nash-817b43`. Phase 0 (foundation) is already merged into the branch: the `Theme` type (`"slate" | "pokedex"`), `DEFAULT_THEME`, the `theme` storage key + `getTheme()`, the read-once `useTheme()` hook, the `pdx`/`wh` scope class on `App`'s root, and the mirrored `src/shared/styles/theme-pokedex.css` + pixel fonts all exist.
- **Do not break Slate.** The Slate (Lucide) rendering path in `Icon.tsx` must stay behaviourally identical. We only *add* a pokedex branch + a context read. No `--wh-*` token changes, no Slate markup edits beyond wrapping `App`'s tree in a context provider.
- **Source of truth for the icon contract:** `design-system/preview/pokedex/iconography.html` (the 16-role → Pixelarticons-slug table) and `design-system/themes/POKEDEX-IMPLEMENTATION.md` §4. The body SVG strings in this plan were fetched from the canonical Iconify source (`https://api.iconify.design/pixelarticons.json`, 24×24 grid, Pixelarticons by Gerrit Halfmann, MIT) and are embedded verbatim so **no network access is needed during execution**.
- **Trap #3 (from the handoff):** the `<iconify-icon>` web component silently fails past ~20 instances. We ship offline inline-SVG instead — that is the whole point of this phase.
- `filled` prop: Pixelarticons are single-form pixel glyphs; "lit"/emphasis states are expressed via parent `color` in `.pdx` CSS, **not** a different glyph. So the pokedex branch intentionally **ignores** `filled`. The slate branch keeps using it exactly as today.
- Existing tests that must stay green: `tests/popup/components/icon.test.tsx` (renders with no provider → defaults to slate → Lucide) and `tests/popup/app-theme.test.tsx` (scope class; `App` still renders the `.wh-popup` div, now inside a provider).
- Project conventions: biome `quoteStyle: "double"`, but biome keeps **single quotes** for strings that contain `"` (to avoid escaping) — so the Pixelarticons body strings (which contain `fill="currentColor"`) are written single-quoted and are biome-clean. Run `pnpm format` before each commit; `pnpm lint` runs on pre-commit (`biome check`).
- Commit messages: Conventional Commits, end every commit message with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File Structure

- **Create** `src/popup/theme/ThemeContext.ts` — the `ThemeContext` (default `DEFAULT_THEME`) + a `useThemeContext()` consumer hook. One responsibility: expose the mounted theme to leaves.
- **Create** `src/popup/components/pixelarticons.ts` — `PIXELARTICONS_BODIES: Record<string, string>`, the committed static SVG bodies keyed by Pixelarticons slug. Pure data, no imports.
- **Modify** `src/popup/components/Icon.tsx` — add the `PIXELARTICONS_SLUG` contract map (`IconName → slug`), read `useThemeContext()`, and add the pokedex render branch ahead of the existing Lucide switch.
- **Modify** `src/popup/App.tsx` — wrap the rendered tree in `<ThemeContext.Provider value={theme}>` (theme already computed via `useTheme()`).
- **Create** tests:
  - `tests/popup/theme/theme-context.test.tsx`
  - `tests/popup/components/pixelarticons.test.ts`
  - `tests/popup/components/icon-theme.test.tsx`
  - `tests/popup/app-icon-propagation.test.tsx`

---

## Task 1: ThemeContext + useThemeContext

**Files:**
- Create: `src/popup/theme/ThemeContext.ts`
- Test: `tests/popup/theme/theme-context.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/theme/theme-context.test.tsx`:

```tsx
import { renderHook } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { ThemeContext, useThemeContext } from "../../../src/popup/theme/ThemeContext";

describe("useThemeContext", () => {
  it("defaults to slate when no provider is present", () => {
    const { result } = renderHook(() => useThemeContext());
    expect(result.current).toBe("slate");
  });

  it("returns the theme supplied by the provider", () => {
    function wrapper({ children }: { children: ComponentChildren }) {
      return <ThemeContext.Provider value="pokedex">{children}</ThemeContext.Provider>;
    }
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    expect(result.current).toBe("pokedex");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- tests/popup/theme/theme-context.test.tsx`
Expected: FAIL — cannot find module `src/popup/theme/ThemeContext`.

- [ ] **Step 3: Write the implementation**

Create `src/popup/theme/ThemeContext.ts`:

```ts
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";

/**
 * Carries the mounted popup theme down to leaf components (e.g. Icon) so they can
 * fork their rendering without prop-drilling. Provided by App from useTheme().
 */
export const ThemeContext = createContext<Theme>(DEFAULT_THEME);

/** Read the current popup theme from context. Falls back to slate outside a provider. */
export function useThemeContext(): Theme {
  return useContext(ThemeContext);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- tests/popup/theme/theme-context.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Format, then commit**

```bash
pnpm format
git add src/popup/theme/ThemeContext.ts tests/popup/theme/theme-context.test.tsx
git commit -m "feat(theme): add ThemeContext + useThemeContext for leaf theme reads"
```

---

## Task 2: Pixelarticons body map (committed offline data)

**Files:**
- Create: `src/popup/components/pixelarticons.ts`
- Test: `tests/popup/components/pixelarticons.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/components/pixelarticons.test.ts`:

```ts
import { PIXELARTICONS_BODIES } from "../../../src/popup/components/pixelarticons";

const EXPECTED_SLUGS = [
  "search",
  "chart",
  "sliders",
  "info-box",
  "trash",
  "external-link",
  "reload",
  "check",
  "close",
  "target",
  "clock",
  "play",
  "shuffle",
  "edit",
  "star",
  "chevron-down",
];

describe("PIXELARTICONS_BODIES", () => {
  it("contains exactly the 16 Pokédex icon slugs", () => {
    expect(Object.keys(PIXELARTICONS_BODIES).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has a non-empty currentColor SVG body for every slug", () => {
    for (const slug of EXPECTED_SLUGS) {
      expect(PIXELARTICONS_BODIES[slug]).toContain("currentColor");
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- tests/popup/components/pixelarticons.test.ts`
Expected: FAIL — cannot find module `src/popup/components/pixelarticons`.

- [ ] **Step 3: Write the implementation**

Create `src/popup/components/pixelarticons.ts` with this exact content:

```ts
// Pixelarticons SVG bodies — the Pokédex theme icon set.
// Source: Pixelarticons by Gerrit Halfmann (MIT) — https://pixelarticons.com
// Fetched from https://api.iconify.design/pixelarticons.json (24×24 grid) and committed
// offline so the popup makes ZERO network requests at runtime (spec §4.5, trap #3 — the
// <iconify-icon> web component is intentionally NOT shipped).
// Keys are Pixelarticons slugs; the IconName → slug mapping lives in Icon.tsx
// (PIXELARTICONS_SLUG). To add a role, fetch the new slug body from the source above.
export const PIXELARTICONS_BODIES: Record<string, string> = {
  search:
    '<path fill="currentColor" d="M22 22h-2v-2h2zm-2-2h-2v-2h2zm-6-2H6v-2h8zm4 0h-2v-2h2zM6 16H4v-2h2zm10 0h-2v-2h2zM4 14H2V6h2zm14 0h-2V6h2zM6 6H4V4h2zm10 0h-2V4h2zm-2-2H6V2h8z"/>',
  chart:
    '<path fill="currentColor" d="M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zM7 11h2v6H7zm4-4h2v10h-2zm4 6h2v4h-2z"/>',
  sliders:
    '<path fill="currentColor" d="M17 4h2v10h-2zm0 12h-2v2h2v2h2v-2h2v-2zm-4-6h-2v10h2zm-8 2H3v2h2v6h2v-6h2v-2zm8-8h-2v2H9v2h6V6h-2zM5 4h2v6H5z"/>',
  "info-box":
    '<path fill="currentColor" d="M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-9 5h2V7h-2zm0 8h2v-6h-2z"/>',
  trash:
    '<path fill="currentColor" d="M18 22H6v-2h12zM9 6h6V4h2v2h5v2h-2v12h-2V8H6v12H4V8H2V6h5V4h2zm6-2H9V2h6z"/>',
  "external-link":
    '<g fill="currentColor"><path d="M11 5H5v2h6zM5 7H3v12h2zm12 12H5v2h12zm2-6h-2v6h2zm-8 0H9v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v8h2z"/><path d="M21 3h-8v2h8z"/></g>',
  reload:
    '<g fill="currentColor"><path d="M16 4h2v6h-2zm-2-2h2v2h-2zm0 2h2v8h-2zM4 8H2v5h2z"/><path d="M4 6h16v2H4zm4 14H6v-6h2zm2 2H8v-2h2zm0-2H8v-8h2zm10-4h2v-5h-2z"/><path d="M20 18H4v-2h16z"/></g>',
  check:
    '<path fill="currentColor" d="M10 18H8v-2h2zm-2-2H6v-2h2zm4-2v2h-2v-2zm-6 0H4v-2h2zm8 0h-2v-2h2zm2-2h-2v-2h2zm2-2h-2V8h2zm2-2h-2V6h2z"/>',
  close:
    '<path fill="currentColor" d="M7 19H5v-2h2zm12 0h-2v-2h2zM9 15v2H7v-2zm8 2h-2v-2h2zm-6-2H9v-2h2zm4 0h-2v-2h2zm-2-2h-2v-2h2zm-2-2H9V9h2zm4 0h-2V9h2zM9 9H7V7h2zm8 0h-2V7h2zM7 7H5V5h2zm12 0h-2V5h2z"/>',
  target:
    '<path fill="currentColor" d="M5 1h14v2H5zM3 3h2v2H3zm0 16h2v2H3zm16 0h2v2h-2zm0-16h2v2h-2zm2 2h2v14h-2zM5 21h14v2H5zM1 5h2v14H1zm8 0h6v2H9zM5 9h2v6H5zm4 8h6v2H9zm8-8h2v6h-2zm-6 0h2v2h-2zM7 7h2v2H7zm0 8h2v2H7zm8 0h2v2h-2zm0-8h2v2h-2zm-6 4h2v2H9zm2 2h2v2h-2zm2-2h2v2h-2z"/>',
  clock:
    '<path fill="currentColor" d="M6 2h12v2H6zM2 6h2v12H2zm18 0h2v12h-2zm-2-2h2v2h-2zM4 4h2v2H4zm2 18h12v-2H6zm12-2h2v-2h-2zM4 20h2v-2H4zm7-14h2v7h-2zm2 7h2v2h-2zm2 2h2v2h-2z"/>',
  play:
    '<path fill="currentColor" d="M15 11h-2V9h2zm0 4h-2v-2h2zm-2 2h-2v-2h2zm0-8h-2V7h2zm-2-2H9V5h2zM9 21H7V3h2zm6-8h2v-2h-2zm-6 4h2v2H9z"/>',
  shuffle:
    '<path fill="currentColor" d="M10 19H2v-2h8zm12 0h-8v-2h8zm-10-2h-2v-6h2zm6-10h2v2h2v2h-2v2h-2v2h-2v-4h-4V9h4V5h2zM8 11H2V9h6z"/>',
  edit:
    '<path fill="currentColor" d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2zM6 16H4v4h4v-2H6z"/>',
  star:
    '<path fill="currentColor" d="M5 20h3v2H3v-6h2zm16 2h-5v-2h3v-4h2zm-11-2H8v-2h2zm6 0h-2v-2h2zm-2-2h-4v-2h4zm-7-2H5v-3h2zm12 0h-2v-3h2zM5 13H3v-2h2zm16 0h-2v-2h2zM9 9H3v2H1V7h8zm14 2h-2V9h-6V7h8zM11 7H9V3h2zm4 0h-2V3h2zm-2-4h-2V1h2z"/>',
  "chevron-down":
    '<path fill="currentColor" d="M13 16h-2v-2h2zm-2-2H9v-2h2zm4 0h-2v-2h2zm-6-2H7v-2h2zm8 0h-2v-2h2zM7 10H5V8h2zm12 0h-2V8h2z"/>',
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- tests/popup/components/pixelarticons.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Format, then commit**

```bash
pnpm format
git add src/popup/components/pixelarticons.ts tests/popup/components/pixelarticons.test.ts
git commit -m "feat(theme): add offline Pixelarticons body map for Pokédex icons"
```

---

## Task 3: Icon theme branch (Lucide for slate, Pixelarticons for pokedex)

**Files:**
- Modify: `src/popup/components/Icon.tsx`
- Test: `tests/popup/components/icon-theme.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/components/icon-theme.test.tsx`:

```tsx
import { render } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { Icon, type IconName, PIXELARTICONS_SLUG } from "../../../src/popup/components/Icon";
import { PIXELARTICONS_BODIES } from "../../../src/popup/components/pixelarticons";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function pdx(children: ComponentChildren) {
  return <ThemeContext.Provider value="pokedex">{children}</ThemeContext.Provider>;
}

describe("Icon theme branch", () => {
  it("renders a Lucide (stroke) glyph under slate by default", () => {
    const { container } = render(<Icon name="search" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
  });

  it("renders a Pixelarticons (fill, no stroke) glyph under pokedex", () => {
    const { container } = render(pdx(<Icon name="search" />));
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).not.toHaveAttribute("stroke");
    expect(svg?.innerHTML).toContain("path");
  });

  it("respects the size prop in the pokedex branch", () => {
    const { container } = render(pdx(<Icon name="star" size={40} />));
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("maps all 16 roles to a slug that has a body", () => {
    const roles = Object.keys(PIXELARTICONS_SLUG) as IconName[];
    expect(roles).toHaveLength(16);
    for (const role of roles) {
      expect(PIXELARTICONS_BODIES[PIXELARTICONS_SLUG[role]]).toBeTruthy();
    }
  });

  it("renders a glyph for every role under pokedex", () => {
    for (const role of Object.keys(PIXELARTICONS_SLUG) as IconName[]) {
      const { container } = render(pdx(<Icon name={role} />));
      expect(container.querySelector("svg")?.innerHTML).toContain("path");
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- tests/popup/components/icon-theme.test.tsx`
Expected: FAIL — `PIXELARTICONS_SLUG` is not exported from `Icon`, and pokedex renders a Lucide svg (has `stroke`).

- [ ] **Step 3: Modify `Icon.tsx`**

Replace the top of the file (the imports + the `IconName` type block) so it reads:

```tsx
import type { JSX } from "preact";
import { useThemeContext } from "../theme/ThemeContext";
import { PIXELARTICONS_BODIES } from "./pixelarticons";

export type IconName =
  | "search"
  | "bar-chart"
  | "settings"
  | "info"
  | "trash"
  | "external"
  | "refresh"
  | "check"
  | "x"
  | "target"
  | "timer"
  | "play"
  | "shuffle"
  | "pencil"
  | "star"
  | "chevron-down";

/** IconName role → Pixelarticons slug. The 16-role contract (see iconography.html). */
export const PIXELARTICONS_SLUG: Record<IconName, string> = {
  search: "search",
  "bar-chart": "chart",
  settings: "sliders",
  info: "info-box",
  trash: "trash",
  external: "external-link",
  refresh: "reload",
  check: "check",
  x: "close",
  target: "target",
  timer: "clock",
  play: "play",
  shuffle: "shuffle",
  pencil: "edit",
  star: "star",
  "chevron-down": "chevron-down",
};

interface IconProps {
  name: IconName;
  size?: number;
  filled?: boolean;
}
```

Then change the start of the `Icon` function body. The current code is:

```tsx
export function Icon({ name, size = 16, filled = false }: IconProps): JSX.Element | null {
  const props = {
```

Replace it with (insert the theme read + pokedex branch *before* `const props`):

```tsx
export function Icon({ name, size = 16, filled = false }: IconProps): JSX.Element | null {
  const theme = useThemeContext();

  if (theme === "pokedex") {
    // Pixelarticons are single-form pixel glyphs; "lit"/emphasis states are expressed
    // via parent color in .pdx CSS, so `filled` is intentionally ignored in this branch.
    const body = PIXELARTICONS_BODIES[PIXELARTICONS_SLUG[name]];
    if (!body) return null;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static committed SVG bodies, not user input
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  const props = {
```

Leave everything below (`const props = { ... }`, the entire Lucide `switch (name)`, and `default: return null;`) **unchanged**.

- [ ] **Step 4: Run the new + existing Icon tests to verify they pass**

Run: `pnpm test -- tests/popup/components/icon-theme.test.tsx tests/popup/components/icon.test.tsx`
Expected: PASS (the 5 new theme tests + the 3 existing Icon tests).

> If `pnpm lint` later flags the suppression comment's placement, the only valid alternative is the JSX-expression form on its own line directly above the attribute: `{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static committed SVG bodies, not user input */}`. Prefer the `//` line-comment form shown above first.

- [ ] **Step 5: Typecheck + lint, then commit**

```bash
pnpm typecheck
pnpm format
pnpm lint
git add src/popup/components/Icon.tsx tests/popup/components/icon-theme.test.tsx
git commit -m "feat(theme): render Pixelarticons in Icon under the Pokédex theme"
```

---

## Task 4: Provide ThemeContext from App

**Files:**
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/app-icon-propagation.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/app-icon-propagation.test.tsx`:

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

describe("App propagates theme to icons via context", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders pokedex (fill, no stroke) icons when theme is pokedex", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelector("svg[fill='currentColor']:not([stroke])")).not.toBeNull()
    );
  });

  it("renders slate (stroke) icons by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    expect(container.querySelector("svg[stroke='currentColor']")).not.toBeNull();
    expect(container.querySelector("svg[fill='currentColor']:not([stroke])")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- tests/popup/app-icon-propagation.test.tsx`
Expected: FAIL — the first test fails because, without a provider, every `Icon` defaults to slate (Lucide, has `stroke`), so the `fill,no-stroke` selector finds nothing.

- [ ] **Step 3: Modify `src/popup/App.tsx`**

Add the import alongside the existing imports:

```tsx
import { ThemeContext } from "./theme/ThemeContext";
```

Wrap the returned tree in the provider. Change:

```tsx
  return (
    <div class={`wh-popup ${theme === "pokedex" ? "pdx" : "wh"}`}>
```

to:

```tsx
  return (
    <ThemeContext.Provider value={theme}>
      <div class={`wh-popup ${theme === "pokedex" ? "pdx" : "wh"}`}>
```

and add the matching closing tag — change the final:

```tsx
    </div>
  );
}
```

to:

```tsx
      </div>
    </ThemeContext.Provider>
  );
}
```

(Re-indent the wrapped block by two spaces; `pnpm format` will normalise indentation regardless.)

- [ ] **Step 4: Run the test + the existing scope-class test to verify they pass**

Run: `pnpm test -- tests/popup/app-icon-propagation.test.tsx tests/popup/app-theme.test.tsx`
Expected: PASS (2 new propagation tests + 2 existing scope-class tests).

- [ ] **Step 5: Typecheck, format, lint, then commit**

```bash
pnpm typecheck
pnpm format
pnpm lint
git add src/popup/App.tsx tests/popup/app-icon-propagation.test.tsx
git commit -m "feat(theme): provide ThemeContext from App so icons fork by theme"
```

---

## Final verification (after all tasks)

- [ ] `pnpm test` — entire suite green (Phase 0's 461 + the new Phase 1 tests).
- [ ] `pnpm typecheck` — clean.
- [ ] `pnpm lint` — clean.
- [ ] `pnpm build` — succeeds.
- [ ] **Slate regression guard:** `git diff <phase-0-tip>..HEAD -- src/shared/styles/tokens.css` is empty, and the Lucide `switch` in `Icon.tsx` is unchanged (only additions above it).

> **Note on visual verification:** the spec asks that "every role renders in both themes against `preview/pokedex/iconography.html`." That visual pass over the actual built popup is most useful once the popup chrome exists (Phase 2). Phase 1's guarantee is structural and is fully covered by the per-role rendering test (`renders a glyph for every role under pokedex`). A loaded-extension visual check can be folded into the Phase 2 verification.
