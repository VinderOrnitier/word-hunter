# Pokédex Theme — Phase 4 (In-page overlays) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skin the three content-script (in-page) overlays under the Pokédex theme — the hidden-word highlighter, the InPageToast (hint/info/auto), and the CelebrationPopup — without touching the Slate overlays.

**Architecture:** Parallel skins (ADR 007). The content script reads the active theme asynchronously (`getTheme()`, mirroring how it already reads locale) and each mount point chooses the Slate component or its `.pdx` sibling. Pokédex `--pdx-*` tokens are scoped to `.pdx`, and `.pdx` is a **token-only selector** (no layout/visual props) — so every overlay host element gets a `pdx` class to resolve the tokens for its subtree (safe even on the inline hidden-word `<span>`). Pokédex overlay CSS lives in a new `src/content/styles/overlay.pdx.css` (global `.pdx-toast`/`.pdx-celebration*`/`.pdx-next*` selectors, matching the design source); `.pdx-highlight`/`.pdx-highlight--found` already exist in `theme-pokedex.css`.

**Tech Stack:** Preact (content script via `preact` `render`/`h`), TypeScript, Jest + @testing-library/preact, CSS custom properties scoped under `.pdx`, @fontsource (Press Start 2P, VT323).

---

## Context for the implementer (read before starting)

- **Content entry:** `src/content/index.ts`. It already imports `../shared/styles/tokens.css` + `./styles/overlay.css`, reads locale async into `currentLocale` (via `readLocale().then` + `chrome.storage.onChanged`), and exposes `getLocaleRef = () => currentLocale`. Managers are created at module top with `getLocaleRef`; `inject()` runs on load + on navigation.
- **Theme API:** `getTheme(): Promise<Theme>` from `src/shared/storage.ts`; `Theme = "slate" | "pokedex"` (`src/shared/types.ts`); `DEFAULT_THEME = "slate"`.
- **Mount points (each gets a `pdx` host class + component branch):**
  - **Hidden word:** `src/content/word-renderer.ts` creates `<span class="hw-host">` inline in the page and renders `HiddenWordHost` → `HiddenWord` into it. `HiddenWord` is an inline `<button>` with `inheritedStyle` (page font) + a gradient-underline. The Pokédex variant swaps the underline for the `.pdx-highlight` / `.pdx-highlight--found` lit-cell treatment.
  - **Toast:** `src/content/mount-toast.ts` creates `<div class="{hostClass}">` in `body` and renders `InPageToast`. Called by `HintTimer` (variant `"hint"`, passes `onFind`), `AutoModeToast` (`"auto"`), `NoParagraphNotification` (`"info"`).
  - **Celebration:** `src/content/celebration-manager.ts` creates `<div>` in `body` and renders `CelebrationPopup`.
- **Design source (in repo):** `design-system/preview/pokedex/in-page-overlays.html` (authoritative CSS at ~lines 110–380 and markup at ~lines 520–700) and `design-system/ui_kits/in-page-overlay-pokedex/scene.html`. **Slate parity rules:** toast keeps hint/info/auto variants; the hint variant's find affordance is preserved as an extra **cream pixel key** (user decision) even though the static design omits it; celebration keeps the next-word pill (`.pdx-next`, shown when `next` is provided) and the review-only "remove word" ghost CTA (`.pdx-celebration__cta`, shown when `onClear` is provided).
- **Positioning:** Slate positions the component root (`.hw-toast`/`.hw-celebration`) as `position: fixed`, NOT the host div. So the `.pdx` components must carry their own fixed positioning (provided in `overlay.pdx.css`).
- **Fonts:** content script does not yet load pixel/LCD fonts; Task 4.1 adds `@fontsource/press-start-2p/400.css` + `@fontsource/vt323/400.css` imports. (`--pdx-font-ui` is not used by these overlays, so Space Grotesk is not needed here.)
- **Tests:** content components import `chrome.runtime.getURL` at module load (logo/placeholder). Provide a `chrome` mock in tests (see existing `tests/content/**` for the pattern). `t(key, locale)` is the content-script i18n form.
- **After each task:** `pnpm test`, `pnpm typecheck`, `pnpm build` green; Slate untouched: `git diff --stat -- src/content/styles/overlay.css src/content/components/CelebrationPopup.tsx src/content/components/InPageToast.tsx src/content/components/HiddenWord.tsx src/popup/styles/popup.css src/popup/styles/tokens.css` must be EMPTY. Commit per task.

