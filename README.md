# Word Hunter

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](CHANGELOG.md)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34a853.svg)](manifest.json)

A Chrome extension where the player searches for a hidden word embedded invisibly in page text.

The extension picks a word from a chosen WordList and secretly hides it inside a Paragraph on every page the player visits. The word is rendered via CSS `::before` on empty `<span>` elements — invisible to Ctrl+F and browser find. The player hunts for the word by reading the page, then clicks it to register a FindEvent and complete the hunt.

<!--
Screenshots / GIFs:
  docs/screenshots/hunt-collection.png — the Pokédex-style Play tab
  docs/screenshots/celebration.gif    — celebration popup on a find
  docs/screenshots/in-page-hint.png   — hint toast next to a HiddenWord
Drop them into docs/screenshots/ and uncomment below.
-->
<!--
![Hunt Collection](docs/screenshots/hunt-collection.png)
![Celebration](docs/screenshots/celebration.gif)
-->

## Features

- **WordLists** — curated sets of Words to choose from (Animals, Pokémon, etc.)
- **HiddenWord** — inserted invisibly into page Paragraphs, bypasses Ctrl+F
- **Hunt Collection** — Pokédex-style grid on the Play tab: every word in the active list is a slot. Caught slots show art + catch counter, uncaught slots are silhouettes. Includes progress bar, daily streak, and 5 achievement badges.
- **Per-word art** — emoji for Animals, animated Pokémon sprite (PokeAPI CDN) shown in the celebration popup and the collection grid
- **Auto-Continue mode** — opt-in toggle that auto-picks the next word from the active list after each find, so you can keep hunting by simply reloading the page. A top-right toast confirms the mode on every page load; the celebration popup shows an optional "Next up" preview (toggleable in Settings).
- **HintTimer** — optional hint tooltip after a configurable delay
- **HuntRecords** — statistics tracking per-hunt: word, duration, page, hint used, list source
- **SPA support** — NavigationObserver re-injects on client-side navigation
- **Settings** — configurable hint delay, celebration animation duration, minimum paragraph word threshold, per-toast notification toggles, next-word preview spoiler toggle

## Browser support

Word Hunter targets Chromium-based browsers via Manifest V3.

| Browser | Supported |
|---|---|
| Chrome 116+ | yes |
| Edge 116+ (Chromium) | yes |
| Brave 1.59+ | yes |
| Opera (Chromium) | yes |
| Firefox | no — Firefox's MV3 background-script model differs from Chromium's service worker |
| Safari | no |

## Installation

### From the Chrome Web Store

Not yet published. The first stable release will be linked here.

### From source (unpacked)

```sh
git clone https://github.com/VinderOrnitier/word-hunter.git
cd word-hunter
pnpm install
pnpm build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** on
3. Click **Load unpacked** and select the `dist/` directory
4. Pin the extension to the toolbar for quick access

## Development

```sh
pnpm install
pnpm dev      # vite build --watch
pnpm build    # production build
pnpm test     # run tests (Jest, jsdom)
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → **Load unpacked**). After a `pnpm dev` rebuild, click **Reload** on the extension card to pick up the changes.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for project layout, code conventions, and the PR process. The domain glossary is in [`CONTEXT.md`](CONTEXT.md); cross-cutting design choices are documented as ADRs in [`docs/adr/`](docs/adr/).

## Privacy

Word Hunter stores everything locally in your browser via `chrome.storage.local`. **No analytics, no telemetry, no first-party server.** The only outbound network call is to the public PokeAPI CDN for Pokémon sprite images, with no user identifiers attached.

Full details: [`PRIVACY.md`](PRIVACY.md).

## Contributing

Pull requests are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a non-trivial PR.

To report a vulnerability privately, see [`SECURITY.md`](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Vinder Ornitier.

Third-party content (Pokémon names and sprite art, PokeAPI, web fonts) is attributed in [`NOTICE.md`](NOTICE.md). Word Hunter is an **unofficial, non-commercial, fan-made** extension and is not affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, or The Pokémon Company.

## Acknowledgements

- [PokeAPI](https://pokeapi.co/) — community Pokédex CDN (CC0 sprite artwork)
- [Preact](https://preactjs.com/) — lightweight UI framework
- [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools) — Vite plugin for Chrome MV3 builds
- Fonts: Fraunces, JetBrains Mono, Space Grotesk — all under [SIL OFL 1.1](https://openfontlicense.org)

## AI Tooling

This project was developed with [Claude Code](https://claude.ai/code) using [Matt Pocock's skills](https://skills.sh/mattpocock/skills). Skill files live in `.agents/skills/` and are tracked in git — no install needed after cloning.

To update skills to their latest version:

```sh
pnpm dlx skills@latest add mattpocock/skills
```

## Version

`1.0.0` — first stable release: core game loop, Hunt Collection, two themes (Slate + Pokédex), and a localized UI (English, Ukrainian, German, Japanese). Prepared for the Chrome Web Store. See [`CHANGELOG.md`](CHANGELOG.md) for the full list.
