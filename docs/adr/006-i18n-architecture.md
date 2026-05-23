# ADR 006 — i18n architecture: custom runtime module + storage-persisted locale

**Status:** Accepted  
**Date:** 2026-05-23

## Context

Word Hunter v0.1.0 ships English-only. The Chrome Web Store doc (`docs/release/chrome-web-store.md`) flagged Ukrainian as the first planned locale. The user wants v1 i18n to cover four languages — English, Ukrainian, German, Japanese — across the full extension: popup UI and content-script messages (toasts, overlays, hints).

Two decisions needed resolution:

1. **Which i18n mechanism to use** — Chrome's built-in `chrome.i18n.getMessage()` (reads `_locales/` at browser locale) vs. a runtime library vs. a custom module.
2. **How the user-selected locale is persisted and applied** — must support dynamic switching without an extension reload.

## Decision

### 1. Custom lightweight i18n module (`src/i18n/`)

A ~50-line module with:
- A `MessageKey` union type auto-derived from the English message object — compiler enforces every call-site uses a valid key.
- A `t(key, locale)` function that dispatches to the correct locale dictionary and falls back to English if a key is missing.
- A Preact `LocaleProvider` + `useT()` hook that makes the popup tree reactive to locale changes.
- A `getLocale()` async helper for content scripts that cannot use Preact context.

**Why not `chrome.i18n.getMessage()`?** Chrome's API reads the user's *browser* locale, not a user-selected one, and it cannot be changed at runtime — it is fixed at extension load time. User-selectable language requires a runtime solution.

**Why not i18next / @formatjs / lingui?** The extension has ~95 string keys, no complex plural rules, and a strict minimal-deps philosophy. A custom module has zero bundle overhead, full type safety, and no configuration surface.

### 2. Locale persisted in `chrome.storage.local` under key `"locale"`

`locale` is a top-level `StorageSchema` key (type `'en' | 'uk' | 'de' | 'ja'`, default `'en'`), separate from `GameSettings` — it is a UI preference, not a game setting.

The popup's `LocaleProvider` subscribes to `chrome.storage.onChanged` via the existing `useStorage()` hook. When the user saves a new locale in SettingsTab, the entire popup re-renders immediately with the new language — no extension reload needed.

Content scripts read the locale once on page init via `getLocale()` and subscribe to `chrome.storage.onChanged` to update the module-level `currentLocale` variable. In-page toasts and overlays update live when the user changes language.

### 3. `_locales/` only for Chrome Web Store store listing

`_locales/<lang>/messages.json` files contain only `name` and `description` keys — these are read by the Chrome Web Store to display the extension listing in the user's browser language. They are **not** used for any in-extension UI strings. `manifest.json` gains `"default_locale": "en"`.

## Consequences

- TypeScript enforces key completeness at compile time — missing translations produce a type error.
- New languages cost exactly one new `messages/<lang>.ts` file and one `_locales/<lang>/messages.json` for the CWS listing.
- Language switches are instantaneous in the popup and live in content scripts — no reload prompt needed.
- German and Japanese translations will need a native-speaker review before shipping; PRs should flag this explicitly.
