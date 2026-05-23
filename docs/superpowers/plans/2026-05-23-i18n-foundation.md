# i18n Foundation — Custom Module + English Popup Wiring

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom i18n module and wire all hardcoded strings in the popup to `t()` calls, with English as the baseline locale and a language selector in SettingsTab.

**Architecture:** A flat-key message object in `src/i18n/messages/en.ts` drives a `t(key, locale, params?)` function; `MessageKey` is `keyof typeof en`, so TypeScript enforces all call-sites at compile time. A Preact `LocaleProvider` wraps the App render tree and provides a bound `useT()` hook; its context default is a pre-bound English translator so no existing tests need a provider wrapper.

**Tech Stack:** Preact, TypeScript, `@testing-library/preact`, Jest, chrome.storage.local

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/i18n/types.ts` | `Locale` type, `MessageKey` derived type |
| Create | `src/i18n/messages/en.ts` | 88 flat English message keys (source of truth) |
| Create | `src/i18n/index.ts` | `t()`, `LocaleProvider`, `useT()`, `getLocale()` |
| Create | `_locales/en/messages.json` | CWS store listing strings (not UI) |
| Create | `tests/i18n/t.test.ts` | Unit tests for `t()` |
| Create | `tests/i18n/locale-provider.test.tsx` | Tests for `LocaleProvider` / `useT()` / `getLocale()` |
| Modify | `src/shared/storage.ts` | Add `locale: Locale` to `StorageSchema` |
| Modify | `manifest.json` | Add `"default_locale": "en"` |
| Modify | `src/popup/main.tsx` | Wrap `<App>` with `<LocaleProvider>` |
| Modify | `src/popup/tabs/SettingsTab.tsx` | Language `<select>`, `draftLocale`, all strings via `t()` |
| Modify | `src/popup/components/Tabs.tsx` | Tab labels via `t()` |
| Modify | `src/popup/components/PopupHeader.tsx` | `aria-label` via `t()` |
| Modify | `src/popup/components/BottomActionBar.tsx` | All strings via `t()` |
| Modify | `src/popup/play/ActiveWordCard.tsx` | All strings via `t()` |
| Modify | `src/popup/play/ReloadHint.tsx` | All strings via `t()` |
| Modify | `src/popup/play/ProgressRow.tsx` | All strings via `t()` |
| Modify | `src/popup/play/CustomWordModal.tsx` | All strings via `t()` |
| Modify | `src/popup/tabs/PlayTab.tsx` | Chip labels via `t()` |
| Modify | `src/popup/tabs/StatsTab.tsx` | All strings via `t()` |
| Modify | `src/popup/tabs/RulesTab.tsx` | All strings via `t()` |

---

### Task 1: i18n types + English messages

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/messages/en.ts`

No tests — pure type and data files.

- [ ] **Step 1: Create `src/i18n/types.ts`**

```typescript
import { en } from "./messages/en";

export type Locale = "en" | "uk" | "de" | "ja";
export type MessageKey = keyof typeof en;
```

- [ ] **Step 2: Create `src/i18n/messages/en.ts`**

```typescript
export const en = {
  // Header
  header_rules_aria: "Rules",

  // Tabs nav
  tab_play: "Play",
  tab_stats: "Statistics",
  tab_settings: "Settings",

  // Bottom action bar
  action_bar_auto_continue_title: "Auto-continue — pick next word after each find",
  action_bar_auto_continue_aria: "Auto-continue",
  action_bar_start: "Start a hunt",
  action_bar_shuffle_title: "Pick a random word",
  action_bar_shuffle_aria: "Pick a random word",
  action_bar_custom_title: "Custom word",
  action_bar_custom_aria: "Custom word",

  // Active word card
  active_word_empty_eyebrow: "No active word",
  active_word_empty_hint: "pick a word below to start the hunt.",
  active_word_eyebrow: "Active word",
  active_word_stop_title: "Stop hunt",
  active_word_stop_aria: "Clear active word",

  // Reload hint
  reload_hint_info_title: "Can be disabled in Settings.",
  reload_hint_text: "Reload the page to begin hunting.",
  reload_hint_reload: "Reload",
  reload_hint_dismiss_aria: "Dismiss",

  // Progress row
  progress_aria_label:
    "Progress: {caught} of {total} words caught, {unlocked} of {achTotal} achievements unlocked",
  progress_streak_eyebrow: "Streak",
  progress_current_label: "current",
  progress_longest_label: "longest",
  progress_achievements_eyebrow: "Achievements",

  // Custom word modal
  custom_word_backdrop_aria: "Close dialog",
  custom_word_dialog_aria: "Custom word",
  custom_word_heading: "Custom word",
  custom_word_close_aria: "Close",
  custom_word_close_title: "Close",
  custom_word_field_label: "Word",
  custom_word_placeholder: "serendipity",
  custom_word_cancel: "Cancel",
  custom_word_submit: "Start hunt",

  // Play tab
  play_list_animals: "Animals",
  play_list_pokemon: "Pokémon",
  play_filter_all: "All",
  play_filter_caught: "Caught",
  play_filter_uncaught: "Uncaught",
  play_word_list_aria: "Word list",
  play_filter_aria: "Filter",

  // Stats tab
  stats_empty_body: "No words found yet.",
  stats_empty_editorial: "your hunts will appear here.",
  stats_n_hunts: "{count} hunts",
  stats_col_word: "Word",
  stats_col_found: "Found",
  stats_col_duration_tooltip: "Duration",
  stats_col_hint_header: "Hint",
  stats_col_page: "Page",
  stats_hint_used_aria: "hint used",
  stats_no_hint_aria: "no hint",
  stats_hint_used_tooltip: "Hint used",
  stats_no_hint_tooltip: "No hint",
  stats_clear: "Clear",
  stats_clear_confirm: "Clear all hunts?",

  // Rules tab
  rules_editorial: "a quiet game while you read.",
  rules_body_pre_kbd:
    "On every page you visit, Word Hunter hides the active word inside a paragraph. It looks like normal text but is invisible to ",
  rules_body_post_kbd: ". Find it by reading. Click it to log the find.",
  rules_item_min_words: "words required to qualify a paragraph",
  rules_item_one_active: "active word at a time, across all your tabs",
  rules_item_no_long_text: "no long text? no word hidden. you'll see a notification",

  // Settings tab
  settings_language_label: "Language",
  settings_min_paragraph_label: "Minimum paragraph length",
  settings_min_paragraph_helper: "paragraphs below this word count are skipped",
  settings_hint_delay_label: "Hint delay",
  settings_hint_delay_helper: "minutes the page is open before the hint tooltip shows",
  settings_hint_delay_unit: "min",
  settings_cursor_delay_label: "Cursor reveal delay",
  settings_cursor_delay_helper: "seconds of hovering before the cursor reveals the word",
  settings_cursor_delay_unit: "s",
  settings_reload_hint_label: "Reload hint",
  settings_reload_hint_helper: "prompt to reload the page after starting a hunt",
  settings_next_word_preview_label: "Show next word preview",
  settings_next_word_preview_helper:
    "Reveal the upcoming word in the celebration popup when Auto-Continue is on",
  settings_notifications_eyebrow: "Notifications",
  settings_notifications_aria: "In-page notifications",
  settings_notifications_title: "All notifications",
  settings_auto_continue_label: "Auto-Continue started",
  settings_auto_continue_helper: "brief confirmation when Auto-Continue begins a new hunt",
  settings_hint_reminder_label: "Hint reminder",
  settings_hint_reminder_helper: "shown after the hint delay passes with no find",
  settings_no_paragraphs_label: "No paragraphs",
  settings_no_paragraphs_helper: "shown when the page has no suitable text",
  settings_switch_on: "On",
  settings_switch_off: "Off",
  settings_cancel: "Cancel",
  settings_save: "Save",
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/types.ts src/i18n/messages/en.ts
git commit -m "feat(i18n): add Locale/MessageKey types and English message dictionary"
```

