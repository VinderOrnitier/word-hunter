# GitHub repository settings — release readiness checklist

This is a one-time walk-through of the GitHub web UI settings that
should be in place before flipping the repository to public and before
the first stable release.

Everything below is configured through the GitHub UI (Settings tab) —
there is no file for it in the repo. Tick each item once it's set.

---

## 1. General (`/settings`)

- [ ] **Description** — set to: `Chrome extension where you hunt for a hidden word embedded invisibly in page text`
- [x] **Website** — set to the Chrome Web Store listing: `https://chromewebstore.google.com/detail/word-hunter/bjojlmdjfkkiiikpnklnahfnlohpeilp` (published 2026-06-03).
- [ ] **Topics** — add: `chrome-extension`, `browser-extension`, `mv3`, `preact`, `typescript`, `vite`, `word-game`, `gamification`, `vocabulary`. Topics drive GitHub search discoverability.
- [ ] **Social preview image** — upload a 1280×640 image (the "preview when shared on Twitter/Slack/Discord"). A clean screenshot of the popup or the in-page hidden-word effect works well.
- [ ] **Include in the home page** — leave default.
- [ ] **Default branch** — `master` (already correct).

### Features

- [x] **Issues** — keep on (already on; templates in [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/)).
- [ ] **Discussions** — turn on for Q&A and feature ideation; the issue tracker should stay focused on actionable work. Categories to seed: *Q&A*, *Ideas*, *Show and tell*.
- [ ] **Projects** — leave off unless you actually use Projects.
- [ ] **Wiki** — leave off; documentation belongs in the repo (`docs/`).
- [ ] **Sponsorships** — off for now.
- [ ] **Preserve this repository** — leave default (off).

### Pull Requests

- [ ] **Allow merge commits** — off.
- [x] **Allow squash merging** — on. Set the default commit message to *"Pull request title and description"* so the squash commit picks up the PR body, which the [PR template](../../.github/PULL_REQUEST_TEMPLATE.md) already structures.
- [ ] **Allow rebase merging** — off.
- [ ] **Always suggest updating pull request branches** — on.
- [ ] **Allow auto-merge** — on.
- [ ] **Automatically delete head branches** — on. Prevents stale `claude/*` and `feat/*` branches piling up after squash.

---

## 2. Rulesets → `master` branch protection

Path: **Settings → Rules → Rulesets** (the new GitHub Rulesets system, *not*
the legacy *Settings → Branches → Branch protection rules*). The active ruleset
is **"master branch protection"**.

- [ ] **Require a pull request before merging** — on.
  - [ ] **Required approvals** — `0` (solo project; CI is the quality gate).
  - [ ] **Dismiss stale pull request approvals when new commits are pushed** — on.
  - [x] **Require review from Code Owners** — **off** (deliberately disabled for
    solo development: code-owner review blocked the Dependabot automation
    workflow without any meaningful safety benefit; CI checks serve that role.
    See [`.github/workflows/dependabot-auto-approve.yml`](../../.github/workflows/dependabot-auto-approve.yml)).
- [ ] **Require status checks to pass before merging** — on.
  - [ ] **Require branches to be up to date before merging** — on.
  - [ ] Add the CI check: `Lint, typecheck, test, build` (appears in the list once [the CI workflow](../../.github/workflows/ci.yml) has run at least once).
- [ ] **Require conversation resolution before merging** — on.
- [ ] **Require signed commits** — optional; turn on once your local git is configured for GPG/SSH signing (otherwise it locks you out of merging your own PRs).
- [ ] **Require linear history** — on (matches squash-only policy).
- [ ] **Do not allow bypassing the above settings** — on (also enforces against admins; remove if it gets in the way of urgent fixes).
- [ ] **Allow force pushes** — off.
- [ ] **Allow deletions** — off.

---

## 3. Security (`/settings/security_analysis`)

- [ ] **Dependency graph** — on.
- [ ] **Dependabot alerts** — on.
- [ ] **Dependabot security updates** — on. ([`.github/dependabot.yml`](../../.github/dependabot.yml) already configures the weekly version updates; this is the orthogonal "patch CVEs immediately" channel.)
- [ ] **Dependabot version updates** — already configured via [`.github/dependabot.yml`](../../.github/dependabot.yml); no UI action needed.
- [ ] **Grouped security updates** — on (reduces PR noise).
- [ ] **Code scanning (CodeQL)** — set up using the default configuration. GitHub will auto-add a `.github/workflows/codeql.yml`. Languages to scan: `javascript-typescript`. Trigger: push to `master`, PRs to `master`, weekly schedule.
- [ ] **Secret scanning** — on.
- [ ] **Push protection** — on (blocks accidentally committed secrets at `git push` time).
- [ ] **Private vulnerability reporting** — on. This is what makes the email-based flow in [`SECURITY.md`](../../SECURITY.md) work end-to-end: reporters can also file a private security advisory directly through GitHub.

---

## 4. Actions (`/settings/actions`)

- [ ] **Actions permissions** — *Allow VinderOrnitier, and select non-VinderOrnitier, actions and reusable workflows* (already implicit). Restrict to verified creators if you want to be stricter.
- [ ] **Fork pull request workflows from outside collaborators** — *Require approval for first-time contributors*. Prevents drive-by PRs from burning CI minutes or exfiltrating secrets via a malicious workflow.
- [ ] **Workflow permissions** — *Read repository contents and packages permissions* (the more restrictive default). [`ci.yml`](../../.github/workflows/ci.yml) already declares `permissions: contents: read` explicitly per-workflow.
- [x] **Allow GitHub Actions to create and approve pull requests** — **on**
  (`GITHUB_TOKEN` must be able to create PR reviews for the Dependabot
  auto-approve workflow to work; see
  [`.github/workflows/dependabot-auto-approve.yml`](../../.github/workflows/dependabot-auto-approve.yml)).

---

## 5. Secrets and variables (`/settings/secrets/actions`)

None required for the initial public release. When the Chrome Web Store upload workflow is added, the following will be needed:

- `CWS_EXTENSION_ID` — the extension's ID in the Web Store.
- `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN` — OAuth credentials for `chrome-webstore-upload-cli`. See [Google's docs](https://developer.chrome.com/docs/webstore/api) for how to mint them.

Add these only when you're ready to wire up automated CWS uploads; the manual upload path doesn't need them.

---

## 6. After flipping the repository to public

- [ ] Confirm the README badges render (license, version, MV3) by visiting the repo home page.
- [ ] Verify Issues are public and the YAML form templates render correctly by clicking **New issue**.
- [ ] Open one throwaway PR from a feature branch to confirm the CI check appears as a required status before merge.
- [ ] Verify Dependabot has filed its first scan (Settings → Code security → Dependabot alerts).
- [ ] Verify Secret scanning has run by clicking **Code security → Secret scanning** (it scans the full history once on enablement).

---

## What this file is for

This is a one-shot setup record. There's nothing to keep in sync with code — re-read this only when the repo's security posture or release process actually changes. If you find drift between this checklist and the live UI, treat the UI as the source of truth and update the checklist.
