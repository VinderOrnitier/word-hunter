# Security Policy

## Supported versions

Word Hunter is currently in active pre-release development. Only the latest
version published on the Chrome Web Store (or, until then, the latest
release tag on this repository) is supported with security fixes.

| Version | Supported |
|---|---|
| latest release | yes |
| older releases | no |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Use one of these private channels instead:

1. **GitHub Security Advisory** (preferred) — go to
   https://github.com/VinderOrnitier/word-hunter/security/advisories/new
   and submit a draft advisory. This keeps the discussion private until a
   fix is ready.
2. **Email** — send a description to `vinder.ornitier@gmail.com` with
   `[word-hunter security]` in the subject line. PGP is not currently set
   up; please do not include exploit code in plaintext if it would be
   harmful to disclose accidentally.

Please include:

- A clear description of the issue and its potential impact
- Steps to reproduce, or a minimal proof-of-concept
- The affected version (commit SHA or release tag)
- Your suggested remediation, if you have one

## What to expect

This is a maintained pet project, not a commercial product. There is **no
formal SLA**, but the maintainer will try to:

- Acknowledge your report within 7 days
- Provide an initial assessment within 14 days
- Release a fix for confirmed critical issues within 30 days, faster if
  actively exploited

Reports that turn out to be confirmed vulnerabilities will be credited in
the changelog and (with your permission) in the public advisory after a
fix is shipped.

## Out of scope

The following are explicitly out of scope for security reports:

- Issues that require an attacker to have already installed a malicious
  extension on the user's browser
- Behavior of pages a user visits while Word Hunter is active (the
  extension reads page text but does not alter it in security-relevant
  ways)
- Findings against the PokeAPI CDN, GitHub-hosted assets, or any third
  party — please report those upstream
- "Best practice" suggestions without a demonstrated attack scenario
- Social engineering, physical attacks, or denial-of-service against the
  extension's local storage

## Coordinated disclosure

We follow a standard 90-day disclosure window from the date a report is
acknowledged. If a fix is not feasible within that window we will discuss
an extension with you. Public disclosure before a fix is published is
discouraged but ultimately at the reporter's discretion.

Thank you for helping keep Word Hunter and its users safe.
