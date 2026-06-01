# Pokédex Theme — Phase 3b (Settings + form controls) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the Settings tab into a Pokédex sibling (`SettingsTab.pdx.tsx`) plus three reusable Pokédex form controls (`Switch.pdx`, `NumberStepper.pdx`, `RangeSlider.pdx`), wired into `App.tsx` so the pokedex skin routes the Settings tab to its own surface — without touching Slate.

**Architecture:** Parallel skins (ADR 007). Each control is a new `.pdx.tsx` file that renders the kit's `.pdx-*-mini` markup and reuses the existing `GameSettings` data model + `useStorage`. `SettingsTab.pdx` duplicates the Slate SettingsTab's hooks/dirty-tracking logic verbatim (same draft/saved/isDirty pattern) but renders `.settings-field` rows + a sibling `.pdx-popup__footer`. The THEME field is intentionally **out of scope** here (Phase 5). Notification toggles ARE included (data parity with Slate). New CSS is appended to `src/popup/styles/popup.pdx.css`; Slate's `popup.css`/`tokens.css` stay byte-identical.

**Tech Stack:** Preact + TypeScript, Jest + @testing-library/preact, CSS custom properties scoped under `.pdx`.

---

## Context for the implementer (read before starting)

- **Slate source of truth:** `src/popup/tabs/SettingsTab.tsx` (the full settings logic: `draft`/`saved` via `useStorage("settings", DEFAULT_SETTINGS)`, `savedLocale`/`draftLocale` via `useStorage("locale", "en")`, `isDirty`, `update`, `handleSave`, `handleCancel`). Copy this logic verbatim into `SettingsTab.pdx.tsx`; only the JSX presentation changes.
- **Slate NumberInput math:** `src/popup/components/NumberInput.tsx` — `decimalPlaces`, `roundToStep`, clamp-on-min/max increment/decrement. `NumberStepper.pdx` reuses the same math (duplicate the two tiny helpers; do NOT export from NumberInput — keep Slate untouched).
- **Design markup:** `design-system/preview/pokedex/screens-tabs.html` (Settings section ~lines 917–1183) and kit CSS `design-system/ui_kits/extension-popup-pokedex/popup.css` (`.pdx-switch-mini`, `.pdx-stepper-mini`, `.pdx-range-mini`, `.settings-field` ~lines 282–306 and the preview's inlined copies ~lines 361–517).
- **Sibling-overlay pattern (already established):** `SettingsTab.pdx` returns a fragment `<>…</>`: `.pdx-popup__body > .pdx-popup__body-inner` first, then `{isDirty && <div class="pdx-popup__footer">…</div>}` as a SIBLING (the footer is a flex child of `.pdx-popup`, `flex: 0 0 auto`). Mirror `StatsTab.pdx.tsx`.
- **Already in `popup.pdx.css` (do NOT re-add):** `.pdx-popup__footer`, `.pdx-popup__footer-msg` (has `text-transform: uppercase`), `.pdx-btn-ghost`, `.pdx-btn-primary`, `.pdx-section-eyebrow` + `.pdx-section-eyebrow__title`.
- **Decorative device labels stay hardcoded:** the `OFF`/`ON` printed on `.pdx-switch-mini__labels` are 5px device-chrome prints (same category as the hardcoded `WORD HUNTER` wordmark), NOT state — keep them as literal `"OFF"`/`"ON"`. The localized On/Off state text (`settings_switch_on`/`_off`) is NOT shown in this compact switch.
- **i18n:** every key already exists EXCEPT one new key `pdx_unsaved_edits` (Task 3b.1). All four locale files (`en`/`de`/`uk`/`ja`) are `Record<MessageKey, string>` — a missing key fails typecheck, so add to all four.
- **Test infra:** tests live under `tests/popup/...`; render with `@testing-library/preact`. Pokédex leaves read theme via `ThemeContext` but these controls don't branch on theme internally (they're already pokedex-only files), so no provider needed unless the component calls `useT()` — `useT()` works without a provider (defaults to `en`).
- **After each task:** `pnpm test` (or the specific suite) green, `pnpm typecheck`, then verify Slate untouched: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css src/popup/tabs/SettingsTab.tsx src/popup/components/NumberInput.tsx` must be EMPTY. Commit per task. The PostToolUse hook runs `biome check --write`; if biome reformats, re-stage before committing.

---

### Task 3b.1: Add `pdx_unsaved_edits` i18n key

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Modify: `src/i18n/messages/de.ts`
- Modify: `src/i18n/messages/uk.ts`
- Modify: `src/i18n/messages/ja.ts`
- Test: `tests/i18n/messages.test.ts` (if a key-parity test exists it will now pass with the new key in all four; otherwise no new test needed)

- [ ] **Step 1: Add the EN key** in `src/i18n/messages/en.ts`, near the other `settings_*` keys (after `settings_save`):

```ts
  pdx_unsaved_edits: "Unsaved edits",
