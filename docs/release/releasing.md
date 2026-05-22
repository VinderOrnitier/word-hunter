# Releasing Word Hunter

How to cut a new release of the extension. Releases happen rarely, so
this doc walks through every step explicitly.

## Prerequisites

- All changes for the release are merged into `master`.
- CI is green on `master`.
- You have push access to `master` and tag-creation rights.

## Steps

1. **Decide the version.** Follow [semver](https://semver.org/):
   `0.1.0 → 0.1.1` for patches, `0.2.0` for minor additions, `1.0.0`
   for the first stable release.

2. **Bump `package.json#version`:**

   ```sh
   npm version 0.1.0 --no-git-tag-version
   ```

   `vite.config.ts` will inject this into `dist/manifest.json` at
   build time, so no manual manifest edit is needed.

3. **Update `CHANGELOG.md`:**
   - Move the `[Unreleased]` section's contents under a new
     `## [0.1.0] - YYYY-MM-DD` heading.
   - Leave `[Unreleased]` in place but empty (or restore the
     `### Added / Changed / Fixed` placeholders).
   - Update the diff link at the bottom of the file if you keep one.

4. **Commit and push:**

   ```sh
   git add package.json CHANGELOG.md
   git commit -m "chore(release): v0.1.0"
   git push origin master
   ```

5. **Tag and push the tag:**

   ```sh
   git tag v0.1.0
   git push origin v0.1.0
   ```

6. **Wait for the release workflow.**
   [`.github/workflows/release.yml`](../../.github/workflows/release.yml)
   runs automatically and:
   - Verifies the tag (`v0.1.0`) matches `package.json#version`.
   - Runs `pnpm install --frozen-lockfile` and `pnpm build`.
   - Packages `dist/` as `word-hunter-v0.1.0.zip`.
   - Extracts the matching CHANGELOG section as release notes (falls
     back to `[Unreleased]` if a version-specific section doesn't
     exist).
   - Publishes a GitHub Release with the ZIP attached.

7. **(Manual) Upload to the Chrome Web Store.** Go to the
   [Developer Dashboard](https://chrome.google.com/webstore/devconsole),
   download the ZIP from the GitHub Release page, upload it, and
   submit for review. Automated CWS upload is intentionally out of
   scope for now — see [`github-settings.md`](github-settings.md) for
   the secrets that will be required if you wire it up later.

## Pre-releases

For release candidates and betas, use a suffix:

- `v0.1.0-rc1`
- `v0.1.0-beta.2`

The workflow detects the hyphen and marks the GitHub Release as a
pre-release automatically. Pre-releases are useful for asking testers
to load an unpacked ZIP before flipping the stable release switch.

## Recovering from a bad tag

If you tagged a commit and the workflow failed before publishing, or
the wrong commit was tagged:

```sh
# Delete locally and on origin
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0
```

Fix whatever broke (usually a CHANGELOG / version mismatch), then
retag and push.

If the workflow already published a GitHub Release, delete that
release in the GitHub UI before retagging — otherwise the
`softprops/action-gh-release` step will refuse to overwrite it.

## Troubleshooting

- **"Tag v0.1.0 does not match package.json version 0.0.9"** — you
  tagged without bumping `package.json`. Delete the tag (above), bump
  it, retag.
- **Workflow run fails with `403 / Resource not accessible`** — the
  workflow declares `permissions: contents: write` at the top, so
  this only happens if the org-level *Workflow permissions* setting
  is locked down further. Set *Settings → Actions → General →
  Workflow permissions* to *Read and write* (or grant only
  `contents:write` to this specific workflow).
- **`fail_on_unmatched_files`** — fires when the ZIP step produced
  the wrong filename. Re-check the `archive=` echo in the workflow
  logs.
