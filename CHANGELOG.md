# Changelog

All notable changes to Word Hunter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Pre-release. Not yet published to the Chrome Web Store.

### Added

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
- `.github/workflows/release.yml` — tag-triggered release workflow:
  verifies tag matches `package.json#version`, builds, packages
  `dist/` as `word-hunter-v{version}.zip`, extracts the matching
  changelog section, and publishes a GitHub Release with the ZIP
  attached. Auto-marks `vX.Y.Z-rc*` tags as pre-releases.
- `docs/release/releasing.md` — the per-release walkthrough (version
  bump, changelog rotation, tag, troubleshoot).
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

### Changed

- License declared explicitly as MIT (previously the placeholder `ISC` in
  `package.json` with no `LICENSE` file).
- `package.json#version` is now the single source of truth for the
  extension version; `vite.config.ts` injects it into the built
  `dist/manifest.json` so `manifest.json` and `package.json` cannot drift.
- `manifest.json` version aligned from `1.0.0` to `0.1.0` to match
  `package.json`.
- `onlyBuiltDependencies` (for `unrs-resolver`) migrated from the
  deprecated `package.json#pnpm` field to `pnpm-workspace.yaml`, matching
  the pnpm 11 settings layout.

### Fixed

- Test setup: missing `chrome` global stub in `tests/setup.ts` was causing
  7 of 47 suites to fail at module-import time. ([#34](https://github.com/VinderOrnitier/word-hunter/issues/34))
- `popup.css`: duplicate `transform` declaration in
  `.wh-stats__col-header--icon::after` (the second one overrode the
  starting state used by the hover transition).
- `word-renderer.ts`: removed unused `resolveArt` from the
  `WordRendererOptions` destructure.

[Unreleased]: https://github.com/VinderOrnitier/word-hunter/commits/master