```

- [ ] **Step 2: Add the same key (EN-fallback stub) to de/uk/ja** — append to each file's object:

```ts
  pdx_unsaved_edits: "Unsaved edits",
```

(Per-locale translation happens per-milestone, not per-feature; EN stub is correct for now.)

- [ ] **Step 3: Verify typecheck passes** (proves all four `Record<MessageKey,string>` are complete):

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Run the i18n suite**

Run: `pnpm test tests/i18n`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/de.ts src/i18n/messages/uk.ts src/i18n/messages/ja.ts
git commit -m "feat(i18n): add pdx_unsaved_edits key for Pokédex settings footer"
```

---

### Task 3b.2: Append Settings + form-control CSS to `popup.pdx.css`

**Files:**
- Modify: `src/popup/styles/popup.pdx.css` (append at end)

No test (pure CSS). Copy the kit rules verbatim, then add the two range-input overlay rules that make `.pdx-range-mini` operable.

- [ ] **Step 1: Append the Settings field + controls CSS** to the END of `src/popup/styles/popup.pdx.css`:

```css
/* =========================================================
   SETTINGS TAB (Phase 3b)
   ========================================================= */
.settings-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 8px;
  border-bottom: 1px dashed rgba(15, 42, 64, 0.28);
}
.settings-field:last-of-type {
  border-bottom: 0;
}
.settings-field__label {
  font-family: var(--pdx-font-pixel);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--pdx-lcd-ink);
  text-transform: uppercase;
}
.settings-field__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-field__helper {
  font-family: var(--pdx-font-ui);
  font-size: 10.5px;
  color: var(--pdx-lcd-ink-2);
  line-height: 1.4;
}

/* --- Switch (compact, dark navy track on LCD context) --- */
.pdx-switch-mini {
  --w: 48px;
  --h: 22px;
  --pad: 2px;
  --cap-w: 20px;
  position: relative;
  width: var(--w);
  height: var(--h);
  flex: 0 0 auto;
  background: linear-gradient(180deg, var(--pdx-lcd-frame) 0%, #0a1426 100%);
  border-radius: 3px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border: 0;
  padding: 0;
}
.pdx-switch-mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pdx-switch-mini.is-on {
  background: linear-gradient(180deg, #1f5c9e 0%, #0e3a66 100%);
}
.pdx-switch-mini__cap {
  box-sizing: border-box;
  position: absolute;
  top: var(--pad);
  left: var(--pad);
  width: var(--cap-w);
  height: calc(var(--h) - var(--pad) * 2);
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition: transform var(--pdx-dur-base) var(--pdx-ease-pop);
}
.pdx-switch-mini__cap::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 6px;
  background-image: repeating-linear-gradient(
    0deg,
    var(--pdx-key-2) 0,
    var(--pdx-key-2) 1px,
    transparent 1px,
    transparent 3px
  );
}
.pdx-switch-mini.is-on .pdx-switch-mini__cap {
  transform: translateX(calc(var(--w) - var(--cap-w) - var(--pad) * 2));
}
.pdx-switch-mini__labels {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  pointer-events: none;
}
.pdx-switch-mini__labels span {
  font-family: var(--pdx-font-pixel);
  font-size: 5px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
}

/* --- Mini stepper (compact, keys-only LCD) --- */
.pdx-stepper-mini {
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  height: 28px;
  background: var(--pdx-lcd-frame);
  border-radius: 4px;
  padding: 2px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35);
}
.pdx-stepper-mini__key {
  flex: 0 0 24px;
  background: var(--pdx-key);
  border: 1px solid var(--pdx-key-2);
  border-bottom-width: 2px;
  border-radius: 2px;
  color: var(--pdx-on-key);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.pdx-stepper-mini__key svg {
  font-size: 11px;
}
.pdx-stepper-mini__lcd {
  flex: 0 0 72px;
  margin: 0 2px;
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 100%);
  border-radius: 2px;
  padding: 0 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}
.pdx-stepper-mini__value {
  display: block;
  font-family: var(--pdx-font-lcd);
  font-size: 18px;
  line-height: 1;
  color: var(--pdx-lcd-ink);
}
.pdx-stepper-mini__unit {
  display: block;
  font-family: var(--pdx-font-pixel);
  font-size: 5px;
  letter-spacing: 0.08em;
  color: var(--pdx-lcd-frame-2);
  text-transform: uppercase;
  margin-top: 1px;
}

/* --- Mini range slider --- */
.pdx-range-mini {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.pdx-range-mini__strip {
  position: relative;
  flex: 1;
  height: 18px;
  padding: 2px;
  background: var(--pdx-lcd-frame);
  border-radius: 3px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}
/* operable native range overlaid transparently on the cell strip */
.pdx-range-mini__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}
.pdx-range-mini__cell {
  background: rgba(58, 138, 166, 0.35);
  border-radius: 1px;
}
.pdx-range-mini__cell.is-filled {
  background: linear-gradient(180deg, #94ddec 0%, #6fc8dc 100%);
}
.pdx-range-mini__cell.is-head {
  background: linear-gradient(180deg, #ffe9b0 0%, var(--pdx-led-yellow) 100%);
  box-shadow: 0 0 5px rgba(255, 210, 63, 0.65);
}
.pdx-range-mini__chip {
  flex: 0 0 auto;
  min-width: 40px;
  padding: 2px 6px 3px;
  background: linear-gradient(180deg, var(--pdx-lcd-hi) 0%, var(--pdx-lcd) 100%);
  border: 1px solid var(--pdx-lcd-frame);
  border-radius: 2px;
  text-align: center;
  font-family: var(--pdx-font-lcd);
  font-size: 16px;
  line-height: 1;
  color: var(--pdx-lcd-ink);
}
```

