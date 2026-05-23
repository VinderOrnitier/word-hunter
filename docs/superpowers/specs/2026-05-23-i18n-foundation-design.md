# i18n Foundation — Custom Module + English Popup Wiring

**Issue:** #52  
**Date:** 2026-05-23  
**Status:** Approved

## Overview

Build the complete i18n infrastructure and wire it into the popup end-to-end using English as the baseline locale. This is the tracer-bullet slice: locale persisted in storage → reactive `LocaleProvider` → `t()` calls in every popup component → language selector visible in SettingsTab.

## Architecture

### Module structure

```
src/i18n/
  types.ts           — Locale union + MessageKey derived type
  messages/
    en.ts            — English messages (source of truth, ~95 flat keys)
  index.ts           — t(), LocaleProvider, useT(), getLocale()
```

Three files, ~80 lines total. No external dependencies.

### `src/i18n/types.ts`

```ts
export type Locale = 'en' | 'uk' | 'de' | 'ja'

import { en } from './messages/en'
export type MessageKey = keyof typeof en
```

`MessageKey` is derived from the English object via `keyof typeof en`. TypeScript enforces completeness at every call-site — a missing key is a compile error.

> **Note:** `types.ts` imports `en` as a value (not a type import) so `typeof en` resolves correctly. No circular dependency since `messages/en.ts` imports nothing from `src/i18n/`.

### `src/i18n/messages/en.ts`

A single flat object with ~95 keys using the `{component}_{description}` naming convention (e.g. `settings_min_paragraph_label`, `stats_n_hunts`).

Dynamic string values use `{param}` notation:
```ts
export const en = {
  stats_n_hunts: "{count} hunts",
  progress_aria_label: "Progress: {caught} of {total} words caught, {unlocked} of {achTotal} achievements unlocked",
  // ...
}
```

Future locale files (`uk.ts`, `de.ts`, `ja.ts`) must satisfy `Record<MessageKey, string>`, enforced by TypeScript.

### `src/i18n/index.ts`

Three exports:

**`t(key, locale, params?)`**
```ts
function t(
  key: MessageKey,
  locale: Locale,
  params?: Record<string, string | number>
): string
```
- Looks up `dictionaries[locale][key]`.
- Falls back to English if the key is missing in the requested locale.
- Replaces `{name}` tokens with `params` values via string replacement.

**`LocaleProvider` + `useT()`**

Preact context pair. `LocaleProvider` calls `useStorage("locale", "en")` and provides a bound translation function via context:

```ts
// provided value
(key: MessageKey, params?: Record<string, string | number>) => string
```

The context default is a pre-bound English `t` — so `useT()` works without a provider (existing tests are unaffected).

```ts
// call-site in any component
const t = useT()
t("settings_min_paragraph_label")
t("stats_n_hunts", { count: finds.length })
```

**`getLocale(): Promise<Locale>`**

Reads `chrome.storage.local.get("locale")`, returns `"en"` as fallback. Intended for content scripts that cannot use Preact context.

## Storage

Add `locale: Locale` as a top-level key in `StorageSchema`:

```ts
export type StorageSchema = {
  finds: HuntRecord[]
  settings: GameSettings
  activeWord: ActiveWord | null
  selectedList: WordListName
  locale: Locale          // ← new
}
```

`"en"` is the in-code default passed to `useStorage`. No migration is needed — `useStorage` already handles `undefined → default`.

## Popup wiring

### `src/popup/main.tsx`

Wrap the `<App />` render with `<LocaleProvider>`. One import, one JSX wrapper. Everything inside becomes locale-aware automatically.

### All popup components

Replace every hardcoded string with `const t = useT()` + a `t()` call. Components affected:

- `SettingsTab`, `PlayTab`, `StatsTab`, `RulesTab`
- `ActiveWordCard`, `ProgressRow`, `CustomWordModal`, `ReloadHint`
- `Tabs`, `BottomActionBar`, `PopupHeader`, `ConfirmOverlay`

No component prop signatures change. `useT()` is a hook import, not a prop.

### SettingsTab — language selector

A **Language** `<Select>` is added at the very top of the scroll area, before all existing settings groups. The four options display in their native script:

| Value | Label       |
|-------|-------------|
| `en`  | English     |
| `uk`  | Українська  |
| `de`  | Deutsch     |
| `ja`  | 日本語      |

Implementation follows the existing draft/save pattern:

```ts
const [savedLocale, setSavedLocale] = useStorage("locale", "en")
const [draftLocale, setDraftLocale] = useState<Locale>(savedLocale)

// Sync draft when storage changes externally (same pattern as draft game settings)
useEffect(() => { setDraftLocale(savedLocale) }, [savedLocale])
```

`isDirty` expands to include `draftLocale !== savedLocale`. `handleSave` calls `setSavedLocale(draftLocale)`. When storage updates, `LocaleProvider`'s own `useStorage` listener fires and the entire popup re-renders in the new language — no reload needed.

## Chrome Web Store files

`manifest.json` gains `"default_locale": "en"`.

`_locales/en/messages.json` contains only `name` and `description` keys for the CWS store listing. Not used for any in-extension UI strings (per ADR 006).

## Testing

### New tests

**`tests/i18n/t.test.ts`** — unit tests for the `t()` function:
- Known key returns correct English string
- `{param}` substitution works
- Missing locale key falls back to English
- Unknown params are ignored (no crash)

**`tests/i18n/locale-provider.test.tsx`** — integration test:
- `useT()` returns English translator without a provider (context default)
- Wrapping with `<LocaleProvider>` provides locale from storage
- Storage change triggers re-render

### Existing tests — no changes needed

The context default for `useT()` is a pre-bound English translator. All existing component tests render English strings without a `LocaleProvider`, exactly as before. No wrapper needed.

## Acceptance criteria (from issue #52)

- [ ] `pnpm build` passes with zero TypeScript errors; all `MessageKey` usages are type-checked
- [ ] Language selector appears at the top of SettingsTab with 4 options in native script
- [ ] Selecting a language and clicking Save immediately re-renders the entire popup in the new language
- [ ] Switching back to English works correctly
- [ ] `_locales/en/messages.json` and `"default_locale": "en"` are present in manifest
- [ ] `pnpm test` passes (existing tests unaffected)