---

### Task 4.1: `overlay.pdx.css` + content-entry imports

**Files:**
- Create: `src/content/styles/overlay.pdx.css`
- Modify: `src/content/index.ts` (add imports only)

No test (CSS + imports; `pnpm build` is the gate).

- [ ] **Step 1: Create `src/content/styles/overlay.pdx.css`** with the following (transcribed from `design-system/preview/pokedex/in-page-overlays.html`, de-scoped from the preview's scene mocks; positioning + the find pixel-key are added for the live overlay):

```css
/* =========================================================
   Pokédex in-page overlays (Phase 4)
   Global .pdx-* selectors; --pdx-* tokens resolve via the
   `pdx` class placed on each overlay host element.
   ========================================================= */

/* ---------- InPageToast ---------- */
.pdx-toast {
  position: fixed;
  top: 20px;
  z-index: 2147483000;
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  height: 36px;
  max-width: 360px;
  padding: 3px;
  background: linear-gradient(180deg, var(--pdx-shell) 0%, var(--pdx-shell-2) 100%);
  border: 1px solid var(--pdx-shell-deep);
  border-radius: 5px;
  box-shadow:
    inset 0 1px 0 var(--pdx-shell-edge),
    inset 0 -2px 0 var(--pdx-shell-deep),
    0 6px 14px rgba(0, 0, 0, 0.32),
    0 1px 0 rgba(0, 0, 0, 0.4);
  color: var(--pdx-on-shell);
  font-family: var(--pdx-font-pixel);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;
}
.pdx-toast--hint {
  color: var(--pdx-lens-hi);
  right: 16px;
}
.pdx-toast--info {
  color: rgba(244, 239, 226, 0.6);
  left: 50%;
  transform: translateX(-50%);
}
.pdx-toast--auto {
  color: var(--pdx-led-yellow);
  left: 50%;
  transform: translateX(-50%);
}
.pdx-toast::before {
  content: "";
  flex: 0 0 4px;
  align-self: stretch;
  margin-right: 6px;
  border-radius: 2px;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}
.pdx-toast__lens {
  width: 22px;
  height: 22px;
  align-self: center;
  flex: 0 0 auto;
  background: radial-gradient(
    circle at 35% 30%,
    var(--pdx-lens-hi) 0%,
    var(--pdx-lens) 55%,
    var(--pdx-lens-deep) 100%
  );
  border: 0;
  padding: 0;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1.5px var(--pdx-lens-rim),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
  cursor: pointer;
}
.pdx-toast__lens::before {
  content: "";
  position: absolute;
  top: 14%;
  left: 16%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  filter: blur(0.5px);
}
.pdx-toast__msg {
  flex: 1;
  display: inline-flex;
  align-items: center;
  padding: 0 10px 0 6px;
  color: var(--pdx-on-shell);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
}
.pdx-toast__msg .word {
  color: var(--pdx-led-yellow);
  margin-left: 6px;
  font-family: var(--pdx-font-lcd);
  font-size: 13px;
  text-shadow: 0 0 4px rgba(255, 210, 63, 0.45);
  text-transform: lowercase;
  letter-spacing: 0;
}
.pdx-toast__find,
.pdx-toast__close {
  width: 22px;
  height: 22px;
  align-self: center;
  flex: 0 0 auto;
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 3px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  color: var(--pdx-on-key);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 1px;
}
.pdx-toast__find svg,
.pdx-toast__close svg {
  font-size: 11px;
}

/* ---------- CelebrationPopup ---------- */
.pdx-celebration-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: rgba(11, 15, 25, 0.55);
  border: 0;
}
.pdx-celebration {
  width: 340px;
  padding: 10px 10px 12px;
  position: relative;
  background: linear-gradient(
    180deg,
    var(--pdx-shell-hi) 0%,
    var(--pdx-shell) 24%,
    var(--pdx-shell-2) 100%
  );
  border: 1px solid var(--pdx-shell-deep);
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.18),
    0 18px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 var(--pdx-shell-edge);
}
.pdx-celebration__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 8px;
}
.pdx-celebration__lens {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  background: radial-gradient(
    circle at 35% 30%,
    var(--pdx-lens-hi) 0%,
    var(--pdx-lens) 55%,
    var(--pdx-lens-deep) 100%
  );
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1px var(--pdx-lens-rim),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    0 1px 1px rgba(0, 0, 0, 0.4);
}
.pdx-celebration__leds {
  display: flex;
  gap: 4px;
}
.pdx-celebration__leds .led {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.pdx-celebration__leds .led--red {
  background: var(--pdx-led-red);
  box-shadow: 0 0 3px var(--pdx-led-red);
}
.pdx-celebration__leds .led--green {
  background: var(--pdx-led-green);
  box-shadow: 0 0 3px var(--pdx-led-green);
}
.pdx-celebration__leds .led--yellow {
  background: var(--pdx-led-yellow);
  box-shadow: 0 0 3px var(--pdx-led-yellow);
}
.pdx-celebration__stamp {
  flex: 1;
  text-align: right;
  font-family: var(--pdx-font-pixel);
  font-size: 7px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
}
.pdx-celebration__lcd {
  position: relative;
  overflow: hidden;
  padding: 14px 18px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(
    180deg,
    var(--pdx-lcd-hi) 0%,
    var(--pdx-lcd) 28%,
    var(--pdx-lcd-lo) 100%
  );
  border: 1px solid var(--pdx-lcd-frame);
  border-radius: 6px;
  box-shadow:
    inset 0 2px 6px rgba(15, 42, 64, 0.35),
    inset 0 -2px 0 rgba(255, 255, 255, 0.22);
}
.pdx-celebration__lcd::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(15, 42, 64, 0.1) 0,
    rgba(15, 42, 64, 0.1) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: multiply;
  pointer-events: none;
}
.pdx-celebration__art {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  line-height: 1;
  position: relative;
  z-index: 2;
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 4px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.pdx-celebration__art img {
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
}
.pdx-celebration__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 2;
  color: var(--pdx-lcd-ink);
}
.pdx-celebration__found {
  font-family: var(--pdx-font-pixel);
  font-size: 12px;
  line-height: 1.1;
  letter-spacing: 0.08em;
  color: #186e36;
  text-shadow: 0 0 8px rgba(47, 212, 110, 0.6);
}
.pdx-celebration__word {
  font-family: var(--pdx-font-lcd);
  font-size: 28px;
  line-height: 1;
  color: var(--pdx-lcd-ink);
  text-transform: lowercase;
}
.pdx-celebration__meta {
  display: flex;
  gap: 10px;
  margin-top: 2px;
  font-family: var(--pdx-font-pixel);
  font-size: 7px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pdx-lcd-frame-2);
}
.pdx-celebration__sep {
  color: rgba(15, 42, 64, 0.35);
}
.pdx-next {
  margin-top: 6px;
  padding: 5px 8px 5px 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 35, 64, 0.5);
  border: 1px solid var(--pdx-lcd-frame);
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.18);
}
.pdx-next__label {
  font-family: var(--pdx-font-pixel);
  font-size: 6px;
  letter-spacing: 0.08em;
  color: rgba(244, 239, 226, 0.55);
  text-transform: uppercase;
}
.pdx-next__art {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 239, 226, 0.12);
  border-radius: 2px;
  font-size: 12px;
}
.pdx-next__art img {
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
}
.pdx-next__word {
  font-family: var(--pdx-font-lcd);
  font-size: 16px;
  line-height: 1;
  color: var(--pdx-key);
  text-transform: lowercase;
}
.pdx-celebration__cta {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 4px;
  color: var(--pdx-on-key);
  font-family: var(--pdx-font-pixel);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
```

- [ ] **Step 2: Add imports to the TOP of `src/content/index.ts`** (after the existing `./styles/overlay.css` import):

```ts
import "../shared/styles/tokens.css";
import "../shared/styles/theme-pokedex.css";
import "./styles/overlay.css";
import "./styles/overlay.pdx.css";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
```

(Keep the existing `tokens.css` and `overlay.css` imports; just add `theme-pokedex.css`, `overlay.pdx.css`, and the two font imports. The existing `render`/other imports below stay as-is.)

- [ ] **Step 3: Verify Slate untouched + build**

Run: `git diff --stat -- src/content/styles/overlay.css`
Expected: empty.

Run: `pnpm build`
Expected: succeeds (content bundle now includes pokedex css/fonts).

- [ ] **Step 4: Commit**

```bash
git add src/content/styles/overlay.pdx.css src/content/index.ts
git commit -m "feat(pokedex): add in-page overlay CSS + load pokedex theme/fonts in content script"
```

---

### Task 4.2: `HiddenWord.pdx` + theme branch in the word renderer

**Files:**
- Create: `src/content/components/HiddenWord.pdx.tsx`
- Modify: `src/content/components/HiddenWordHost.tsx` (pass `theme` through)
- Modify: `src/content/word-renderer.ts` (accept `theme`, add `pdx` host class, branch component)
- Modify: `src/content/index.ts` (resolve `theme` in `inject()` and pass to `WordRenderer`)
- Test: `tests/content/hidden-word-pdx.test.tsx`

The Pokédex hidden word is the same inline `<button>` mechanics (hover-reveal cursor, reversed text, `onFind`) but uses the `.pdx-highlight` lit-cell classes instead of the gradient underline.

- [ ] **Step 1: Write the failing test** in `tests/content/hidden-word-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { HiddenWordPdx } from "../../src/content/components/HiddenWord.pdx";

describe("HiddenWordPdx", () => {
  it("renders the reversed word with the highlight class", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={false} />);
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("pdx-highlight");
    expect(btn?.className).not.toContain("pdx-highlight--found");
    expect(btn?.textContent).toBe("retto");
  });

  it("uses the found variant class once found", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={true} />);
    expect(container.querySelector("button")?.className).toContain("pdx-highlight--found");
  });

  it("calls onFind on click", () => {
    const onFind = jest.fn();
    const { container } = render(<HiddenWordPdx word="otter" found={false} onFind={onFind} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(onFind).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/content/hidden-word-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/content/components/HiddenWord.pdx.tsx`** (same props as `HiddenWord`; swap the styling):

```tsx
import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import type { HiddenWordProps } from "./HiddenWord";

export function HiddenWordPdx({
  word,
  found,
  hinted = false,
  onFind,
  inheritedStyle,
  hoverRevealSeconds = 0,
}: HiddenWordProps): JSX.Element {
  const [pointerReady, setPointerReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (): void => {
    if (found) return;
    timerRef.current = setTimeout(() => setPointerReady(true), hoverRevealSeconds * 1000);
  };

  const handleMouseLeave = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPointerReady(false);
  };

  const cursor = found || pointerReady ? "pointer" : "text";
  // `hinted` keeps the same lit-cell as the unfound state under Pokédex
  // (the LED highlight already reads as "the system is helping you").
  void hinted;
  const cls = found ? "pdx-highlight pdx-highlight--found" : "pdx-highlight";

  return (
    <button
      type="button"
      tabIndex={-1}
      class={cls}
      onClick={onFind}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...inheritedStyle, cursor }}
    >
      {[...word].reverse().join("")}
    </button>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/content/hidden-word-pdx.test.tsx`
Expected: PASS (3).

- [ ] **Step 5: Thread `theme` through the host + renderer.**

In `src/content/components/HiddenWordHost.tsx`: add `theme?: Theme` to `HiddenWordHostProps` (import `Theme` from `../../shared/types`), and render `theme === "pokedex" ? <HiddenWordPdx .../> : <HiddenWord .../>` (both get the identical prop set already passed to `HiddenWord`).

In `src/content/word-renderer.ts`: add `theme?: Theme` to `WordRendererOptions` (import `Theme`); when `theme === "pokedex"`, set the host class to `"hw-host pdx"` instead of `"hw-host"` (so `--pdx-*` resolve for the inline subtree); pass `theme` into the `h(HiddenWordHost, { ... theme })` props.

In `src/content/index.ts`: inside `inject()`, after `const settings = await getSettings();` add `const theme = await getTheme();` (import `getTheme` from `../shared/storage`), and pass `theme` in the `WordRenderer(activeWord, groups, { ... theme })` options object.

- [ ] **Step 6: Re-run the full content suite + typecheck**

Run: `pnpm test tests/content && pnpm typecheck`
Expected: green.

- [ ] **Step 7: Commit**

```bash
git add src/content/components/HiddenWord.pdx.tsx src/content/components/HiddenWordHost.tsx src/content/word-renderer.ts src/content/index.ts tests/content/hidden-word-pdx.test.tsx
git commit -m "feat(pokedex): skin the in-page hidden word with the LED highlight"
```

---

### Task 4.3: `InPageToast.pdx` + theme reader + toast mount branch

**Files:**
- Create: `src/content/components/InPageToast.pdx.tsx`
- Modify: `src/content/index.ts` (module-level theme reader + `getThemeRef`; pass to managers)
- Modify: `src/content/mount-toast.ts` (accept `theme`, add `pdx` host class, branch component)
- Modify: `src/content/hint-timer.ts`, `src/content/auto-mode-toast.ts`, `src/content/no-paragraph-notification.ts` (accept `getTheme: () => Theme` and pass into `mountToast`)
- Test: `tests/content/in-page-toast-pdx.test.tsx`

The Pokédex toast keeps the lens (opens popup), the message (with optional inline `.word` for the auto variant), the close key, and — per the design decision — a find pixel-key when `onFind` is provided.

- [ ] **Step 1: Write the failing test** in `tests/content/in-page-toast-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { InPageToastPdx } from "../../src/content/components/InPageToast.pdx";

beforeAll(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { sendMessage: jest.fn(), getURL: (p: string) => p },
  };
});

describe("InPageToastPdx", () => {
  it("renders the variant class, lens, message and close — no find key without onFind", () => {
    const { container } = render(
      <InPageToastPdx message="THE WORD IS ON THIS PAGE" locale="en" variant="hint" onClose={() => {}} />,
    );
    expect(container.querySelector(".pdx-toast--hint")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__lens")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__msg")?.textContent).toContain("THE WORD IS ON THIS PAGE");
    expect(container.querySelector(".pdx-toast__close")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__find")).toBeNull();
  });

  it("renders a find pixel-key when onFind is provided and fires it", () => {
    const onFind = jest.fn();
    const { container } = render(
      <InPageToastPdx message="x" locale="en" variant="hint" onClose={() => {}} onFind={onFind} />,
    );
    const find = container.querySelector(".pdx-toast__find") as HTMLButtonElement;
    expect(find).toBeTruthy();
    fireEvent.click(find);
    expect(onFind).toHaveBeenCalledTimes(1);
  });

  it("fires onClose from the close key", () => {
    const onClose = jest.fn();
    const { container } = render(
      <InPageToastPdx message="x" locale="en" variant="info" onClose={onClose} />,
    );
    fireEvent.click(container.querySelector(".pdx-toast__close") as HTMLButtonElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/content/in-page-toast-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/content/components/InPageToast.pdx.tsx`:**

```tsx
import type { JSX } from "preact";
import type { Locale } from "../../i18n";
import { t } from "../../i18n";

interface InPageToastPdxProps {
  message: string;
  locale: Locale;
  variant: "hint" | "info" | "auto";
  onClose: () => void;
  onFind?: () => void;
}

const SEARCH_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 2h8v2H7zM5 4h2v2H5zm12 0h2v2h-2zM3 6h2v8H3zm16 0h2v8h-2zM5 14h2v2H5zm12 0h2v2h-2zm-10 2h8v2H7zm10 2h2v2h-2zm2 2h2v2h-2z" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3h2v2H5zm2 2h2v2H7zm2 2h2v2H9zm2 2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zM9 11h2v2H9zm-2 2h2v2H7zm-2 2h2v2H5zm10-4h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2z" />
  </svg>
);

export function InPageToastPdx({
  message,
  locale,
  variant,
  onClose,
  onFind,
}: InPageToastPdxProps): JSX.Element {
  return (
    <div class={`pdx-toast pdx-toast--${variant}`}>
      <button
        type="button"
        class="pdx-toast__lens"
        onClick={() => chrome.runtime.sendMessage({ type: "OPEN_POPUP" })}
        aria-label={t("toast_open_aria", locale)}
        title={t("toast_open_aria", locale)}
      />
      <span class="pdx-toast__msg">{message}</span>
      {onFind != null && (
        <button
          type="button"
          class="pdx-toast__find"
          onClick={onFind}
          aria-label={t("toast_find_aria", locale)}
          title={t("toast_find_aria", locale)}
        >
          {SEARCH_ICON}
        </button>
      )}
      <button
        type="button"
        class="pdx-toast__close"
        onClick={onClose}
        aria-label={t("toast_dismiss_aria", locale)}
      >
        {CLOSE_ICON}
      </button>
    </div>
  );
}
```

> **Note:** the auto variant's inline `.word` (e.g. "AUTO-HUNTER ACTIVE pintail") is produced by the caller embedding it in `message` — match how the Slate `content_auto_toast`/auto message is currently built; if the Slate auto path passes a plain string, keep the pokedex `.word` styling optional and out of scope unless the message already carries markup. Verify against `auto-mode-toast.ts` and keep behavior identical to Slate (string message).

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/content/in-page-toast-pdx.test.tsx`
Expected: PASS (3).

- [ ] **Step 5: Add the module-level theme reader to `src/content/index.ts`** (mirror the locale reader), near the locale reader:

```ts
import { getTheme } from "../shared/storage";
import type { Theme } from "../shared/types";

let currentTheme: Theme = "slate";
getTheme().then((th) => {
  currentTheme = th;
});
// (extend the existing storage.onChanged listener, or add one)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.theme?.newValue) {
    currentTheme = changes.theme.newValue as Theme;
  }
});