---

### Task 2: `t()` function (TDD)

**Files:**
- Create: `tests/i18n/t.test.ts`
- Create: `src/i18n/index.ts` (initial — `t()` only)

- [ ] **Step 1: Write the failing tests**

Create `tests/i18n/t.test.ts`:

```typescript
import { t } from "../../src/i18n";

describe("t()", () => {
  it("returns the English string for a known key", () => {
    expect(t("active_word_eyebrow", "en")).toBe("Active word");
  });

  it("substitutes {param} tokens", () => {
    expect(t("stats_n_hunts", "en", { count: 3 })).toBe("3 hunts");
  });

  it("supports a count of zero", () => {
    expect(t("stats_n_hunts", "en", { count: 0 })).toBe("0 hunts");
  });

  it("substitutes multiple params", () => {
    expect(
      t("progress_aria_label", "en", {
        caught: 5,
        total: 24,
        unlocked: 2,
        achTotal: 8,
      })
    ).toBe(
      "Progress: 5 of 24 words caught, 2 of 8 achievements unlocked"
    );
  });

  it("falls back to English when the requested locale has no translation", () => {
    expect(t("active_word_eyebrow", "uk")).toBe("Active word");
  });

  it("returns the raw template when no params are passed", () => {
    expect(t("stats_n_hunts", "en")).toBe("{count} hunts");
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
pnpm test tests/i18n/t.test.ts
```

Expected: FAIL — `Cannot find module '../../src/i18n'`

- [ ] **Step 3: Create `src/i18n/index.ts`**

```typescript
import type { Locale, MessageKey } from "./types";
import { en } from "./messages/en";

export type { Locale, MessageKey } from "./types";

const dictionaries: Record<Locale, Partial<Record<MessageKey, string>>> = {
  en,
  uk: {},
  de: {},
  ja: {},
};

export function t(
  key: MessageKey,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  const raw = dictionaries[locale][key] ?? en[key];
  if (!params) return raw;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    raw
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm test tests/i18n/t.test.ts
```

Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add tests/i18n/t.test.ts src/i18n/index.ts
git commit -m "feat(i18n): add t() lookup function with param substitution and English fallback"
```

---

### Task 3: Storage schema — add `locale` key

**Files:**
- Modify: `src/shared/storage.ts`

- [ ] **Step 1: Add `locale` to `StorageSchema`**

Replace the top of `src/shared/storage.ts` with:

```typescript
import { DEFAULT_SETTINGS } from "./constants";
import type { Locale } from "../i18n/types";
import type { ActiveWord, GameSettings, HuntRecord, WordListName } from "./types";

export type StorageSchema = {
  finds: HuntRecord[];
  settings: GameSettings;
  activeWord: ActiveWord | null;
  selectedList: WordListName;
  locale: Locale;
};
```

The rest of the file is unchanged.

- [ ] **Step 2: Run the full test suite**

```bash
pnpm test
```

Expected: all existing tests still pass.

- [ ] **Step 3: Commit**

```bash
git add src/shared/storage.ts
git commit -m "feat(i18n): add locale key to StorageSchema"
```

---

### Task 4: `LocaleProvider`, `useT()`, `getLocale()` (TDD)

**Files:**
- Create: `tests/i18n/locale-provider.test.tsx`
- Modify: `src/i18n/index.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/i18n/locale-provider.test.tsx`:

```typescript
import { render, screen, waitFor } from "@testing-library/preact";
import { h } from "preact";
import { LocaleProvider, useT, getLocale } from "../../src/i18n";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string
) => void;

function setupChromeMock(initial: Record<string, unknown> = {}): {
  store: Record<string, unknown>;
  fireChange: (changes: Record<string, chrome.storage.StorageChange>) => void;
} {
  const store = { ...initial };
  const listeners: StorageChangeListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(),
        remove: jest.fn(),
      },
      onChanged: {
        addListener: jest.fn((l: StorageChangeListener) => listeners.push(l)),
        removeListener: jest.fn((l: StorageChangeListener) => {
          const i = listeners.indexOf(l);
          if (i >= 0) listeners.splice(i, 1);
        }),
      },
    },
  };

  return {
    store,
    fireChange: (changes) => listeners.forEach((l) => l(changes, "local")),
  };
}

