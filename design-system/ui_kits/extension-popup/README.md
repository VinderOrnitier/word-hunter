# UI Kit — Extension Popup

The Word Hunter Chrome extension popup. Recreates the four tabs (Play, Statistics, Settings, Rules) at the recommended **360 × 480** size — the codebase currently uses 320 × 400, but that's flagged as too tight in the design system.

## Files

- `index.html` — interactive shell. Click tabs, change the active word, hover/click the focus ring, see all states inline.
- `ui.jsx` — atoms: `Button`, `Input`, `Select`, `Field`, `Badge`, `Eyebrow`, `Card`, `Icon` (Lucide-style inline SVGs).
- `Tabs.jsx` — sticky-top tab nav with primary underline.
- `PlayTab.jsx` — current word + word-list picker + custom input + "New word" CTA.
- `StatsTab.jsx` — table of `HuntRecord`s. Row hover, hint badge, list-color dot.
- `SettingsTab.jsx` — hint delay (min) + celebration hover (s).
- `RulesTab.jsx` — explanation copy with one editorial Fraunces moment.
- `data.jsx` — mock word lists + mock hunt records + `formatDuration` helper.

## What's wired up vs. faked

- Tab navigation works.
- Picking a word list re-populates the word dropdown.
- Pressing "New word" updates the active-word card live.
- Stats are seeded from mock data; "clear" wipes them.
- Settings changes update local state but are not persisted (it's a UI kit, not the real extension).

## Mapping back to source

| UI kit file | Source equivalent |
|---|---|
| `PlayTab.jsx` | `word-hunter/src/popup/play-tab.ts` |
| `StatsTab.jsx` | `word-hunter/src/popup/stats-tab.ts` |
| `SettingsTab.jsx` | `word-hunter/src/popup/settings-tab.ts` |
| `RulesTab.jsx` | `word-hunter/src/popup/rules-tab.ts` |
| `data.jsx` (word lists) | `word-hunter/src/popup/word-lists.ts` |
