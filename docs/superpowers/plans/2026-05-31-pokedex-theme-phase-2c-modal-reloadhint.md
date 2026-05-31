# Pokédex Theme — Phase 2c (Custom-Word Modal + Reload Hint) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary Slate `CustomWordModal` / `ReloadHint` fallbacks inside `PlayTab.pdx` with real Pokédex siblings — a raspberry-shell modal that floats over the popup interior (blur backdrop) and an LCD inline reload-hint notice — completing the Play surface.

**Architecture:** Two new sibling components (`CustomWordModal.pdx.tsx`, `ReloadHint.pdx.tsx`) duplicate the Slate components' behaviour (focus trap, Escape, validation for the modal; reload/dismiss for the hint) but render the Pokédex DOM. The modal positions `absolute; inset:0` against `.pdx-popup` (already `position: relative` from the shell stylesheet), so it overlays the whole device. `PlayTab.pdx` drops its `.wh` bridge and renders the new siblings. Modal/reload CSS (currently only inline in the preview HTML) is folded into `popup.pdx.css`.

**Tech Stack:** Vite + Preact + TypeScript, Jest + jsdom + @testing-library/preact, biome, pnpm.

**Source of truth:** `design-system/preview/pokedex/play-tab.html` (state 4 modal markup + inline `.pdx-modal*` CSS), `design-system/preview/pokedex/in-page-overlays.html` (`.pdx-reload-hint*` CSS + markup, "RELOAD TO HUNT"), POKEDEX-IMPLEMENTATION.md §5.

**Key fact:** `src/shared/word-validation.ts` enforces **min 2, max 25** characters (`MAX_CUSTOM_LEN = 25`). The preview helper text says "3-30" — that is factually wrong; the production helper must state the real **2-25** range.

---

## File Structure

**Create:**
- `src/popup/play/ReloadHint.pdx.tsx`
- `src/popup/play/CustomWordModal.pdx.tsx`
- `tests/popup/play/reload-hint-pdx.test.tsx`
- `tests/popup/play/custom-word-modal-pdx.test.tsx`

**Modify:**
- `src/popup/styles/popup.pdx.css` — append `.pdx-reload-hint*`, `.pdx-modal*` classes
- `src/i18n/messages/en.ts` (+ `de.ts`/`uk.ts`/`ja.ts` EN-fallback stubs) — 4 new keys
- `src/popup/tabs/PlayTab.pdx.tsx` — replace the `.wh` bridge with the pdx siblings
- `tests/popup/tabs/play-tab-pdx.test.tsx` — assert pdx modal/hint wiring

**Guarantee:** No `wh-*` markup or Slate stylesheet changes. Verify with `git diff` after the final task.

---

### Task 1: Append modal + reload-hint CSS to `popup.pdx.css`

These classes currently live only as inline `<style>` in the preview HTML. Fold them into the popup stylesheet.

**Files:**
- Modify: `src/popup/styles/popup.pdx.css`

- [ ] **Step 1: Append the block**

Append to the end of `src/popup/styles/popup.pdx.css` (biome may reflow long values on save — fine, values preserved):