const getThemeRef = (): Theme => currentTheme;
```

(If `getTheme` was already imported in Task 4.2, reuse it. Fold the `theme` check into the existing `onChanged` listener rather than adding a duplicate if cleaner.)

- [ ] **Step 6: Thread `getThemeRef` into the toast managers.**

- `src/content/mount-toast.ts`: add `theme: Theme` to `MountToastOptions` (import `Theme`); set `host.className = theme === "pokedex" ? \`${opts.hostClass} pdx\` : opts.hostClass;`; render `theme === "pokedex" ? h(InPageToastPdx, {...}) : h(InPageToast, {...})` with the identical prop set.
- `src/content/hint-timer.ts`, `auto-mode-toast.ts`, `no-paragraph-notification.ts`: add a `getTheme: () => Theme` parameter to each factory (alongside `getLocale`) and pass `theme: getTheme()` in their `mountToast(doc, { ... })` calls.
- `src/content/index.ts`: update the manager constructions to pass `getThemeRef`: `HintTimer(document, getLocaleRef, getThemeRef)`, `AutoModeToast(document, getLocaleRef, getThemeRef)`, and the `NoParagraphNotification(document, getLocaleRef, getThemeRef)` call inside `inject()`.

- [ ] **Step 7: Full content suite + typecheck + build**