- [ ] **Step 2: Verify Slate CSS untouched + build still parses the stylesheet**

Run: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css`
Expected: empty (no Slate change).

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/popup/styles/popup.pdx.css
git commit -m "feat(pokedex): add Settings field + switch/stepper/range CSS"
```

---

### Task 3b.3: `Switch.pdx` component

**Files:**
- Create: `src/popup/components/Switch.pdx.tsx`
- Test: `tests/popup/components/switch-pdx.test.tsx`

- [ ] **Step 1: Write the failing test** in `tests/popup/components/switch-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { SwitchPdx } from "../../../src/popup/components/Switch.pdx";

describe("SwitchPdx", () => {
  it("reflects the checked state via aria-checked and is-on class", () => {
    const { container, rerender } = render(
      <SwitchPdx checked={false} ariaLabel="Reload hint" onChange={() => {}} />,
    );
    const btn = container.querySelector("button");
    expect(btn).toHaveAttribute("role", "switch");
    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn?.className).not.toContain("is-on");

    rerender(<SwitchPdx checked={true} ariaLabel="Reload hint" onChange={() => {}} />);
    const onBtn = container.querySelector("button");
    expect(onBtn).toHaveAttribute("aria-checked", "true");
    expect(onBtn?.className).toContain("is-on");
  });

  it("calls onChange with the toggled value on click", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <SwitchPdx checked={false} ariaLabel="Reload hint" onChange={onChange} />,
    );
    fireEvent.click(getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not fire onChange when disabled", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <SwitchPdx checked={false} ariaLabel="x" disabled onChange={onChange} />,
    );
    fireEvent.click(getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole("switch")).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/popup/components/switch-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/popup/components/Switch.pdx.tsx`:**