```css
/* ===== Reload hint (popup-internal LCD notice) ========= */
.pdx-reload-hint {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 5px 4px 8px;
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 50%, var(--pdx-lcd-lo) 100%);
  border: 1px solid var(--pdx-lcd-frame); border-radius: 5px;
  box-shadow: inset 0 1px 2px rgba(15, 42, 64, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.2);
  color: var(--pdx-lcd-ink); position: relative; overflow: hidden;
}
.pdx-reload-hint::after {
  content: ""; position: absolute; inset: 0;
  background-image: repeating-linear-gradient(0deg, rgba(15,42,64,0.10) 0, rgba(15,42,64,0.10) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: multiply; pointer-events: none;
}
.pdx-reload-hint__info { width: 18px; height: 18px; flex: 0 0 auto; color: var(--pdx-lens-deep); display: inline-flex; align-items: center; justify-content: center; position: relative; z-index: 2; }
.pdx-reload-hint__info iconify-icon, .pdx-reload-hint__info svg { font-size: 12px; }
.pdx-reload-hint__msg { flex: 1; font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink); text-transform: uppercase; position: relative; z-index: 2; line-height: 1.4; }
.pdx-reload-hint__btn {
  padding: 3px 8px; background: var(--pdx-key); border: 1px solid var(--pdx-key-2); border-bottom-width: 2px;
  border-radius: 3px; color: var(--pdx-on-key); font-family: var(--pdx-font-pixel); font-size: 8px;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7); flex: 0 0 auto; position: relative; z-index: 2;
}
.pdx-reload-hint__close { width: 18px; height: 18px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 0; padding: 0; cursor: pointer; color: var(--pdx-lcd-ink-2); position: relative; z-index: 2; }
.pdx-reload-hint__close iconify-icon, .pdx-reload-hint__close svg { font-size: 10px; }

/* ===== Custom-word modal (absolute over popup interior) = */
.pdx-modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(15, 8, 25, 0.55);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  z-index: 30; border: 0; padding: 0; cursor: pointer;
}
.pdx-modal {
  position: absolute; left: 18px; right: 18px; top: 50%; transform: translateY(-50%); z-index: 31;
  background: linear-gradient(180deg, var(--pdx-shell-hi) 0%, var(--pdx-shell) 30%, var(--pdx-shell-2) 100%);
  border: 1px solid var(--pdx-shell-deep); border-radius: 8px;
  box-shadow: inset 0 1px 0 var(--pdx-shell-edge), 0 14px 30px rgba(0,0,0,0.6);
  padding: 10px;
}
.pdx-modal__header { display: flex; align-items: center; gap: 8px; padding: 4px 4px 8px; }
.pdx-modal__title { flex: 1; font-family: var(--pdx-font-pixel); font-size: 10px; letter-spacing: 0.06em; color: var(--pdx-on-shell); text-transform: uppercase; text-shadow: 0 1px 0 rgba(0,0,0,0.25); }
.pdx-modal__close {
  width: 22px; height: 22px; flex: 0 0 auto; background: var(--pdx-key); border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px; border-radius: 3px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  color: var(--pdx-on-key); cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;
}
.pdx-modal__close iconify-icon, .pdx-modal__close svg { font-size: 11px; }
.pdx-modal__lcd {
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 40%, var(--pdx-lcd-lo) 100%);
  border: 1px solid var(--pdx-lcd-frame); border-radius: 4px; padding: 12px 12px 14px;
  box-shadow: inset 0 2px 4px rgba(15,42,64,0.35), inset 0 -1px 0 rgba(255,255,255,0.2);
  position: relative; overflow: hidden; color: var(--pdx-lcd-ink);
}
.pdx-modal__lcd::after {
  content: ""; position: absolute; inset: 0;
  background-image: repeating-linear-gradient(0deg, rgba(15,42,64,0.1) 0, rgba(15,42,64,0.1) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: multiply; pointer-events: none;
}
.pdx-modal__lcd-inner { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 10px; }
.pdx-modal__prompt { font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; color: var(--pdx-lcd-ink); text-transform: uppercase; line-height: 1.4; }
.pdx-modal__input-wrap { display: flex; align-items: stretch; background: var(--pdx-lcd-frame); border: 1px solid var(--pdx-lcd-frame); border-radius: 4px; padding: 2px; }
.pdx-modal__input {
  flex: 1; min-width: 0; background: rgba(255,255,255,0.85); border: 0; padding: 0 8px; height: 28px;
  font-family: var(--pdx-font-lcd); font-size: 18px; line-height: 1; color: var(--pdx-lcd-ink); border-radius: 2px; outline: none;
}
.pdx-modal__input::placeholder { color: var(--pdx-lcd-ink-2); }
.pdx-modal__helper { font-family: var(--pdx-font-ui); font-size: 11px; color: var(--pdx-lcd-ink-2); line-height: 1.4; }
.pdx-modal__error { font-family: var(--pdx-font-pixel); font-size: 7px; letter-spacing: 0.06em; color: var(--pdx-shell-deep); text-transform: uppercase; line-height: 1.4; }
.pdx-modal__footer { display: flex; gap: 6px; justify-content: flex-end; padding: 8px 4px 4px; }
.pdx-modal__btn-ghost { padding: 6px 10px; background: transparent; border: 1px solid rgba(255,255,255,0.45); color: var(--pdx-on-shell); font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 3px; cursor: pointer; }
.pdx-modal__btn-primary {
  padding: 6px 12px; background: linear-gradient(180deg, #FFE9B0 0%, var(--pdx-led-yellow) 100%);
  border: 1px solid #B89E50; border-bottom-width: 2px; color: #3A1208;
  font-family: var(--pdx-font-pixel); font-size: 8px; letter-spacing: 0.06em; text-transform: uppercase;
  border-radius: 3px; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 0 8px rgba(255,210,63,0.45);
}
.pdx-modal__btn-primary[disabled] { opacity: 0.45; cursor: not-allowed; }
```