function EyebrowOutput() {
  const t = useT();
  return <span data-testid="output">{t("active_word_eyebrow")}</span>;
}

describe("useT()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns English strings when called without a LocaleProvider", () => {
    setupChromeMock();
    render(<EyebrowOutput />);
    expect(screen.getByTestId("output")).toHaveTextContent("Active word");
  });

  it("returns English strings when locale is en", async () => {
    setupChromeMock({ locale: "en" });
    render(
      <LocaleProvider>
        <EyebrowOutput />
      </LocaleProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId("output")).toHaveTextContent("Active word")
    );
  });
});

describe("getLocale()", () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns "en" when no locale is stored', async () => {
    setupChromeMock();
    expect(await getLocale()).toBe("en");
  });

  it("returns the stored locale", async () => {
    setupChromeMock({ locale: "uk" });
    expect(await getLocale()).toBe("uk");
  });
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
pnpm test tests/i18n/locale-provider.test.tsx
```

Expected: FAIL — `LocaleProvider is not a function` / `useT is not a function`

- [ ] **Step 3: Extend `src/i18n/index.ts` with `LocaleProvider`, `useT()`, `getLocale()`**

Replace the full content of `src/i18n/index.ts` with:

```typescript
import { createContext, type ComponentChildren } from "preact";
import { useCallback, useContext } from "preact/hooks";
import type { JSX } from "preact";
import type { Locale, MessageKey } from "./types";
import { en } from "./messages/en";
import { useStorage } from "../popup/hooks/useStorage";

export type { Locale, MessageKey } from "./types";

// ---------------------------------------------------------------------------
// Core translation function
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, Partial<Record<MessageKey, string>>> = {
  en,
  uk: {},
  de: {},
  ja: {},
};

export function t(
  key: MessageKey,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  const raw = dictionaries[locale][key] ?? en[key];
  if (!params) return raw;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    raw
  );
}

// ---------------------------------------------------------------------------
// Preact context
// ---------------------------------------------------------------------------

type TFunction = (
  key: MessageKey,
  params?: Record<string, string | number>
) => string;

const defaultT: TFunction = (key, params) => t(key, "en", params);
const LocaleContext = createContext<TFunction>(defaultT);

export function LocaleProvider({
  children,
}: {
  children: ComponentChildren;
}): JSX.Element {
  const [locale] = useStorage("locale", "en");
  const boundT = useCallback<TFunction>(
    (key, params) => t(key, locale, params),
    [locale]
  );
  return <LocaleContext.Provider value={boundT}>{children}</LocaleContext.Provider>;
}

export function useT(): TFunction {
  return useContext(LocaleContext);
}

// ---------------------------------------------------------------------------
// Content-script helper (no Preact context available)
// ---------------------------------------------------------------------------

export async function getLocale(): Promise<Locale> {
  const result = await chrome.storage.local.get("locale");
  return (result.locale as Locale | undefined) ?? "en";
}
```

- [ ] **Step 4: Run to confirm they pass**

```bash
pnpm test tests/i18n/
```

Expected: all 8 tests pass across both files.

- [ ] **Step 5: Run full suite to check for regressions**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/index.ts tests/i18n/locale-provider.test.tsx
git commit -m "feat(i18n): add LocaleProvider, useT(), and getLocale() helpers"
```

---

### Task 5: Manifest + `_locales` + `main.tsx` wiring

**Files:**
- Modify: `manifest.json`
- Create: `_locales/en/messages.json`
- Modify: `src/popup/main.tsx`

- [ ] **Step 1: Add `"default_locale"` to `manifest.json`**

Add `"default_locale": "en"` after the `"description"` field:

```json
{
  "manifest_version": 3,
  "name": "Word Hunter",
  "version": "0.1.0",
  "description": "A vocabulary game that hides a word invisibly in web-page text and lets you hunt for it as you read.",
  "default_locale": "en",
  "permissions": ["storage", "activeTab", "scripting"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"]
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon16.png",
      "32": "public/icons/icon32.png",
      "48": "public/icons/icon48.png",
      "128": "public/icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "icons": {
    "16": "public/icons/icon16.png",
    "32": "public/icons/icon32.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
}
```

- [ ] **Step 2: Create `_locales/en/messages.json`**

```json
{
  "name": {
    "message": "Word Hunter"
  },
  "description": {
    "message": "A vocabulary game that hides a word invisibly in web-page text and lets you hunt for it as you read."
  }
}
```

Note: these keys are read by the Chrome Web Store only — they are never used for in-extension UI strings.

- [ ] **Step 3: Wrap `App` in `LocaleProvider` in `src/popup/main.tsx`**

```typescript
import { render } from "preact";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "../shared/styles/tokens.css";
import "./styles/popup.css";
import { App } from "./App";
import { LocaleProvider } from "../i18n";

const root = document.getElementById("app");
if (root)
  render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
    root
  );
```

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: all tests pass (popup/app.test.tsx renders `<App />` directly, no provider needed — context default handles it).

- [ ] **Step 5: Commit**

```bash
git add manifest.json _locales/en/messages.json src/popup/main.tsx
git commit -m "feat(i18n): add default_locale to manifest, CWS _locales, and wrap App in LocaleProvider"
```

---

### Task 6: SettingsTab — language selector + full string wiring

**Files:**
- Modify: `src/popup/tabs/SettingsTab.tsx`
- Modify: `tests/popup/settings-tab.test.tsx` (add selector test)

- [ ] **Step 1: Write a failing test for the language selector**

Open `tests/popup/settings-tab.test.tsx` and add this test inside the existing `describe("SettingsTab")` block (after the last `it()` call, before the closing `}`):

