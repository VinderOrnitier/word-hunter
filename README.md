# Word Hunter

A Chrome extension where the player searches for a hidden word embedded invisibly in page text.

The extension picks a word from a chosen WordList and secretly hides it inside a Paragraph on every page the player visits. The word is rendered via CSS `::before` on empty `<span>` elements — invisible to Ctrl+F and browser find. The player hunts for the word by reading the page, then clicks it to register a FindEvent and complete the hunt.

## Features

- **WordLists** — curated sets of Words to choose from (Animals, Pokémon, etc.)
- **HiddenWord** — inserted invisibly into page Paragraphs, bypasses Ctrl+F
- **HintTimer** — optional hint tooltip after a configurable delay
- **HuntRecords** — statistics tracking per-hunt: word, duration, page, hint used
- **SPA support** — NavigationObserver re-injects on client-side navigation
- **Settings** — configurable hint delay and celebration animation duration

## Development

```sh
pnpm install
pnpm dev      # watch build
pnpm build    # production build
pnpm test     # run tests
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked).

## Version

`0.1.0` — core game loop complete, pre-release (not yet published to Chrome Web Store).