> Note: the design adds a `.pdx-modal-stack { position: relative }` class to `.pdx-popup`, but `.pdx-popup` is already `position: relative` in the shell stylesheet, so the backdrop's `inset:0` already resolves against the device. The `.pdx-modal-stack` rule is therefore unnecessary and omitted.

- [ ] **Step 2: Build + Slate guard + lint**

```bash
pnpm build                                                              # succeeds
git diff --stat src/popup/styles/popup.css src/shared/styles/tokens.css # empty
pnpm biome check src/popup/styles/popup.pdx.css                         # clean
```

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(theme): add Pokedex modal + reload-hint CSS to popup.pdx.css

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Add Pokédex modal/reload i18n keys

Most copy is reused (CSS uppercases it): `custom_word_heading` → "CUSTOM WORD", `custom_word_cancel` → "CANCEL", `reload_hint_reload` → "RELOAD", plus existing arias/titles/placeholder. New keys only where copy genuinely differs.

**Files:**
- Modify: `src/i18n/messages/en.ts` (and `de.ts`/`uk.ts`/`ja.ts` — they are `Record<MessageKey,string>`, so add the same keys as EN-fallback stubs with a `— EN fallback` comment, consistent with Phase 2b)
- Test: `tests/i18n/pdx-modal-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/i18n/pdx-modal-keys.test.ts
import { en } from "../../src/i18n/messages/en";

describe("Pokédex modal/reload copy keys", () => {
  it("defines the modal + reload-hint pokedex strings", () => {
    expect(en.pdx_reload_hint_text).toBe("Reload to hunt");
    expect(en.pdx_custom_word_prompt).toBe("Enter your own word to hunt");
    expect(en.pdx_custom_word_helper).toBe("no spaces · 2-25 letters · won't appear in your collection");
    expect(en.pdx_custom_word_submit).toBe("Start");
  });
});
```
(The `·` is U+00B7 MIDDLE DOT; the `'` in "won't" is a straight apostrophe U+0027.)

- [ ] **Step 2: Run, verify fail**

Run: `pnpm jest tests/i18n/pdx-modal-keys.test.ts` → FAIL (keys missing).

- [ ] **Step 3: Add keys** to `en.ts` (after the Phase 2b `pdx_*` block):

```ts
  pdx_reload_hint_text: "Reload to hunt",
  pdx_custom_word_prompt: "Enter your own word to hunt",
  pdx_custom_word_helper: "no spaces · 2-25 letters · won't appear in your collection",
  pdx_custom_word_submit: "Start",
```

Then add the identical four lines to `de.ts`, `uk.ts`, `ja.ts` (under their existing `— EN fallback` pokedex section) so `Record<MessageKey,string>` stays complete.

- [ ] **Step 4: Run, verify pass + typecheck + lint**

```bash
pnpm jest tests/i18n/pdx-modal-keys.test.ts   # PASS
pnpm tsc --noEmit                             # clean
pnpm biome check src/i18n/messages            # clean
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/messages tests/i18n/pdx-modal-keys.test.ts
git commit -m "feat(theme): add Pokedex modal + reload-hint copy keys

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `ReloadHint.pdx.tsx`

LCD inline notice with a cyan info glyph, "RELOAD TO HUNT" pixel message, a cream RELOAD key, and a close key. Same props as Slate `ReloadHint`: `{ onReload: () => void; onDismiss: () => void }`.

**Files:**
- Create: `src/popup/play/ReloadHint.pdx.tsx`
- Test: `tests/popup/play/reload-hint-pdx.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/play/reload-hint-pdx.test.tsx
import { render } from "@testing-library/preact";
import { ReloadHintPdx } from "../../../src/popup/play/ReloadHint.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderHint(onReload = () => {}, onDismiss = () => {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ReloadHintPdx onReload={onReload} onDismiss={onDismiss} />
    </ThemeContext.Provider>
  );
}