```typescript
it("renders the language selector with four options in native script", () => {
  setupChromeMock();
  render(<SettingsTab />);
  expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Українська" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Deutsch" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "日本語" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test tests/popup/settings-tab.test.tsx
```

Expected: FAIL — `Unable to find role="option" with name "English"`

- [ ] **Step 3: Replace `src/popup/tabs/SettingsTab.tsx` in full**

```typescript
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { Locale } from "../../i18n/types";
import type { GameSettings } from "../../shared/types";
import { useT } from "../../i18n";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { useStorage } from "../hooks/useStorage";

const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export function SettingsTab(): JSX.Element {
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
    <div class="wh-settings">
      <div class="wh-settings__scroll">
        <Field label={t("settings_language_label")} htmlFor="setting-language">
          <select
            id="setting-language"
            class="wh-select"
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
        </Field>

        <Field
          label={t("settings_min_paragraph_label")}
          htmlFor="setting-min-paragraph"
          helper={t("settings_min_paragraph_helper")}
        >
          <div class="wh-settings__input-row">
            <input
              id="setting-min-paragraph"
              type="range"
              class="wh-settings__range"
              min={30}
              max={150}
              step={10}
              value={draft.minWordThreshold}
              style={{
                background: `linear-gradient(to right, var(--wh-primary) 0%, var(--wh-primary) ${((draft.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) ${((draft.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) 100%)`,
              }}
              onInput={(e) =>
                update({ minWordThreshold: Number((e.target as HTMLInputElement).value) })
              }
            />
            <span class="wh-settings__range-value">{draft.minWordThreshold}</span>
          </div>
        </Field>

        <Field
          label={t("settings_hint_delay_label")}
          htmlFor="setting-hint-delay"
          helper={t("settings_hint_delay_helper")}
        >
          <div class="wh-settings__input-row">
            <div class="wh-settings__input-cell">
              <Input
                id="setting-hint-delay"
                type="number"
                min={1}
                step={1}
                value={String(draft.hintDelayMinutes)}
                onInput={(v) => update({ hintDelayMinutes: Number(v) })}
              />
            </div>
            <span class="wh-settings__unit">{t("settings_hint_delay_unit")}</span>
          </div>
        </Field>

        <Field
          label={t("settings_cursor_delay_label")}
          htmlFor="setting-cursor-delay"
          helper={t("settings_cursor_delay_helper")}
        >
          <div class="wh-settings__input-row">
            <div class="wh-settings__input-cell">
              <Input
                id="setting-cursor-delay"
                type="number"
                min={0.1}
                step={0.1}
                value={String(draft.celebrationHoverSeconds)}
                onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
              />
            </div>
            <span class="wh-settings__unit">{t("settings_cursor_delay_unit")}</span>
          </div>
        </Field>

        <Field label={t("settings_reload_hint_label")} helper={t("settings_reload_hint_helper")}>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showReloadHint ? " is-on" : ""}`}
            aria-checked={draft.showReloadHint}
            aria-label={t("settings_reload_hint_label")}
            onClick={() => update({ showReloadHint: !draft.showReloadHint })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showReloadHint ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field
          label={t("settings_next_word_preview_label")}
          helper={t("settings_next_word_preview_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNextWordPreview ? " is-on" : ""}`}
            aria-checked={draft.showNextWordPreview}
            aria-label={t("settings_next_word_preview_label")}
            onClick={() => update({ showNextWordPreview: !draft.showNextWordPreview })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNextWordPreview ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <div class="wh-settings__notif-header">
          <Eyebrow>{t("settings_notifications_eyebrow")}</Eyebrow>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.notificationsEnabled ? " is-on" : ""}`}
            aria-checked={draft.notificationsEnabled}
            aria-label={t("settings_notifications_aria")}
            title={t("settings_notifications_title")}
            onClick={() => update({ notificationsEnabled: !draft.notificationsEnabled })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
          </button>
        </div>

        <Field
          label={t("settings_auto_continue_label")}
          helper={t("settings_auto_continue_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showAutoModeToast ? " is-on" : ""}`}
            aria-checked={draft.showAutoModeToast}
            aria-label={t("settings_auto_continue_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showAutoModeToast: !draft.showAutoModeToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showAutoModeToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field label={t("settings_hint_reminder_label")} helper={t("settings_hint_reminder_helper")}>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showHintToast ? " is-on" : ""}`}
            aria-checked={draft.showHintToast}
            aria-label={t("settings_hint_reminder_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showHintToast: !draft.showHintToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showHintToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field
          label={t("settings_no_paragraphs_label")}
          helper={t("settings_no_paragraphs_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNoParagraphToast ? " is-on" : ""}`}
            aria-checked={draft.showNoParagraphToast}
            aria-label={t("settings_no_paragraphs_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showNoParagraphToast: !draft.showNoParagraphToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNoParagraphToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>
      </div>

      {isDirty && (
        <div class="wh-settings__footer">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            {t("settings_cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t("settings_save")}
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/popup/settings-tab.test.tsx
```

Expected: all tests pass including the new selector test.

- [ ] **Step 5: Commit**

```bash
git add src/popup/tabs/SettingsTab.tsx tests/popup/settings-tab.test.tsx
git commit -m "feat(i18n): add language selector to SettingsTab, wire all strings to t()"
```

---

### Task 7: Wire `Tabs`, `PopupHeader`, `BottomActionBar`

**Files:**
- Modify: `src/popup/components/Tabs.tsx`
- Modify: `src/popup/components/PopupHeader.tsx`
- Modify: `src/popup/components/BottomActionBar.tsx`

- [ ] **Step 1: Run existing tests to establish baseline**

```bash
pnpm test tests/popup/components/popup-header.test.tsx tests/popup/components/bottom-action-bar.test.tsx
```

Expected: all pass.

- [ ] **Step 2: Replace `src/popup/components/Tabs.tsx`**

```typescript
import type { JSX } from "preact";
import type { MessageKey } from "../../i18n/types";
import { useT } from "../../i18n";
import { Icon, type IconName } from "./Icon";

export type TabId = "play" | "stats" | "settings" | "rules";

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

export function Tabs({ active, onNavigate }: TabsProps): JSX.Element {
  const t = useT();
  return (
    <nav class="wh-tabs">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive ? "true" : "false"}
            class={`wh-tab${isActive ? " wh-tab--active" : ""}`}
            onClick={() => onNavigate(tab.id)}
          >
            <Icon name={tab.icon} size={14} />
            <span>{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Replace `src/popup/components/PopupHeader.tsx`**

```typescript
import type { JSX } from "preact";
import logoUrl from "../../assets/logo.png";
import { useT } from "../../i18n";
import { Icon } from "./Icon";

interface PopupHeaderProps {
  onRules: () => void;
  rulesActive: boolean;
}

export function PopupHeader({ onRules, rulesActive }: PopupHeaderProps): JSX.Element {
  const t = useT();
  return (
    <header class="wh-header">
      <div class="wh-header__lockup">
        <img
          class="wh-header__glyph"
          src={logoUrl}
          width="28"
          height="28"
          alt=""
          aria-hidden="true"
        />
        <span class="wh-header__wordmark">Word Hunter</span>
      </div>
      <button
        type="button"
        class={`wh-header__rules-btn${rulesActive ? " wh-header__rules-btn--active" : ""}`}
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

- [ ] **Step 4: Replace `src/popup/components/BottomActionBar.tsx`**

```typescript
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

export function BottomActionBar({
  onStart,
  onShuffle,
  onCustom,
  startDisabled = false,
  autoContinue = false,
  onAutoContinue,
}: BottomActionBarProps): JSX.Element {
  const t = useT();
  return (
    <div class="wh-action-bar">
      <button
        type="button"
        role="switch"
        class={`wh-action-bar__icon${autoContinue ? " is-on" : ""}`}
        aria-checked={autoContinue}
        title={t("action_bar_auto_continue_title")}
        aria-label={t("action_bar_auto_continue_aria")}
        onClick={onAutoContinue}
      >
        <Icon name="refresh" size={16} />
      </button>
      <button
        type="button"
        class="wh-action-bar__primary"
        onClick={onStart}
        disabled={startDisabled}
      >
        <Icon name="play" size={14} filled />
        <span>{t("action_bar_start")}</span>
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title={t("action_bar_shuffle_title")}
        aria-label={t("action_bar_shuffle_aria")}
        onClick={onShuffle}
      >
        <Icon name="shuffle" size={16} />
      </button>
      <button
        type="button"
        class="wh-action-bar__icon"
        title={t("action_bar_custom_title")}
        aria-label={t("action_bar_custom_aria")}
        onClick={onCustom}
      >
        <Icon name="pencil" size={16} />
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test tests/popup/components/popup-header.test.tsx tests/popup/components/bottom-action-bar.test.tsx
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/popup/components/Tabs.tsx src/popup/components/PopupHeader.tsx src/popup/components/BottomActionBar.tsx
git commit -m "feat(i18n): wire Tabs, PopupHeader, BottomActionBar strings to t()"
```

---

### Task 8: Wire `ActiveWordCard` + `ReloadHint`

**Files:**
- Modify: `src/popup/play/ActiveWordCard.tsx`
- Modify: `src/popup/play/ReloadHint.tsx`

- [ ] **Step 1: Baseline**

```bash
pnpm test tests/popup/play/active-word-card.test.tsx
```

Expected: pass.

- [ ] **Step 2: Replace `src/popup/play/ActiveWordCard.tsx`**

```typescript
import type { JSX } from "preact";
import { resolveArt } from "../../shared/art-resolver";
import type { ActiveWord, WordSource } from "../../shared/types";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ActiveWordCardProps {
  activeWord: ActiveWord | null;
  onClear: () => void;
}

export function ActiveWordCard({ activeWord, onClear }: ActiveWordCardProps): JSX.Element {
  const t = useT();

  if (!activeWord) {
    return (
      <div class="wh-active-card wh-active-card--empty">
        <div class="wh-active-card__art" aria-hidden="true">
          <Icon name="search" size={18} />
        </div>
        <div class="wh-active-card__body">
          <span class="wh-active-card__eyebrow">{t("active_word_empty_eyebrow")}</span>
          <span class="wh-active-card__hint">{t("active_word_empty_hint")}</span>
        </div>
      </div>
    );
  }

  const source: WordSource = activeWord.list ?? "custom";
  const art = resolveArt(activeWord.word, source);
  const isIconArt = source === "custom" || !art;

  return (
    <div class="wh-active-card">
      <div
        class={`wh-active-card__art${isIconArt ? " wh-active-card__art--icon" : ""}`}
        aria-hidden="true"
      >
        {renderArt(source, art)}
      </div>
      <div class="wh-active-card__body">
        <span class="wh-active-card__eyebrow">{t("active_word_eyebrow")}</span>
        <span class="wh-active-card__word">{activeWord.word}</span>
      </div>
      <button
        type="button"
        class="wh-active-card__stop"
        title={t("active_word_stop_title")}
        aria-label={t("active_word_stop_aria")}
        onClick={onClear}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function renderArt(source: WordSource, art: string | undefined): JSX.Element | null {
  if (source === "pokemon" && art) {
    return (
      <img
        class="wh-active-card__sprite"
        src={art}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (source === "animals" && art) {
    return <span class="wh-active-card__emoji">{art}</span>;
  }
  return <Icon name="pencil" size={18} />;
}
```

- [ ] **Step 3: Replace `src/popup/play/ReloadHint.tsx`**

```typescript
import type { JSX } from "preact";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ReloadHintProps {
  onReload: () => void;
  onDismiss: () => void;
}

export function ReloadHint({ onReload, onDismiss }: ReloadHintProps): JSX.Element {
  const t = useT();
  return (
    <div class="wh-reload-hint">
      <span class="wh-reload-hint__info" title={t("reload_hint_info_title")}>
        <Icon name="info" size={12} />
      </span>
      <span class="wh-reload-hint__text">{t("reload_hint_text")}</span>
      <button type="button" class="wh-reload-hint__btn" onClick={onReload}>
        {t("reload_hint_reload")}
      </button>
      <button
        type="button"
        class="wh-reload-hint__dismiss"
        aria-label={t("reload_hint_dismiss_aria")}
        onClick={onDismiss}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/popup/play/active-word-card.test.tsx
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/popup/play/ActiveWordCard.tsx src/popup/play/ReloadHint.tsx
git commit -m "feat(i18n): wire ActiveWordCard and ReloadHint strings to t()"
```

---

### Task 9: Wire `ProgressRow` + `CustomWordModal`

**Files:**
- Modify: `src/popup/play/ProgressRow.tsx`
- Modify: `src/popup/play/CustomWordModal.tsx`

- [ ] **Step 1: Baseline**

```bash
pnpm test tests/popup/play/progress-row.test.tsx tests/popup/play/custom-word-modal.test.tsx
```

Expected: all pass.

- [ ] **Step 2: Replace `src/popup/play/ProgressRow.tsx`**

```typescript
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { Achievement, CollectionStats, StreakStats } from "../collection/types";
import { useT } from "../../i18n";
import { Icon } from "../components/Icon";

interface ProgressRowProps {
  stats: CollectionStats;
  streak: StreakStats;
  achievements: Achievement[];
}

export function ProgressRow({ stats, streak, achievements }: ProgressRowProps): JSX.Element {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(stats.ratio * 100);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const hasUnlocked = unlocked > 0;

  return (
    <div class="wh-progress-row">
      <button
        type="button"
        class={`wh-progress-row__button${expanded ? " is-expanded" : ""}`}
        aria-expanded={expanded}
        aria-label={t("progress_aria_label", {
          caught: stats.caught,
          total: stats.total,
          unlocked,
          achTotal: total,
        })}
        onClick={() => setExpanded((v) => !v)}
      >
        <span class="wh-progress-row__count">
          {stats.caught}/{stats.total}
        </span>
        <span class="wh-progress-row__bar" aria-hidden="true">
          <span class="wh-progress-row__fill" style={{ width: `${pct}%` }} />
        </span>
        <span
          class={`wh-progress-row__ach-chip${expanded ? " is-expanded" : ""}`}
          aria-hidden="true"
        >
          <span
            class={`wh-progress-row__ach-icon${hasUnlocked ? " is-unlocked" : ""}`}
            aria-hidden="true"
          >
            <Icon name="star" size={10} filled={hasUnlocked} />
          </span>
          <span class="wh-progress-row__ach-count">
            {unlocked}/{total}
          </span>
        </span>
        <span
          class={`wh-progress-row__chevron${expanded ? " is-expanded" : ""}`}
          aria-hidden="true"
        >
          <Icon name="chevron-down" size={10} />
        </span>
      </button>

      {expanded && (
        <div class="wh-progress-row__panel">
          <div class="wh-progress-row__streak">
            <span class="wh-progress-row__eyebrow">{t("progress_streak_eyebrow")}</span>
            <div class="wh-progress-row__streak-stats">
              <div class="wh-progress-row__stat wh-progress-row__stat--current">
                <span class="wh-progress-row__stat-value">{streak.current}d</span>
                <span class="wh-progress-row__stat-label">{t("progress_current_label")}</span>
              </div>
              <span class="wh-progress-row__stat-sep" aria-hidden="true" />
              <div class="wh-progress-row__stat">
                <span class="wh-progress-row__stat-value">{streak.longest}d</span>
                <span class="wh-progress-row__stat-label">{t("progress_longest_label")}</span>
              </div>
            </div>
          </div>
          <div class="wh-progress-row__divider" aria-hidden="true" />
          <div class="wh-progress-row__achievements">
            <span class="wh-progress-row__eyebrow">{t("progress_achievements_eyebrow")}</span>
            <div class="wh-progress-row__ach-list">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  class={`wh-progress-row__ach${a.unlocked ? "" : " is-locked"}`}
                  title={a.hint ?? a.label}
                >
                  <span
                    class={`wh-progress-row__ach-icon${a.unlocked ? " is-unlocked" : ""}`}
                    aria-hidden="true"
                  >
                    <Icon name="star" size={9} filled={a.unlocked} />
                  </span>
                  <span class="wh-progress-row__ach-label">{a.label}</span>
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

- [ ] **Step 3: Replace `src/popup/play/CustomWordModal.tsx`**

```typescript
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { MAX_CUSTOM_LEN, validateCustomWord } from "../../shared/word-validation";
import { useT } from "../../i18n";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";

interface CustomWordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (word: string) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CustomWordModal({
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
  const counter = `${trimmed.length} / ${MAX_CUSTOM_LEN}`;

  function handleSubmit(): void {
    if (!trimmed || error) {
      setSubmitAttempted(true);
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div class="wh-modal__backdrop">
      <button
        type="button"
        class="wh-modal__backdrop-dismiss"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-label={t("custom_word_backdrop_aria")}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        class="wh-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("custom_word_dialog_aria")}
        ref={dialogRef}
      >
        <div class="wh-modal__header">
          <div class="wh-modal__title">
            <span class="wh-modal__heading">{t("custom_word_heading")}</span>
          </div>
          <button
            type="button"
            class="wh-modal__close"
            aria-label={t("custom_word_close_aria")}
            title={t("custom_word_close_title")}
            onClick={onClose}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <Field
          label={t("custom_word_field_label")}
          htmlFor="custom-word-input"
          error={showError ? error : undefined}
          counter={counter}
          helper={" "}
        >
          <Input
            id="custom-word-input"
            value={value}
            onInput={setValue}
            placeholder={t("custom_word_placeholder")}
            mono
            error={showError}
            inputRef={inputRef}
          />
        </Field>

        <div class="wh-modal__footer">
          <Button variant="ghost" onClick={onClose}>
            {t("custom_word_cancel")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t("custom_word_submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test tests/popup/play/progress-row.test.tsx tests/popup/play/custom-word-modal.test.tsx
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/popup/play/ProgressRow.tsx src/popup/play/CustomWordModal.tsx
git commit -m "feat(i18n): wire ProgressRow and CustomWordModal strings to t()"
```

---

### Task 10: Wire `PlayTab`

**Files:**
- Modify: `src/popup/tabs/PlayTab.tsx`

- [ ] **Step 1: Baseline**

```bash
pnpm test tests/popup/play-tab.test.tsx
```

Expected: pass.

- [ ] **Step 2: Replace `src/popup/tabs/PlayTab.tsx`**

```typescript
import type { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { ActiveWord } from "../../shared/types";
import type { MessageKey } from "../../i18n/types";
import { useT } from "../../i18n";
import { CollectionGrid } from "../collection/CollectionGrid";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import { pickRandomWord } from "../collection/pickRandomWord";
import type { CollectionFilter } from "../collection/types";
import { BottomActionBar } from "../components/BottomActionBar";
import { useStorage } from "../hooks/useStorage";
import { ActiveWordCard } from "../play/ActiveWordCard";
import { CustomWordModal } from "../play/CustomWordModal";
import { ProgressRow } from "../play/ProgressRow";
import { ReloadHint } from "../play/ReloadHint";
import { WORD_LISTS, type WordListName } from "../word-lists";

const LIST_CHIPS: Array<{ value: WordListName; labelKey: MessageKey }> = [
  { value: "animals", labelKey: "play_list_animals" },
  { value: "pokemon", labelKey: "play_list_pokemon" },
];

const FILTER_CHIPS: Array<{ value: CollectionFilter; labelKey: MessageKey }> = [
  { value: "all", labelKey: "play_filter_all" },
  { value: "caught", labelKey: "play_filter_caught" },
  { value: "uncaught", labelKey: "play_filter_uncaught" },
];

export function PlayTab(): JSX.Element {
  const t = useT();
  const [activeWord, setActiveWord] = useStorage("activeWord", null);
  const [finds] = useStorage("finds", []);
  const [list, setList] = useStorage("selectedList", "animals");
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
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
    <div class="wh-play">
      <div class="wh-play__scroll">
        {showReloadBanner && activeWord && (
          <ReloadHint onReload={handleReload} onDismiss={() => setShowReloadBanner(false)} />
        )}

        <ActiveWordCard activeWord={activeWord} onClear={clear} />

        <div class="wh-chip-group" role="tablist" data-group="list" aria-label={t("play_word_list_aria")}>
          {LIST_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
              aria-selected={list === chip.value}
              onClick={() => setList(chip.value)}
            >
              {t(chip.labelKey)}
            </button>
          ))}
        </div>

        <ProgressRow stats={stats} streak={streak} achievements={achievements} />

        <div class="wh-chip-group" role="tablist" data-group="filter" aria-label={t("play_filter_aria")}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${filter === chip.value ? " is-selected" : ""}`}
              aria-selected={filter === chip.value}
              onClick={() => setFilter(chip.value)}
            >
              {t(chip.labelKey)}
            </button>
          ))}
        </div>

        <CollectionGrid
          list={list}
          filter={filter}
          counts={counts}
          activeWord={activeWordValue}
          pendingWord={pendingWord}
          onPick={pickFromCollection}
        />
      </div>

      <BottomActionBar
        onStart={startHunt}
        onShuffle={shufflePick}
        onCustom={() => setCustomOpen(true)}
        startDisabled={pendingWord === null}
        autoContinue={settings.autoContinue}
        onAutoContinue={toggleAutoContinue}
      />

      <CustomWordModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
      />
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm test tests/popup/play-tab.test.tsx
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/popup/tabs/PlayTab.tsx
git commit -m "feat(i18n): wire PlayTab strings to t()"
```

---

### Task 11: Wire `StatsTab`

**Files:**
- Modify: `src/popup/tabs/StatsTab.tsx`

- [ ] **Step 1: Baseline**

```bash
pnpm test tests/popup/stats-tab.test.tsx
```

Expected: pass.

- [ ] **Step 2: Replace `src/popup/tabs/StatsTab.tsx`**

```typescript
import type { JSX } from "preact";
import type { HuntRecord, WordSource } from "../../shared/types";
import { useT } from "../../i18n";
import { Button } from "../components/Button";
import { ConfirmOverlay } from "../components/ConfirmOverlay";
import { Eyebrow } from "../components/Eyebrow";
import { Icon } from "../components/Icon";
import { useConfirmAction } from "../hooks/useConfirmAction";
import { useStorage } from "../hooks/useStorage";
import { formatDuration, formatRelative } from "../utils/format";

export function StatsTab(): JSX.Element {
  const t = useT();
  const [finds, setFinds] = useStorage("finds", []);
  const clearAction = useConfirmAction({ onConfirm: () => setFinds([]) });

  if (finds.length === 0) {
    return (
      <div class="wh-stats__empty">
        <Icon name="search" size={28} />
        <span class="wh-body-sm">{t("stats_empty_body")}</span>
        <span class="wh-editorial">{t("stats_empty_editorial")}</span>
      </div>
    );
  }

  const sorted = [...finds].sort((a, b) => b.foundAt - a.foundAt);

  return (
    <div class="wh-stats">
      <div class="wh-stats__confirm-anchor">
        <div class="wh-stats__header">
          <Eyebrow>{t("stats_n_hunts", { count: finds.length })}</Eyebrow>
          <Button variant="ghost" size="sm" leftIcon="trash" onClick={clearAction.arm}>
            {t("stats_clear")}
          </Button>
        </div>
        {clearAction.armed && (
          <ConfirmOverlay
            prompt={t("stats_clear_confirm")}
            onConfirm={clearAction.confirm}
            onCancel={clearAction.cancel}
          />
        )}
      </div>
      <ul class="wh-stats__table">
        <StatsHeader />
        {sorted.map((r) => (
          <StatsRow key={`${r.word}-${r.foundAt}`} record={r} />
        ))}
      </ul>
    </div>
  );
}

function StatsHeader(): JSX.Element {
  const t = useT();
  return (
    <div class="wh-stats__col-header" aria-hidden="true">
      <span>{t("stats_col_word")}</span>
      <span>{t("stats_col_found")}</span>
      <span class="wh-stats__col-header--icon" data-tooltip={t("stats_col_duration_tooltip")}>
        <Icon name="timer" size={11} />
      </span>
      <span class="wh-stats__col-header--center">{t("stats_col_hint_header")}</span>
      <span class="wh-stats__col-header--center">{t("stats_col_page")}</span>
    </div>
  );
}

const DOT_COLOR: Record<WordSource, string> = {
  animals: "var(--wh-list-animals)",
  pokemon: "var(--wh-list-pokemon)",
  custom: "var(--wh-fg-3)",
};

function StatsRow({ record }: { record: HuntRecord }): JSX.Element {
  const t = useT();
  const dotColor = record.list ? DOT_COLOR[record.list] : "var(--wh-fg-3)";

  return (
    <li class="wh-stats__row">
      <span class="wh-stats__word" data-tooltip={record.word}>
        <span class="wh-stats__dot" style={{ background: dotColor }} />
        <span class="wh-stats__word-text">{record.word}</span>
      </span>
      <span class="wh-stats__meta">{formatRelative(record.foundAt)}</span>
      <span class="wh-stats__meta">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={record.hintUsed ? "wh-stats__hint wh-stats__hint--used" : "wh-stats__hint"}
        role="img"
        aria-label={record.hintUsed ? t("stats_hint_used_aria") : t("stats_no_hint_aria")}
        data-tooltip={record.hintUsed ? t("stats_hint_used_tooltip") : t("stats_no_hint_tooltip")}
      />
      <a
        class="wh-stats__link"
        href={record.pageUrl}
        target="_blank"
        rel="noopener"
        aria-label={record.pageTitle}
        data-tooltip={record.pageTitle}
      >
        <Icon name="external" size={12} />
      </a>
    </li>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm test tests/popup/stats-tab.test.tsx
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/popup/tabs/StatsTab.tsx
git commit -m "feat(i18n): wire StatsTab strings to t()"
```

---

### Task 12: Wire `RulesTab`

**Files:**
- Modify: `src/popup/tabs/RulesTab.tsx`

Note: The body paragraph contains a `<code>` element mid-sentence. The paragraph is split into two message keys (`rules_body_pre_kbd` and `rules_body_post_kbd`) with the `<code>` element inlined in JSX.

- [ ] **Step 1: Baseline**

```bash
pnpm test tests/popup/rules-tab.test.tsx
```

Expected: pass.

- [ ] **Step 2: Replace `src/popup/tabs/RulesTab.tsx`**

```typescript
import type { JSX } from "preact";
import { useT } from "../../i18n";

export function RulesTab(): JSX.Element {
  const t = useT();
  return (
    <div class="wh-rules">
      <span class="wh-editorial">{t("rules_editorial")}</span>

      <p class="wh-body wh-rules__body">
        {t("rules_body_pre_kbd")}
        <code class="wh-rules__kbd">Ctrl + F</code>
        {t("rules_body_post_kbd")}
      </p>

      <ul class="wh-rules__list">
        <li class="wh-rules__item">
          <span class="wh-rules__marker">30 +</span>
          <span class="wh-body-sm">{t("rules_item_min_words")}</span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">1×</span>
          <span class="wh-body-sm">{t("rules_item_one_active")}</span>
        </li>
        <li class="wh-rules__item">
          <span class="wh-rules__marker">—</span>
          <span class="wh-body-sm">{t("rules_item_no_long_text")}</span>
        </li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm test tests/popup/rules-tab.test.tsx
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/popup/tabs/RulesTab.tsx
git commit -m "feat(i18n): wire RulesTab strings to t()"
```

---

### Task 13: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass with zero failures. If any test references a hardcoded string that was replaced by `t()`, check that the English message key value matches the original string exactly.

- [ ] **Step 2: TypeScript build**

```bash
pnpm build
```

Expected: zero TypeScript errors. Pay attention to:
- Any `MessageKey` call-site using a key that was renamed
- `Locale` type constraints (e.g., `"en"` default in `useStorage`)

- [ ] **Step 3: Smoke-check the acceptance criteria**

Load the unpacked extension in Chrome and manually verify:
1. SettingsTab shows a **Language** selector at the top with four options: English, Українська, Deutsch, 日本語
2. Selecting Українська + Save: popup remains in English (no Ukrainian translations yet — expected, fallback works)
3. Switching back to English + Save: no visual change, selector reflects English
4. All other UI strings remain readable and correct
5. `pnpm build` output includes `_locales/en/messages.json`

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -p  # stage only intended changes
git commit -m "fix(i18n): address final build/test issues"
```

---

## Self-review notes

- **Spec coverage:** All acceptance criteria from issue #52 are covered across the 13 tasks.
- **No placeholders:** All code blocks are complete and reference only types/functions defined in earlier tasks.
- **Type consistency:** `t()` signature in Task 2 matches every call-site in Tasks 6–12. `MessageKey` imported from `../../i18n/types` in `PlayTab` and `Tabs`. `Locale` imported from `../../i18n/types` in `SettingsTab`.
- **`rules_body_pre_kbd` / `rules_body_post_kbd`:** The trailing space in `rules_body_pre_kbd` and the leading period-space in `rules_body_post_kbd` are intentional — they join the inline `<code>` element correctly.
