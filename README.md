# Word Hunter

A Chrome extension where the player searches for a hidden word embedded invisibly in page text.

The extension picks a word from a chosen WordList and secretly hides it inside a Paragraph on every page the player visits. The word is rendered via CSS `::before` on empty `<span>` elements — invisible to Ctrl+F and browser find. The player hunts for the word by reading the page, then clicks it to register a FindEvent and complete the hunt.

## Features

- **WordLists** — curated sets of Words to choose from (Animals, Pokémon, etc.)
- **HiddenWord** — inserted invisibly into page Paragraphs, bypasses Ctrl+F
- **Hunt Collection** — Pokédex-style grid on the Play tab: every word in the active list is a slot. Caught slots show art + catch counter, uncaught slots are silhouettes. Includes progress bar, daily streak, and 5 achievement badges.
- **Per-word art** — emoji for Animals, animated Pokémon sprite (PokeAPI CDN) shown in the celebration popup and the collection grid
- **Auto-Continue mode** — opt-in toggle that auto-picks the next word from the active list after each find, so you can keep hunting by simply reloading the page. A top-right toast confirms the mode on every page load; the celebration popup shows an optional "Next up" preview (toggleable in Settings).
- **HintTimer** — optional hint tooltip after a configurable delay
- **HuntRecords** — statistics tracking per-hunt: word, duration, page, hint used, list source
- **SPA support** — NavigationObserver re-injects on client-side navigation
- **Settings** — configurable hint delay, celebration animation duration, minimum paragraph word threshold, next-word preview spoiler toggle

## Development

```sh
pnpm install
pnpm dev      # watch build
pnpm build    # production build
pnpm test     # run tests
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked).

## AI Tooling

This project was developed with [Claude Code](https://claude.ai/code) using [Matt Pocock's skills](https://skills.sh/mattpocock/skills). Skill files live in `.agents/skills/` and are tracked in git — no install needed after cloning.

To update skills to their latest version:

```sh
pnpm dlx skills@latest add mattpocock/skills
```

## Version

`0.1.0` — core game loop + Hunt Collection complete, pre-release (not yet published to Chrome Web Store).
