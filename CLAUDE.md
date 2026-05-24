## Agent skills

### Skill trigger rules

Before responding to a request, check whether any skill applies. Invoke the matching skill **before** generating a response. If unsure whether a skill fits, ask the user first.

| Trigger condition | Skill |
|---|---|
| User reports a bug, unexpected behavior, crash, or performance regression | `diagnose` |
| User wants to build a feature or fix a bug test-first; mentions TDD, red-green-refactor, or integration tests | `tdd` |
| User wants to improve architecture, find refactoring opportunities, clean up messy/coupled modules | `improve-codebase-architecture` |
| User has a plan or design and wants it challenged with clarifying questions (general) | `grill-me` |
| User has a plan or design and wants it stress-tested against the domain model / docs | `grill-with-docs` |
| User wants to formalize a discussion into a product spec or PRD | `to-prd` |
| User wants to break a plan/spec/PRD into GitHub issues | `to-issues` |
| User wants to create, triage, or review a bug/feature request issue | `triage` |
| User wants a security review of current branch changes | `security-review` |
| User wants a code review or PR review | `review` |
| User wants to prototype, mock up a UI, explore design options, or sanity-check a data model before committing | `prototype` |
| User wants to clean up or simplify recently changed code | `simplify` |
| User wants ultra-brief responses, says "be brief" / "less tokens" / "caveman" | `caveman` |
| User wants to hand off work to another agent or wrap up a session | `handoff` |
| User asks to build a web page, component, or app with high design quality | `frontend-design` |

### Visual work

For any UI component, layout, or visual asset — always invoke the `word-hunter-design` skill first.

### Issue tracker

Issues live in GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` at the root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.

### Localization

All user-visible strings must:
1. Use `useT()` in popup components or `t(key, locale)` in content scripts — never hardcoded.
2. Have the English string added to `src/i18n/messages/en.ts` with a descriptive key.

Translations for other locales (uk, de, ja) are added per milestone, not per feature.