Run: `pnpm test tests/content && pnpm typecheck && pnpm build`
Expected: green. Fix any test that constructs these managers without the new arg (pass a `() => "slate"` stub).

- [ ] **Step 8: Commit**

```bash
git add src/content/components/InPageToast.pdx.tsx src/content/mount-toast.ts src/content/hint-timer.ts src/content/auto-mode-toast.ts src/content/no-paragraph-notification.ts src/content/index.ts tests/content/in-page-toast-pdx.test.tsx
git commit -m "feat(pokedex): skin the in-page toast (hint/info/auto) with the device chrome"
```

---

### Task 4.4: `CelebrationPopup.pdx` + celebration manager branch

**Files:**
- Create: `src/content/components/CelebrationPopup.pdx.tsx`
- Modify: `src/content/celebration-manager.ts` (accept `getTheme`, add `pdx` host class, branch component)
- Modify: `src/content/index.ts` (pass `getThemeRef` to `CelebrationManager`)
- Test: `tests/content/celebration-popup-pdx.test.tsx`

Pokédex celebration = centred LCD mini-device over a scrim. Header (lens + 3 LEDs + "CATCH" stamp), LCD (art + REGISTERED!/word/meta), optional next-up pill, optional review-only remove-word CTA. Two found-color cues preserved: the green `__found` stamp + the green header LED.