describe("ReloadHintPdx", () => {
  it("renders the LCD notice with the RELOAD TO HUNT message", () => {
    const { container, getByText } = renderHint();
    expect(container.querySelector(".pdx-reload-hint")).not.toBeNull();
    expect(container.querySelector(".pdx-reload-hint__info")).not.toBeNull();
    expect(getByText("Reload to hunt")).toBeInTheDocument();
  });

  it("fires onReload and onDismiss", () => {
    const onReload = jest.fn();
    const onDismiss = jest.fn();
    const { container } = renderHint(onReload, onDismiss);
    container.querySelector<HTMLButtonElement>(".pdx-reload-hint__btn")?.click();
    container.querySelector<HTMLButtonElement>(".pdx-reload-hint__close")?.click();
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run, verify fail** — `pnpm jest tests/popup/play/reload-hint-pdx.test.tsx` (module not found).

- [ ] **Step 3: Implement**

```tsx
// src/popup/play/ReloadHint.pdx.tsx
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ReloadHintProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function ReloadHintPdx({ onReload, onDismiss }: ReloadHintProps): JSX.Element {
  const t = useT();
  return (
    <div class="pdx-reload-hint">
      <span class="pdx-reload-hint__info" title={t("reload_hint_info_title")}>
        <Icon name="info" size={12} />
      </span>
      <span class="pdx-reload-hint__msg">{t("pdx_reload_hint_text")}</span>
      <button type="button" class="pdx-reload-hint__btn" onClick={onReload}>
        {t("reload_hint_reload")}
      </button>
      <button
        type="button"
        class="pdx-reload-hint__close"
        aria-label={t("reload_hint_dismiss_aria")}
        onClick={onDismiss}
      >
        <Icon name="x" size={10} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify pass** — expect 2/2.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/play/ReloadHint.pdx.tsx tests/popup/play/reload-hint-pdx.test.tsx
git add src/popup/play/ReloadHint.pdx.tsx tests/popup/play/reload-hint-pdx.test.tsx
git commit -m "feat(theme): add ReloadHint.pdx (LCD notice, RELOAD TO HUNT)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: `CustomWordModal.pdx.tsx`

Raspberry-shell modal floating over the popup interior with a blur backdrop. Duplicates the Slate modal's behaviour — focus on open, focus trap (Tab/Shift-Tab cycling), Escape to close, `validateCustomWord` with error display — but renders the Pokédex DOM (LCD inner panel, cream input, ghost CANCEL + yellow START). Same props: `{ open: boolean; onClose: () => void; onSubmit: (word: string) => void }`. Returns `null` when closed.

**Files:**
- Create: `src/popup/play/CustomWordModal.pdx.tsx`
- Test: `tests/popup/play/custom-word-modal-pdx.test.tsx`

> **Before implementing:** re-read `src/popup/play/CustomWordModal.tsx` and reproduce its hook logic VERBATIM (the `useEffect` reset, the focus + keydown effect with the focus trap and Escape, the `trimmed`/`error`/`showError`/`counter`/`handleSubmit` derivations). Only the returned markup and the raw `<input>` (instead of the `Input` component) differ. Keep `MAX_CUSTOM_LEN`/`validateCustomWord` imports from `../../shared/word-validation`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/popup/play/custom-word-modal-pdx.test.tsx
import { fireEvent, render } from "@testing-library/preact";
import { CustomWordModalPdx } from "../../../src/popup/play/CustomWordModal.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderModal(props: Partial<Parameters<typeof CustomWordModalPdx>[0]> = {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <CustomWordModalPdx
        open={props.open ?? true}
        onClose={props.onClose ?? (() => {})}
        onSubmit={props.onSubmit ?? (() => {})}
      />
    </ThemeContext.Provider>
  );
}

describe("CustomWordModalPdx", () => {
  it("renders nothing when closed", () => {
    const { container } = renderModal({ open: false });
    expect(container.querySelector(".pdx-modal")).toBeNull();
  });

  it("renders the raspberry modal + LCD input + footer buttons when open", () => {
    const { container, getByText } = renderModal();
    expect(container.querySelector(".pdx-modal-backdrop")).not.toBeNull();
    expect(container.querySelector(".pdx-modal")).not.toBeNull();
    expect(container.querySelector(".pdx-modal__input")).not.toBeNull();
    expect(getByText("Enter your own word to hunt")).toBeInTheDocument();
    expect(getByText("Start")).toBeInTheDocument();
  });

  it("submits a valid trimmed word", () => {
    const onSubmit = jest.fn();
    const { container, getByText } = renderModal({ onSubmit });
    const input = container.querySelector<HTMLInputElement>(".pdx-modal__input");
    if (input) {
      fireEvent.input(input, { target: { value: "serendipity" } });
    }
    getByText("Start").click();
    expect(onSubmit).toHaveBeenCalledWith("serendipity");
  });

  it("shows an error and does not submit an invalid word", () => {
    const onSubmit = jest.fn();
    const { container, getByText } = renderModal({ onSubmit });
    const input = container.querySelector<HTMLInputElement>(".pdx-modal__input");
    if (input) {
      fireEvent.input(input, { target: { value: "ab12!" } });
    }
    getByText("Start").click();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector(".pdx-modal__error")).not.toBeNull();
  });

  it("closes on Escape and on backdrop click", () => {
    const onClose = jest.fn();
    const { container } = renderModal({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    container.querySelector<HTMLButtonElement>(".pdx-modal-backdrop")?.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run, verify fail** — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/popup/play/CustomWordModal.pdx.tsx
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useT } from "../../i18n";
import { MAX_CUSTOM_LEN, validateCustomWord } from "../../shared/word-validation";
import { Icon } from "../components/Icon";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CustomWordModalPdx({
  open,
  onClose,
  onSubmit,
}: CustomWordModalProps): JSX.Element | null {
  const t = useT();
  const [value, setValue] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setSubmitAttempted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 0);

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = value.trim();
  const error = validateCustomWord(trimmed);
  const showError = submitAttempted && error !== undefined && trimmed.length > 0;

  function handleSubmit(): void {
    if (!trimmed || error) {
      setSubmitAttempted(true);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <>
      <button
        type="button"
        class="pdx-modal-backdrop"
        onClick={onClose}
        aria-label={t("custom_word_backdrop_aria")}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        class="pdx-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("custom_word_dialog_aria")}
        ref={dialogRef}
      >
        <div class="pdx-modal__header">
          <span class="pdx-modal__title">{t("custom_word_heading")}</span>
          <button
            type="button"
            class="pdx-modal__close"
            aria-label={t("custom_word_close_aria")}
            title={t("custom_word_close_title")}
            onClick={onClose}
          >
            <Icon name="x" size={11} />
          </button>
        </div>

        <div class="pdx-modal__lcd">
          <div class="pdx-modal__lcd-inner">
            <span class="pdx-modal__prompt">{t("pdx_custom_word_prompt")}</span>
            <div class="pdx-modal__input-wrap">
              <input
                ref={inputRef}
                class="pdx-modal__input"
                type="text"
                value={value}
                maxLength={MAX_CUSTOM_LEN}
                placeholder={t("custom_word_placeholder")}
                onInput={(e) => setValue((e.target as HTMLInputElement).value)}
              />
            </div>
            {showError ? (
              <span class="pdx-modal__error">{error}</span>
            ) : (
              <span class="pdx-modal__helper">{t("pdx_custom_word_helper")}</span>
            )}
          </div>
        </div>

        <div class="pdx-modal__footer">
          <button type="button" class="pdx-modal__btn-ghost" onClick={onClose}>
            {t("custom_word_cancel")}
          </button>
          <button type="button" class="pdx-modal__btn-primary" onClick={handleSubmit}>
            {t("pdx_custom_word_submit")}
          </button>
        </div>
      </div>
    </>
  );
}
```

> Confirm `validateCustomWord("ab12!")` returns a non-undefined error (it does — the `!` fails `VALID_CUSTOM_RE`). If biome complains about the raw `<input>` onInput typing, mirror the cast pattern used elsewhere in the repo.

- [ ] **Step 4: Run, verify pass** — expect 5/5.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
pnpm tsc --noEmit && pnpm biome check src/popup/play/CustomWordModal.pdx.tsx tests/popup/play/custom-word-modal-pdx.test.tsx
git add src/popup/play/CustomWordModal.pdx.tsx tests/popup/play/custom-word-modal-pdx.test.tsx
git commit -m "feat(theme): add CustomWordModal.pdx (raspberry shell, LCD input)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Wire the pdx siblings into `PlayTab.pdx` (drop the `.wh` bridge)

Replace the temporary Slate fallbacks with the new siblings. `ReloadHintPdx` renders as the FIRST child of `.pdx-popup__body-inner` (the design places it between header and ActiveWordCard). `CustomWordModalPdx` renders as a sibling at the end of the fragment (inside `.pdx-popup`, so its `absolute` backdrop covers the device).

**Files:**
- Modify: `src/popup/tabs/PlayTab.pdx.tsx`
- Modify: `tests/popup/tabs/play-tab-pdx.test.tsx`

- [ ] **Step 1: Update `PlayTab.pdx.tsx`**

1. Swap imports:
   - remove `import { CustomWordModal } from "../play/CustomWordModal";` and `import { ReloadHint } from "../play/ReloadHint";`
   - add `import { CustomWordModalPdx } from "../play/CustomWordModal.pdx";` and `import { ReloadHintPdx } from "../play/ReloadHint.pdx";`
2. Add the reload hint as the first child inside `.pdx-popup__body-inner`, before `<ActiveWordCardPdx … />`:
```tsx
        <div class="pdx-popup__body-inner">
          {showReloadBanner && activeWord && (
            <ReloadHintPdx onReload={handleReload} onDismiss={() => setShowReloadBanner(false)} />
          )}
          <ActiveWordCardPdx activeWord={activeWord} onClear={clear} />
```
3. Replace the entire `.wh` bridge block (the `<div class="wh"> … </div>` with the TODO comment) with the modal as a direct fragment child:
```tsx
      <CustomWordModalPdx
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
      />
```
   (It sits after `<BottomActionBarPdx … />`, still inside the top-level `<>…</>` fragment.)

- [ ] **Step 2: Update `tests/popup/tabs/play-tab-pdx.test.tsx`**

Add assertions that the pdx siblings are wired (and the `.wh` bridge is gone). Append this test inside the existing `describe`:
```tsx
  it("uses the Pokédex modal + reload-hint siblings, not the .wh bridge", async () => {
    setupChromeMock({ activeWord: { word: "fox", list: "animals", insertedAt: 0 }, settings: { ...{}, showReloadHint: true } });
    const { container } = renderPlay();
    await act(async () => {});
    // no slate bridge
    expect(container.querySelector(".wh")).toBeNull();
    // modal closed by default → not rendered
    expect(container.querySelector(".pdx-modal")).toBeNull();
  });
```
> Adjust the `setupChromeMock` shape to match the existing test's helper (reuse whatever DEFAULT_SETTINGS spread it already uses; the key assertions are `.wh` absent and `.pdx-modal` absent while closed). If the existing test file already asserts structure, just add the `.wh`-absent check rather than duplicating setup.

- [ ] **Step 3: Run the Play-tab tests**

Run: `pnpm jest tests/popup/tabs/play-tab-pdx.test.tsx tests/popup/app-play-pdx.test.tsx` → PASS.

- [ ] **Step 4: Full verification**

```bash
pnpm test            # all suites pass
pnpm tsc --noEmit    # clean
pnpm build           # succeeds
git diff --stat 7981218 -- src/popup/styles/popup.css src/shared/styles/tokens.css   # empty (Slate untouched)
```

- [ ] **Step 5: Commit**

```bash
git add src/popup/tabs/PlayTab.pdx.tsx tests/popup/tabs/play-tab-pdx.test.tsx
git commit -m "feat(theme): wire ReloadHint.pdx + CustomWordModal.pdx into PlayTab.pdx

Drops the temporary Slate .wh bridge now that the pokedex siblings exist.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:** CustomWordModal (state 4) → Tasks 1,2,4,5 ✓. ReloadHint (in-page-overlays popup-internal) → Tasks 1,2,3,5 ✓. Play surface is now fully forked.

**Behaviour preserved:** modal focus trap / Escape / validation / submit logic copied verbatim from Slate; reload/dismiss handlers unchanged. Only DOM + copy differ.

**Copy accuracy:** helper states the real **2-25** range (validation), not the preview's incorrect "3-30".

**Placeholder scan:** all code complete; CSS mirrored from preview; i18n values concrete.

**Type consistency:** prop shapes match the Slate originals (`ReloadHintProps`, `CustomWordModalProps`). `MAX_CUSTOM_LEN`/`validateCustomWord` reused. Exports use the `…Pdx` suffix.

**Open risk for review:** the modal renders `position: absolute` against `.pdx-popup` — confirm at smoke-test that the backdrop covers header+tabs+action-bar (it should, since `.pdx-popup` is the relative ancestor). If a future change makes a closer ancestor positioned, the backdrop would clip — note for Phase 6 smoke test.