```tsx
import type { JSX } from "preact";

interface SwitchPdxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
}

export function SwitchPdx({
  checked,
  onChange,
  ariaLabel,
  title,
  disabled = false,
}: SwitchPdxProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      class={`pdx-switch-mini${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      {/* OFF/ON are decorative device-chrome prints (like the WORD HUNTER wordmark), not state */}
      <span class="pdx-switch-mini__labels">
        <span>OFF</span>
        <span>ON</span>
      </span>
      <span class="pdx-switch-mini__cap" />
    </button>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/popup/components/switch-pdx.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/popup/components/Switch.pdx.tsx tests/popup/components/switch-pdx.test.tsx
git commit -m "feat(pokedex): add Switch.pdx compact toggle control"
```

---

### Task 3b.4: `NumberStepper.pdx` component

**Files:**
- Create: `src/popup/components/NumberStepper.pdx.tsx`
- Test: `tests/popup/components/number-stepper-pdx.test.tsx`

Design note: keys-only LCD (no editable text input — matches the preview). Minus key LEFT, plus key RIGHT. Increment/decrement math copied from `NumberInput.tsx` (clamp at min/max, round to step's decimal places). Minus/plus glyphs are hardcoded inline pixel SVGs (parallel to Slate `NumberInput` hardcoding its chevrons).

- [ ] **Step 1: Write the failing test** in `tests/popup/components/number-stepper-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { NumberStepperPdx } from "../../../src/popup/components/NumberStepper.pdx";

describe("NumberStepperPdx", () => {
  it("renders the value and unit in the LCD", () => {
    const { container } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={() => {}} />,
    );
    expect(container.querySelector(".pdx-stepper-mini__value")?.textContent).toBe("3");
    expect(container.querySelector(".pdx-stepper-mini__unit")?.textContent).toBe("min");
  });

  it("increments by step on the plus key", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={onInput} />,
    );
    fireEvent.click(getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("4");
  });

  it("decrements by step on the minus key", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={onInput} />,
    );
    fireEvent.click(getByLabelText("Decrement"));
    expect(onInput).toHaveBeenCalledWith("2");
  });

  it("clamps at min (no call below min)", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="1" unit="min" min={1} step={1} onInput={onInput} />,
    );
    fireEvent.click(getByLabelText("Decrement"));
    expect(onInput).not.toHaveBeenCalled();
  });

  it("rounds to the step's decimal places (0.1 step)", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="1.5" unit="s" min={0.1} step={0.1} onInput={onInput} />,
    );
    fireEvent.click(getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("1.6");
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/popup/components/number-stepper-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/popup/components/NumberStepper.pdx.tsx`:**

```tsx
import type { JSX } from "preact";

interface NumberStepperPdxProps {
  value: string;
  onInput: (value: string) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

function decimalPlaces(n: number): number {
  const parts = n.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

function roundToStep(value: number, step: number): string {
  return value.toFixed(decimalPlaces(step));
}

const MINUS = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 11h16v2H4z" />
  </svg>
);

const PLUS = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
  </svg>
);

export function NumberStepperPdx({
  value,
  onInput,
  unit,
  min,
  max,
  step = 1,
}: NumberStepperPdxProps): JSX.Element {
  const current = parseFloat(value) || 0;

  const handleIncrement = (): void => {
    const next = current + step;
    if (max !== undefined && next > max) return;
    onInput(roundToStep(next, step));
  };

  const handleDecrement = (): void => {
    const next = current - step;
    if (min !== undefined && next < min) return;
    onInput(roundToStep(next, step));
  };

  return (
    <div class="pdx-stepper-mini">
      <button
        type="button"
        class="pdx-stepper-mini__key"
        aria-label="Decrement"
        tabIndex={-1}
        onClick={handleDecrement}
      >
        {MINUS}
      </button>
      <div class="pdx-stepper-mini__lcd" aria-live="polite">
        <span class="pdx-stepper-mini__value">{value}</span>
        <span class="pdx-stepper-mini__unit">{unit}</span>
      </div>
      <button
        type="button"
        class="pdx-stepper-mini__key"
        aria-label="Increment"
        tabIndex={-1}
        onClick={handleIncrement}
      >
        {PLUS}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/popup/components/number-stepper-pdx.test.tsx`
Expected: PASS (all 5).

- [ ] **Step 5: Commit**

```bash
git add src/popup/components/NumberStepper.pdx.tsx tests/popup/components/number-stepper-pdx.test.tsx
git commit -m "feat(pokedex): add NumberStepper.pdx LCD stepper control"
```

---

### Task 3b.5: `RangeSlider.pdx` component

**Files:**
- Create: `src/popup/components/RangeSlider.pdx.tsx`
- Test: `tests/popup/components/range-slider-pdx.test.tsx`

Design notes:
- **12 cells** (TRAP #4 — render exactly 12, never derive count from value). Head cell index = `Math.round((value - min) / (max - min) * 11)`, clamped to `[0, 11]`. Cells with index `< head` get `is-filled`; index `=== head` gets `is-head`; the rest plain.
- Interactivity + a11y come from a transparent native `<input type="range">` overlaid on the strip (CSS added in 3b.2). `onInput` emits a `number`.
- The chip shows the raw numeric value.

- [ ] **Step 1: Write the failing test** in `tests/popup/components/range-slider-pdx.test.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/preact";
import { RangeSliderPdx } from "../../../src/popup/components/RangeSlider.pdx";

describe("RangeSliderPdx", () => {
  it("always renders exactly 12 cells (trap #4)", () => {
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={() => {}} />,
    );
    expect(container.querySelectorAll(".pdx-range-mini__cell")).toHaveLength(12);
  });

  it("places the head cell per the value→cell ratio and fills before it", () => {
    // value 60: round((60-30)/120 * 11) = round(2.75) = 3
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={() => {}} />,
    );
    const cells = Array.from(container.querySelectorAll(".pdx-range-mini__cell"));
    expect(cells[3].className).toContain("is-head");
    expect(cells[2].className).toContain("is-filled");
    expect(cells[4].className).not.toContain("is-filled");
    expect(cells[4].className).not.toContain("is-head");
  });

  it("shows the raw value in the chip", () => {
    const { container } = render(
      <RangeSliderPdx value={100} min={30} max={150} step={10} onInput={() => {}} />,
    );
    expect(container.querySelector(".pdx-range-mini__chip")?.textContent).toBe("100");
  });

  it("emits a number from the native range input", () => {
    const onInput = jest.fn();
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={onInput} />,
    );
    const input = container.querySelector("input[type=range]") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "90" } });
    expect(onInput).toHaveBeenCalledWith(90);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/popup/components/range-slider-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/popup/components/RangeSlider.pdx.tsx`:**

```tsx
import type { JSX } from "preact";

interface RangeSliderPdxProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (value: number) => void;
  id?: string;
  ariaLabel?: string;
}

