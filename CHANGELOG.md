# Changelog

All notable changes to Word Hunter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [1.0.0] - 2026-06-03

First public release — the initial stable build prepared for the Chrome Web Store.

### Added

- Dependabot `github-actions` ecosystem now groups **major, minor, and patch**
  updates into a single weekly PR (previously major updates arrived as
  separate PRs, bypassing the group).
- Public-release artifacts: `LICENSE` (MIT), `PRIVACY.md`, `SECURITY.md`,
  `NOTICE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.editorconfig`,
  GitHub issue / pull-request templates, `CODEOWNERS`, and `dependabot`
  configuration.
- Tooling: [Biome](https://biomejs.dev) for lint + format
  (`pnpm lint`, `pnpm format`), `tsc --noEmit` as `pnpm typecheck`, and a
  GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs
  lint → typecheck → test → build on every push and pull request.
- `.gitattributes` enforcing LF line endings across all text files,
  matching `.editorconfig` and Biome — ends the CRLF/LF tug-of-war on
  Windows working trees.
- `docs/release/github-settings.md` — one-time checklist for the GitHub
  repo settings that should be in place before the repo goes public
  (branch protection, Dependabot, CodeQL, secret scanning, allowed
  merge types, fork-PR workflow approval).
- `.github/workflows/dependabot-auto-approve.yml` — auto-approves and merges
  Dependabot PRs for the `github-actions` ecosystem once CI is green (npm
  updates are intentionally excluded and still require human review). Falls
  back to enabling GitHub's auto-merge via GraphQL when CI hasn't finished yet.
- `.github/workflows/release.yml` — tag-triggered release workflow:
  verifies tag matches `package.json#version`, builds, packages
  `dist/` as `word-hunter-v{version}.zip`, extracts the matching
  changelog section, and publishes a GitHub Release with the ZIP
  attached. Auto-marks `vX.Y.Z-rc*` tags as pre-releases.
- `docs/release/releasing.md` — the per-release walkthrough (version
  bump, changelog rotation, tag, troubleshoot).
- `docs/release/chrome-web-store.md` — Chrome Web Store submission
  checklist: single-purpose statement, permission justifications,
  full listing copy (short + detailed description), privacy-disclosure
  answers, screenshot and promo-tile specs, post-submission flow, and
  pointers to the automation work the
  [github-settings.md](docs/release/github-settings.md) secrets enable.
- Core gameplay: `HiddenWord` rendering via CSS `::before` on empty `<span>`s
  (invisible to Ctrl+F), `HintTimer`, `FindEvent` registration, and
  `CelebrationPopup`.
- `WordLists`: Animals (emoji art), Pokémon (PokeAPI sprite art), and
  user-typed Custom words.
- `HuntCollection` — Pokédex-style grid on the Play tab: one slot per word
  in the active list, three visual states (caught / uncaught / active),
  catch counter, progress bar, daily `Streak` (with grace-period rule —
  see ADR 004), and five `Achievement` badges.
- `AutoContinueMode` opt-in toggle: auto-picks the next word from the
  active list after each find. Top-right toast confirms the mode on every
  page load. Optional "Next up" preview in the celebration popup.
- `HuntRecords` — per-hunt statistics: word, duration, page URL and title,
  hint used, originating list.
- SPA support via `NavigationObserver` (re-injects on client-side
  navigation).
- Settings: hint delay, celebration duration, paragraph word threshold,
  per-toast notification toggles with master switch, auto-continue toggle,
  next-word spoiler toggle.
- Popup UI with Play, Stats, and Rules tabs; branded glyph button in the
  in-page toast that opens the popup.
- Localized UI in English, Ukrainian, German, and Japanese — `useT()` in the
  popup and `t(key, locale)` in content scripts; the active locale is
  persisted and applied to `<html lang>` for correct typography and a11y
  (see ADR 006). The extension `name`/`description` shown in
  `chrome://extensions` and the Chrome Web Store are also localized via
  `_locales/` (`__MSG_*__` manifest placeholders).
- Second theme — **Pokédex** — selectable from a theme picker alongside the
  default **Slate** skin. Both skins fork the entire popup and the in-page
  overlays (see ADR 007). Includes a per-glyph CJK font fallback so Japanese
  stays legible under the pixel/LCD Pokédex fonts.

### Changed

- License declared explicitly as MIT (previously the placeholder `ISC` in
  `package.json` with no `LICENSE` file).
- `package.json#version` is now the single source of truth for the
  extension version; `vite.config.ts` injects it into the built
  `dist/manifest.json` so `manifest.json` and `package.json` cannot drift.
- `manifest.json` version aligned from `1.0.0` to `0.1.0` to match
  `package.json`.
- Extension description rewritten as a single-purpose statement —
  `"A vocabulary game that hides a word invisibly in web-page text and
  lets you hunt for it as you read."` — and aligned across
  `package.json`, `manifest.json`, and the dist build. `package.json` is
  the source of truth; `vite.config.ts` now injects both `version` and
  `description` into `dist/manifest.json`. Matches the single-purpose
  statement in
  [docs/release/chrome-web-store.md](docs/release/chrome-web-store.md).
- `onlyBuiltDependencies` (for `unrs-resolver`) migrated from the
  deprecated `package.json#pnpm` field to `pnpm-workspace.yaml`, matching
  the pnpm 11 settings layout.
- Production bundle roughly halved (~1.5 MB → ~0.7 MB): a `dropLegacyWoff`
  Vite plugin emits `woff2` only, web fonts are subset to the character
  ranges actually shipped, and duplicate icon assets were de-duplicated.
- `host_permissions` narrowed from the whole `raw.githubusercontent.com`
  host to the two exact paths the extension fetches — the PokeAPI sprite
  repo and this project's `config/` directory — to request the minimum
  scope Chrome Web Store review expects.

### Fixed

- Test setup: missing `chrome` global stub in `tests/setup.ts` was causing
  7 of 47 suites to fail at module-import time. ([#34](https://github.com/VinderOrnitier/word-hunter/issues/34))
- `popup.css`: duplicate `transform` declaration in
  `.wh-stats__col-header--icon::after` (the second one overrode the
  starting state used by the hover transition).
- `word-renderer.ts`: removed unused `resolveArt` from the
  `WordRendererOptions` destructure.

[Unreleased]: https://github.com/VinderOrnitier/word-hunter/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/VinderOrnitier/word-hunter/releases/tag/v1.0.0