- [ ] **Step 1: Write the failing test** in `tests/content/celebration-popup-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { CelebrationPopupPdx } from "../../src/content/components/CelebrationPopup.pdx";

beforeAll(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { getURL: (p: string) => p },
  };
});

const base = {
  visible: true as const,
  locale: "en" as const,
  word: "otter",
  durationS: 12,
  hintUsed: false,
};

describe("CelebrationPopupPdx", () => {
  it("returns null when not visible", () => {
    const { container } = render(<CelebrationPopupPdx {...base} visible={false} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-celebration")).toBeNull();
  });

  it("renders the device with word + duration and a green found LED", () => {
    const { container } = render(<CelebrationPopupPdx {...base} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-celebration")).toBeTruthy();
    expect(container.querySelector(".pdx-celebration__word")?.textContent).toBe("otter");
    expect(container.querySelector(".pdx-celebration__leds .led--green")).toBeTruthy();
    expect(container.querySelector(".pdx-celebration__found")).toBeTruthy();
  });

  it("shows the next-up pill only when next is provided", () => {
    const { container, rerender } = render(<CelebrationPopupPdx {...base} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-next")).toBeNull();
    rerender(<CelebrationPopupPdx {...base} next={{ word: "eevee" }} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-next__word")?.textContent).toBe("eevee");
  });

  it("shows the remove-word CTA only when onClear is provided and fires it", () => {
    const onClear = jest.fn();
    const { container } = render(
      <CelebrationPopupPdx {...base} onClear={onClear} onDismiss={() => {}} />,
    );
    const cta = container.querySelector(".pdx-celebration__cta") as HTMLButtonElement;
    expect(cta).toBeTruthy();
    fireEvent.click(cta);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("dismisses when the scrim backdrop is clicked", () => {
    const onDismiss = jest.fn();
    const { container } = render(<CelebrationPopupPdx {...base} onDismiss={onDismiss} />);
    fireEvent.click(container.querySelector(".pdx-celebration-overlay") as HTMLElement);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/content/celebration-popup-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/content/components/CelebrationPopup.pdx.tsx`** (reuse the same props interface as Slate `CelebrationPopup`; export from there or redeclare locally). Use the placeholder-url pattern from the Slate component:

