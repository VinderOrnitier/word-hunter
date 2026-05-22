# Contributing to Word Hunter

Thanks for your interest in helping out. Word Hunter is a small Chrome MV3
extension; contributions of all sizes are welcome, but please read this
guide before opening a non-trivial pull request.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Quick links

- [Domain glossary (`CONTEXT.md`)](CONTEXT.md) — vocabulary used throughout the codebase
- [Architecture Decision Records (`docs/adr/`)](docs/adr/) — cross-cutting design choices
- [Privacy policy (`PRIVACY.md`)](PRIVACY.md) — what data the extension touches
- [Security reporting (`SECURITY.md`)](SECURITY.md) — private disclosure channel
- [Issue triage labels](docs/agents/triage-labels.md)
- [Releasing](docs/release/releasing.md) — how to cut a new release (maintainer-only)

## Before you start

- For small fixes (typos, single-file bugs), open a PR directly.
- For anything that changes user-visible behavior, adds a permission, or
  touches the `HuntRecord` shape, **open an issue first** so we can agree
  on the approach before code is written.
- For features that span multiple areas, also check the existing ADRs —
  conflicts with an ADR should be called out explicitly in the issue.

## Development setup

Prerequisites: Node.js 20+, pnpm 11+.

```sh
pnpm install
pnpm dev        # vite build --watch
pnpm build      # production build (writes dist/)
pnpm test       # Jest
pnpm test:watch
pnpm lint       # Biome (lint + format check)
pnpm format     # Biome auto-fix (writes changes)
pnpm typecheck  # tsc --noEmit
```

CI runs `lint → typecheck → test → build` on every push and pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) — please run the
same chain locally before opening a PR.

Load the extension in Chrome:

1. `chrome://extensions`
2. Toggle "Developer mode" on
3. Click "Load unpacked" and select the `dist/` directory
4. Pin the extension to the toolbar for quick access

After `pnpm dev` rebuilds, click "Reload" on the extension card in
`chrome://extensions` to pick up the changes — content-script changes
also require reloading the host page.

## Project layout

```
src/
├── background/        # service worker (MV3 background)
├── content/           # content script + in-page UI (HiddenWord, HintTimer, etc.)
│   └── components/    # Preact components rendered into the page
├── popup/             # popup UI (Play, Stats, Rules tabs)
│   ├── components/    # shared UI primitives
│   ├── collection/    # HuntCollection grid + derivations
│   └── play/          # Play tab + ActiveWord card
├── shared/            # cross-context utilities (storage, word lists, types)
└── assets/            # bundled images (emoji fallbacks, placeholder sprites)
tests/                 # Jest suites mirroring src/ layout
docs/
├── adr/               # Architecture Decision Records
└── agents/            # docs for AI coding agents working in this repo
```

## Code conventions

- **TypeScript strict mode** is on. Don't suppress with `// @ts-ignore` or
  cast to `any` without a clear comment explaining why.
- **Preact** (not React) — keep components small, prefer functional with
  hooks, no `forwardRef` workarounds (Preact handles refs natively).
- **Domain vocabulary** — when naming functions, types, or tests, use the
  terms defined in [`CONTEXT.md`](CONTEXT.md) (`ActiveWord`, `HuntRecord`,
  `WordList`, `HiddenWord`, etc.). Don't drift to synonyms the glossary
  explicitly avoids.
- **No new runtime dependencies** without discussion in an issue — the
  bundle ships to every user on every page load.
- **Permissions** — adding a Chrome permission requires updating
  `manifest.json`, `PRIVACY.md`, and a note in the PR description
  explaining the user value.

## Testing

- Tests run under Jest with `jest-environment-jsdom`.
- The `chrome.*` global is stubbed centrally in
  [`tests/setup.ts`](tests/setup.ts) — extend that stub rather than mocking
  `chrome` per-test where possible.
- Co-locate test files under `tests/` mirroring the `src/` path.
- Preact components use `@testing-library/preact` — assert on visible
  output, not implementation details.
- For changes to gameplay logic (paragraph selection, hidden-word
  insertion, hunt-record derivation), add at least one unit test
  before merging.

## Commit & PR conventions

- Use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(scope): …`, `fix(scope): …`, `chore: …`, `refactor(scope): …`,
  `docs: …`, `test: …`.
- Scopes are by feature area, matching the directories above
  (`content`, `popup`, `settings`, `collection`, etc.).
- Keep PRs focused — one logical change per PR. Open a follow-up issue
  for "while I'm here" cleanups rather than mixing them in.
- Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md), including
  the verification checklist.
- Update [`CHANGELOG.md`](CHANGELOG.md) under `[Unreleased]` for any
  user-visible change.

## Issue triage

We use a small set of labels — see
[`docs/agents/triage-labels.md`](docs/agents/triage-labels.md) for the full
vocabulary. New issues land with `needs-triage`; a maintainer will
re-label as `needs-info`, `ready-for-agent`, `ready-for-human`, or
`wontfix`.

## Reporting security issues

Please **do not open a public issue** for security vulnerabilities. See
[`SECURITY.md`](SECURITY.md) for the private disclosure channel.

## Trademark notice

This extension references Pokémon names and loads sprite art from the
community PokeAPI CDN. See [`NOTICE.md`](NOTICE.md) for the full
disclaimer. If you're contributing a new WordList, please check that the
names involved are free of trademark or copyright complications, or that
you have permission to include them.

## License

By contributing, you agree that your contributions will be licensed under
the [MIT License](LICENSE) used by this project.
