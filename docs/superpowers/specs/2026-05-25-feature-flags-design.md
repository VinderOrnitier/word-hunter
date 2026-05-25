# Feature Flags System — Design Spec

**Date:** 2026-05-25  
**Status:** Approved

---

## Problem

Word Hunter includes the Pokémon word list (151 Gen-1 Pokémon). If a legal complaint arrives from Nintendo/TPC, the team needs to disable this feature quickly — without waiting 1–3 days for a Chrome Web Store review. The same mechanism should support hiding in-development features during the build cycle (dark launch).

---

## Decision

Remote JSON config file hosted on GitHub raw, fetched by the service worker and cached in `chrome.storage.local`. Popup reads flags reactively via a Preact hook.

**CWS compliance:** Disabling existing features via remote config is fine. Enabling brand-new hidden features without a new CWS submission is a gray area — avoid that pattern.

---

## Architecture

### Data flow

```
config/features.json  (GitHub raw — edited directly on GitHub)
        ↓  fetch on install + every 1 hour (Chrome alarm)
service-worker.ts
        ↓  chrome.storage.local.set({ featureFlags: {...} })
chrome.storage.local  { featureFlags: { pokemon: true } }
        ↓  useFeatureFlags() reactive hook
PlayTab / word-lists  (show/hide Pokémon chip and list)
```

### Fallback chain

```
fetch ok  →  use remote value
fetch error  →  use cached storage value
no cache  →  DEFAULT_FLAGS (all true)
```

Feature stays **enabled** on any failure — never silently breaks for the user.

---

## Files

### New

| File | Purpose |
|---|---|
| `config/features.json` | Remote config file hosted on GitHub raw |
| `src/shared/feature-flags.ts` | `fetchRemoteFlags()`, `refreshFlags()`, `DEFAULT_FLAGS` |
| `src/popup/hooks/useFeatureFlags.ts` | Preact hook — reactive read from `chrome.storage` |

### Modified

| File | Change |
|---|---|
| `src/shared/types.ts` | Add `FeatureFlags` interface |
| `src/shared/constants.ts` | Add `FLAGS_URL` and `DEFAULT_FLAGS` |
| `src/background/service-worker.ts` | `refreshFlags()` on `onInstalled` + 1-hour alarm |
| `src/popup/tabs/PlayTab.tsx` | Hide Pokémon chip if `!flags.pokemon`; auto-switch to animals |
| `src/popup/word-lists.ts` | `getAvailableLists(flags)` filters on flags |
| `manifest.json` | `host_permissions` for `https://raw.githubusercontent.com/` |

### Reused patterns

- `useStorage` (`src/popup/hooks/useStorage.ts`) — `useFeatureFlags` follows identical pattern
- `DEFAULT_SETTINGS` in `src/shared/constants.ts` — `DEFAULT_FLAGS` placed alongside
- Chrome alarm — same API already used for hint timer

---

## Edge Cases

**Active pokemon list when flag flips to false**  
`useFeatureFlags` effect detects `!flags.pokemon && selectedList === "pokemon"` → writes `selectedList = "animals"` to storage automatically.

**Existing HuntRecords with `list: "pokemon"`**  
Left untouched in storage. Collection restores if flag re-enables (ADR 003 — state derived on-the-fly, no migration needed).

**Active HiddenWord on page when flag changes**  
Flag is checked only when starting a new game. In-progress hunts are not interrupted.

---

## Adding a New Flag (future)

1. Add key to `FeatureFlags` interface in `src/shared/types.ts`
2. Add default value (`true`) to `DEFAULT_FLAGS` in `src/shared/constants.ts`
3. Add key to `config/features.json`
4. Read via `useFeatureFlags()` in the relevant component

No other plumbing needed.

---

## Verification

1. `pnpm build` — passes
2. `pnpm test` — passes
3. Load unpacked in Chrome — Pokémon chip visible, games work normally
4. Mock fetch to return `{ pokemon: false }` — chip disappears, list auto-switches to animals
5. HuntRecords with `list: "pokemon"` preserved in storage when flag is off
6. Re-enable flag → collection restores