```tsx
import type { JSX } from "preact";
import rawPlaceholderUrl from "../../assets/pokemon/_placeholder.png";
import type { Locale } from "../../i18n";
import { t } from "../../i18n";

const placeholderUrl = chrome.runtime.getURL(rawPlaceholderUrl.replace(/^\//, ""));
const IMAGE_URL_RE = /^(https?:|chrome-extension:|\/|data:|\.\.?\/)/;

interface NextWordPreview {
  word: string;
  art?: string;
}

interface CelebrationPopupPdxProps {
  visible: boolean;
  locale: Locale;
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
  next?: NextWordPreview;
  onDismiss: () => void;
  onClear?: () => void;
}

function artNode(art: string | undefined): JSX.Element | null {
  if (art === undefined) return null;
  if (IMAGE_URL_RE.test(art)) {
    return (
      <img
        class="pdx-celebration__art-img"
        src={art}
        alt=""
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = placeholderUrl;
        }}
      />
    );
  }
  return <>{art}</>;
}

export function CelebrationPopupPdx({
  visible,
  locale,
  word,
  durationS,
  hintUsed,
  art,
  next,
  onDismiss,
  onClear,
}: CelebrationPopupPdxProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <button
      type="button"
      class="pdx-celebration-overlay"
      aria-label={t("toast_dismiss_aria", locale)}
      onClick={onDismiss}
    >
      {/* stop propagation so clicks inside the device don't dismiss */}
      <div
        class="pdx-celebration"
        role="dialog"
        aria-modal="true"
        aria-label="Word found"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="pdx-celebration__header">
          <span class="pdx-celebration__lens" aria-hidden="true" />
          <div class="pdx-celebration__leds" aria-hidden="true">
            <span class="led led--red" />
            <span class="led led--green" />
            <span class="led led--yellow" />
          </div>
          <span class="pdx-celebration__stamp">{t("celebration_found_headline", locale)}</span>
        </div>
        <div class="pdx-celebration__lcd">
          {art !== undefined && (
            <div class="pdx-celebration__art" aria-hidden="true">
              {artNode(art)}
            </div>
          )}
          <div class="pdx-celebration__body">
            <span class="pdx-celebration__found">&gt;&gt; REGISTERED!</span>
            <span class="pdx-celebration__word">{word}</span>
            <div class="pdx-celebration__meta">
              <span>{durationS}s</span>
              <span class="pdx-celebration__sep">·</span>
              <span>
                {hintUsed ? t("celebration_hint_used", locale) : t("celebration_no_hint", locale)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {next !== undefined && (
        <div class="pdx-next" onClick={(e) => e.stopPropagation()}>
          <span class="pdx-next__label">{t("celebration_next_label", locale)}</span>
          <span class="pdx-next__art" aria-hidden="true">
            {artNode(next.art)}
          </span>
          <span class="pdx-next__word">{next.word}</span>
        </div>
      )}

      {onClear !== undefined && (
        <button
          type="button"
          class="pdx-celebration__cta"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          {t("celebration_remove_word", locale)}
        </button>
      )}
    </button>
  );
}
```

