# Ukrainian (uk) Translation — Design Spec

**Date:** 2026-05-24  
**Issue:** #54  
**Status:** Approved

## Goal

Add a complete Ukrainian locale so that switching to Українська in SettingsTab renders the full popup and all in-page toasts in Ukrainian, with zero English fallback strings.

## Scope

| File | Action |
|---|---|
| `src/i18n/messages/uk.ts` | Fill all ~95 `MessageKey` entries; change type from `Partial<Record<MessageKey, string>>` to `Record<MessageKey, string>` |
| `_locales/uk/messages.json` | Create — CWS `name` stays `"Word Hunter"` (English), `description` translated to Ukrainian |

No changes to `en.ts`, `index.tsx`, or `types.ts`.

## Type change rationale

`uk.ts` currently uses `Partial<Record<MessageKey, string>>`, which lets keys be omitted and silently falls back to English via the `??` in `t()`. Changing to `Record<MessageKey, string>` makes TypeScript error at compile time on any missing key, fulfilling acceptance criterion 1.

The `dictionaries` map in `index.tsx` is typed as `Record<Locale, Partial<Record<MessageKey, string>>>` — a full record is assignable to that, so no change is needed there.

## Translation strategy

- Preserve placeholder tokens verbatim: `{count}`, `{caught}`, `{total}`, `{unlocked}`, `{achTotal}`.
- Keep `Word Hunter` untranslated in the CWS name and wherever it appears as a brand reference.
- Aria labels and tooltips follow the same phrasing as the visible label where natural.
- Carry over the 10 keys already present in `uk.ts` unchanged.

## CWS listing (`_locales/uk/messages.json`)

```json
{
  "name": { "message": "Word Hunter" },
  "description": { "message": "Словникова гра, яка ховає слово в тексті веб-сторінки і дозволяє шукати його під час читання." }
}
```

## Acceptance criteria

- `uk.ts` covers all keys in `en.ts` (TypeScript compile error if any missing).
- Switching to Ukrainian in the popup shows Ukrainian strings in every tab and every content-script toast.
- No English fallback strings are displayed.
- `pnpm build` and `pnpm test` pass.