const CELL_COUNT = 12;

export function RangeSliderPdx({
  value,
  min,
  max,
  step,
  onInput,
  id,
  ariaLabel,
}: RangeSliderPdxProps): JSX.Element {
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const head = Math.min(CELL_COUNT - 1, Math.max(0, Math.round(ratio * (CELL_COUNT - 1))));

  return (
    <div class="pdx-range-mini">
      <div class="pdx-range-mini__strip">
        {Array.from({ length: CELL_COUNT }, (_, i) => {
          const state = i === head ? " is-head" : i < head ? " is-filled" : "";
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static cell grid
          return <div key={i} class={`pdx-range-mini__cell${state}`} />;
        })}
        <input
          id={id}
          type="range"
          class="pdx-range-mini__input"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
        />
      </div>
      <span class="pdx-range-mini__chip">{value}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/popup/components/range-slider-pdx.test.tsx`
Expected: PASS (all 4).

- [ ] **Step 5: Commit**

```bash
git add src/popup/components/RangeSlider.pdx.tsx tests/popup/components/range-slider-pdx.test.tsx
git commit -m "feat(pokedex): add RangeSlider.pdx 12-cell LCD range control"
```

---

### Task 3b.6: `SettingsTab.pdx` component

**Files:**
- Create: `src/popup/tabs/SettingsTab.pdx.tsx`
- Test: `tests/popup/tabs/settings-tab-pdx.test.tsx`

Behavior parity with Slate `SettingsTab`: same `useStorage` keys, same `isDirty`, same `handleSave`/`handleCancel`. Differences: pokedex markup (`.settings-field` rows + the three pdx controls), unit rendered INSIDE the stepper LCD (uppercased by CSS), notifications grouped under a `.pdx-section-eyebrow`, footer is a sibling `.pdx-popup__footer` shown only when dirty. **THEME field is NOT rendered here (Phase 5).** The language `<select>` keeps Slate's plain `<select>` styled by `.wh-select`? No — there is no `.pdx`-scoped select yet; the SearchableSelect/language picker is Phase 3c. For now render the language `<select>` with a minimal inline native select inside a `.settings-field` (functional, unstyled-but-usable) so locale switching still works. Use class `pdx-select` (no CSS yet — acceptable; 3c adds it).

- [ ] **Step 1: Write the failing test** in `tests/popup/tabs/settings-tab-pdx.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from "@testing-library/preact";
import { SettingsTabPdx } from "../../../src/popup/tabs/SettingsTab.pdx";

// Mirror the existing Slate SettingsTab test's storage mock.
// Check tests/popup/tabs/settings-tab.test.tsx for the exact useStorage/chrome mock
// pattern in this repo and reuse it verbatim here.

describe("SettingsTabPdx", () => {
  it("renders the settings fields and no footer when clean", async () => {
    const { container, queryByText } = render(<SettingsTabPdx />);
    await waitFor(() =>
      expect(container.querySelector(".pdx-popup__body")).toBeTruthy(),
    );
    // controls present
    expect(container.querySelector(".pdx-range-mini")).toBeTruthy();
    expect(container.querySelectorAll(".pdx-stepper-mini").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll(".pdx-switch-mini").length).toBeGreaterThanOrEqual(2);
    // clean → no footer
    expect(container.querySelector(".pdx-popup__footer")).toBeNull();
    // THEME field is Phase 5 — must NOT be present
    expect(queryByText("THEME")).toBeNull();
  });

  it("shows the unsaved-edits footer after a change and hides it after cancel", async () => {
    const { container, getAllByRole } = render(<SettingsTabPdx />);
    await waitFor(() => expect(container.querySelector(".pdx-popup__body")).toBeTruthy());

    // toggle the first switch to make the draft dirty
    fireEvent.click(getAllByRole("switch")[0]);
    await waitFor(() => expect(container.querySelector(".pdx-popup__footer")).toBeTruthy());

    // cancel reverts → footer disappears
    const cancel = container.querySelector(".pdx-btn-ghost") as HTMLButtonElement;
    fireEvent.click(cancel);
    await waitFor(() => expect(container.querySelector(".pdx-popup__footer")).toBeNull());
  });
});
```

> **Implementer:** open `tests/popup/tabs/settings-tab.test.tsx` first and copy this repo's exact `useStorage`/`chrome.storage` mock setup into the new test (the mock pattern is the source of truth — do not invent a new one). If the existing Slate test asserts default-clean rendering without special mocking, follow that.

- [ ] **Step 2: Run it to confirm it fails**

Run: `pnpm test tests/popup/tabs/settings-tab-pdx.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/popup/tabs/SettingsTab.pdx.tsx`** — copy the Slate logic verbatim, swap presentation:

```tsx
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { Locale } from "../../i18n/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { GameSettings } from "../../shared/types";
import { NumberStepperPdx } from "../components/NumberStepper.pdx";
import { RangeSliderPdx } from "../components/RangeSlider.pdx";
import { SwitchPdx } from "../components/Switch.pdx";
import { useStorage } from "../hooks/useStorage";

const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export function SettingsTabPdx(): JSX.Element {
  const t = useT();
  const [saved, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<GameSettings>(saved);
  const [savedLocale, setSavedLocale] = useStorage("locale", "en");
  const [draftLocale, setDraftLocale] = useState<Locale>(savedLocale);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  useEffect(() => {
    setDraftLocale(savedLocale);
  }, [savedLocale]);

  const isDirty =
    draft.hintDelayMinutes !== saved.hintDelayMinutes ||
    draft.celebrationHoverSeconds !== saved.celebrationHoverSeconds ||
    draft.minWordThreshold !== saved.minWordThreshold ||
    draft.showNextWordPreview !== saved.showNextWordPreview ||
    draft.showReloadHint !== saved.showReloadHint ||
    draft.notificationsEnabled !== saved.notificationsEnabled ||
    draft.showAutoModeToast !== saved.showAutoModeToast ||
    draft.showHintToast !== saved.showHintToast ||
    draft.showNoParagraphToast !== saved.showNoParagraphToast ||
    draftLocale !== savedLocale;

  const update = (patch: Partial<GameSettings>): void => {
    setDraft({ ...draft, ...patch });
  };

  const handleSave = (): void => {
    setSettings(draft);
    setSavedLocale(draftLocale);
  };

  const handleCancel = (): void => {
    setDraft(saved);
    setDraftLocale(savedLocale);
  };

  return (
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="pdx-section-eyebrow">
            <span class="pdx-section-eyebrow__title">{t("settings_language_label")}</span>
          </div>

          {/* LANGUAGE — pdx-styled select arrives in Phase 3c; native select keeps it functional */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_language_label")}</span>
            <div class="settings-field__row">
              <select
                class="pdx-select"
                value={draftLocale}
                onChange={(e) =>
                  setDraftLocale((e.target as HTMLSelectElement).value as Locale)
                }
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MIN PARAGRAPH */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_min_paragraph_label")}</span>
            <div class="settings-field__row">
              <RangeSliderPdx
                value={draft.minWordThreshold}
                min={30}
                max={150}
                step={10}
                ariaLabel={t("settings_min_paragraph_label")}
                onInput={(v) => update({ minWordThreshold: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_min_paragraph_helper")}</span>
          </div>

          {/* HINT DELAY */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_hint_delay_label")}</span>
            <div class="settings-field__row">
              <NumberStepperPdx
                value={String(draft.hintDelayMinutes)}
                unit={t("settings_hint_delay_unit")}
                min={1}
                step={1}
                onInput={(v) => update({ hintDelayMinutes: Number(v) })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_hint_delay_helper")}</span>
          </div>

          {/* CURSOR REVEAL */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_cursor_delay_label")}</span>
            <div class="settings-field__row">
              <NumberStepperPdx
                value={String(draft.celebrationHoverSeconds)}
                unit={t("settings_cursor_delay_unit")}
                min={0.1}
                step={0.1}
                onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_cursor_delay_helper")}</span>
          </div>

          {/* RELOAD HINT */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_reload_hint_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showReloadHint}
                ariaLabel={t("settings_reload_hint_label")}
                onChange={(v) => update({ showReloadHint: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_reload_hint_helper")}</span>
          </div>

          {/* NEXT WORD PREVIEW */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_next_word_preview_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showNextWordPreview}
                ariaLabel={t("settings_next_word_preview_label")}
                onChange={(v) => update({ showNextWordPreview: v })}
              />
            </div>
            <span class="settings-field__helper">
              {t("settings_next_word_preview_helper")}
            </span>
          </div>

          {/* NOTIFICATIONS group */}
          <div class="pdx-section-eyebrow">
            <span class="pdx-section-eyebrow__title">
              {t("settings_notifications_eyebrow")}
            </span>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_notifications_eyebrow")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.notificationsEnabled}
                ariaLabel={t("settings_notifications_aria")}
                title={t("settings_notifications_title")}
                onChange={(v) => update({ notificationsEnabled: v })}
              />
            </div>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_auto_continue_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showAutoModeToast}
                ariaLabel={t("settings_auto_continue_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showAutoModeToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_auto_continue_helper")}</span>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_hint_reminder_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showHintToast}
                ariaLabel={t("settings_hint_reminder_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showHintToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_hint_reminder_helper")}</span>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_no_paragraphs_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showNoParagraphToast}
                ariaLabel={t("settings_no_paragraphs_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showNoParagraphToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_no_paragraphs_helper")}</span>
          </div>
        </div>
      </div>

      {isDirty && (
        <div class="pdx-popup__footer">
          <span class="pdx-popup__footer-msg">{t("pdx_unsaved_edits")}</span>
          <button type="button" class="pdx-btn-ghost" onClick={handleCancel}>
            {t("settings_cancel")}
          </button>
          <button type="button" class="pdx-btn-primary" onClick={handleSave}>
            {t("settings_save")}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `pnpm test tests/popup/tabs/settings-tab-pdx.test.tsx`
Expected: PASS.

- [ ] **Step 5: Full suite + typecheck + Slate-untouched check**

Run: `pnpm test && pnpm typecheck`
Expected: green.

Run: `git diff --stat -- src/popup/styles/popup.css src/popup/styles/tokens.css src/popup/tabs/SettingsTab.tsx src/popup/components/NumberInput.tsx`
Expected: empty.

- [ ] **Step 6: Commit**

```bash
git add src/popup/tabs/SettingsTab.pdx.tsx tests/popup/tabs/settings-tab-pdx.test.tsx
git commit -m "feat(pokedex): add SettingsTab.pdx surface"
```

---

### Task 3b.7: Route the pokedex Settings tab to `SettingsTab.pdx`

**Files:**
- Modify: `src/popup/App.tsx`
- Test: `tests/popup/app-theme.test.tsx` (or wherever the App pokedex-routing test lives — check existing `tests/popup/` for the App routing/scope test added in P2a/P2b/P3a and extend it)

- [ ] **Step 1: Add the import** in `src/popup/App.tsx` (alphabetical with the other `.pdx` tab imports):

```tsx
import { SettingsTabPdx } from "./tabs/SettingsTab.pdx";
```

- [ ] **Step 2: Add the settings branch** in the pokedex body region — extend the existing ternary so settings routes to `SettingsTabPdx`:

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

(Rules still falls through to the generic well until Phase 3c.)

- [ ] **Step 3: Add/extend the App routing test** — assert that under `theme="pokedex"` with `active="settings"`, the rendered tree contains `.pdx-popup__body` from `SettingsTabPdx` and NOT the Slate `.wh-settings`. Follow the existing pokedex App-routing test pattern (the one that checks `PlayTabPdx`/`StatsTabPdx` rendering). Example assertion to add:

```tsx
// with theme mocked to "pokedex" and active tab = settings
expect(container.querySelector(".pdx-popup__body")).toBeTruthy();
expect(container.querySelector(".wh-settings")).toBeNull();
```

> **Implementer:** locate the existing pokedex App routing test first and mirror its theme-mock + tab-activation mechanism exactly. Do not introduce a new mocking approach.

- [ ] **Step 4: Run the App test + full suite**

Run: `pnpm test && pnpm typecheck`
Expected: green.

- [ ] **Step 5: Verify Slate App branch unchanged behaviorally + Slate files untouched**

Run: `git diff -- src/popup/App.tsx`
Expected: only the new import + the added `active === "settings" ? <SettingsTabPdx />` branch; the Slate `return` block unchanged.

- [ ] **Step 6: Build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/popup/App.tsx tests/popup/<app-routing-test>.tsx
git commit -m "feat(pokedex): route Settings tab to SettingsTab.pdx"
```

---

## Self-Review (controller, before dispatch)

- **Spec coverage:** Settings tab forked ✓ (3b.6); three form controls ✓ (3b.3/3b.4/3b.5); CSS ✓ (3b.2); footer reused from 3a ✓; THEME field correctly deferred to Phase 5 ✓; notifications parity ✓; App routing ✓ (3b.7).
- **Out of scope (deferred):** THEME picker (Phase 5); pdx-styled language `<select>` / SearchableSelect (Phase 3c — native `<select class="pdx-select">` is a functional placeholder); Rules tab (Phase 3c); reduced-motion/a11y polish (Phase 6).
- **Type consistency:** control prop names (`checked`/`onChange`/`ariaLabel` for Switch; `value`/`onInput`/`unit` for stepper; `value`/`min`/`max`/`step`/`onInput` for range) are used identically in 3b.6.
- **Trap check:** TRAP #4 (fixed 12-cell render) enforced + tested in 3b.5; box-sizing on `.pdx-switch-mini__cap` already `border-box` in the copied CSS (TRAP #5).
- **Slate guarantee:** every task ends with a `git diff --stat` on Slate files; `NumberInput.tsx`/`SettingsTab.tsx`/`popup.css`/`tokens.css` must stay empty in the diff.