> **Note:** `>> REGISTERED!` is device-chrome flavor inside the LCD (the pokedex analogue of the headline) — keep the localized headline in the header `__stamp` so no string is lost. If a biome/jsx rule objects to nested interactive elements (button inside the overlay button), switch the outer overlay to a `<div>` with an `onClick` + a sibling visually-hidden close button; mirror however the Slate `.hw-celebration` dismiss layer satisfies the linter (it uses a `<button>` dismiss layer + a separate wrap).

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/content/celebration-popup-pdx.test.tsx`
Expected: PASS (5).

- [ ] **Step 5: Branch in `src/content/celebration-manager.ts`.**

Add `getTheme: () => Theme` as a third parameter (import `Theme`). When building the host: `host = doc.createElement("div"); if (getTheme() === "pokedex") host.className = "pdx";`. In the `render(h(...))` call choose `getTheme() === "pokedex" ? CelebrationPopupPdx : CelebrationPopup` with the identical props object. In `src/content/index.ts`, construct `CelebrationManager(document, getLocaleRef, getThemeRef)`.

- [ ] **Step 6: Full suite + typecheck + build + Slate-untouched**

Run: `pnpm test && pnpm typecheck && pnpm build`
Expected: green. Update any existing celebration-manager test to pass a `() => "slate"` theme stub.

Run: `git diff --stat -- src/content/components/CelebrationPopup.tsx src/content/components/InPageToast.tsx src/content/components/HiddenWord.tsx src/content/styles/overlay.css`
Expected: empty (Slate overlays untouched).

- [ ] **Step 7: Commit**

```bash
git add src/content/components/CelebrationPopup.pdx.tsx src/content/celebration-manager.ts src/content/index.ts tests/content/celebration-popup-pdx.test.tsx
git commit -m "feat(pokedex): skin the celebration popup as a centred LCD device"
```

---

## Self-Review (controller, before dispatch)

- **Spec coverage:** highlighter (4.2), toast hint/info/auto (4.3), celebration (4.4) all forked; CSS + entry wiring (4.1).
- **Theme plumbing:** content reads `getTheme()` once async into `currentTheme` (+ `onChanged`), exactly mirroring the existing locale reader; `inject()` awaits `getTheme()` for the renderer. Every host gets `pdx` (token resolution), confirmed safe because `.pdx` is token-only.
- **Parity preserved:** toast find affordance kept as a pixel key (user decision); celebration next-pill + remove-word CTA gated exactly as Slate (`next`/`onClear`); two found-color cues kept (green stamp + green LED).
- **Slate untouched:** Slate overlay components + `overlay.css` never edited; each task ends with a `git diff --stat` gate.
- **Risk notes:** (a) nested-interactive lint on the celebration overlay button — fallback documented; (b) existing manager tests may need a `() => "slate"` stub for the new param — flagged in 4.3/4.4; (c) pixel SVG glyphs are hand-rolled (no Icon-map churn), consistent with NumberStepper.pdx.
- **Out of scope (Phase 5/6):** theme picker; reduced-motion audit (note: `theme-pokedex.css` already has a reduced-motion block) + full a11y pass + load-unpacked smoke test of both themes.
