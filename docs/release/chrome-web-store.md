# Chrome Web Store submission checklist

Everything you need to assemble before pushing the first stable release
to the Chrome Web Store. Keep this file up to date as the product
changes — small updates here are much cheaper than re-doing the listing
under review pressure.

This document is the **content side** of CWS submission. The mechanical
side (build, ZIP, GitHub Release) lives in
[releasing.md](releasing.md). The repo-settings side lives in
[github-settings.md](github-settings.md).

## Prerequisites

- A Google account dedicated to the developer profile (recommended: a
  separate Gmail you control, not your day-to-day one).
- Chrome Web Store Developer registration (one-time **$5 USD** fee).
  Sign up at https://chrome.google.com/webstore/devconsole.
- A signed GitHub Release with the `word-hunter-vX.Y.Z.zip` artifact
  (produced by
  [`.github/workflows/release.yml`](../../.github/workflows/release.yml)).
- A public URL serving the privacy policy (see
  [Privacy disclosure](#privacy-disclosure)).
- A local smoke-test of that exact ZIP — load it as an unpacked
  extension and walk through
  [`tests/fixtures/smoke-checklist.md`](../../tests/fixtures/smoke-checklist.md).
  Never submit a build you have not played.

## Single-purpose statement

CWS requires a clear single-purpose declaration in the listing form.
Paste this verbatim:

```
Word Hunter hides a single word invisibly inside web-page text and lets
the user hunt for it as they read. The extension does one thing: it
picks a word from the active word list, embeds it in a paragraph on the
current tab, and records finds locally.
```

If the product ever grows a second user-facing purpose, this statement
**and** the listing copy must be revisited together — divergence is one
of the most common rejection reasons.

The shorter form of the same statement is the extension's localized
`description`. `manifest.json` uses the `__MSG_description__` placeholder,
which Chrome resolves from
[`_locales/<locale>/messages.json`](../../_locales) — `en` is the canonical
copy, with `de`/`ja`/`uk` translations — so the extension card in
`chrome://extensions` and the per-locale CWS listing tell the same story.
The English copy:

```
A vocabulary game that hides a word invisibly in web-page text and lets you hunt for it as you read.
```

Treat [`_locales/en/messages.json#description`](../../_locales/en/messages.json)
as the source of truth, and keep
[`package.json#description`](../../package.json) (npm metadata) identical to
it. Re-wording the description requires re-wording the single-purpose
statement above, the English message, and the `de`/`ja`/`uk` translations —
and vice versa.

## Listing copy

CWS shows several text fields to users. Treat them as marketing
surface; they are indexed for in-store search.

### Name

```
Word Hunter
```

(Max 75 characters; we use 11. Do not append a tagline here — there is
a separate field for that.)

### Short description (also called "summary")

Required. Max 132 characters. Shown in store search results and on the
listing card.

```
Hunt for a hidden word secretly embedded in every web page you read. A vocabulary game woven into your browsing.
```

(112 characters.)

### Detailed description

Required. Max 16,000 characters. Plain text with line breaks; **no
markdown is rendered** by CWS.

```
Word Hunter turns any web page into a vocabulary puzzle.

Each time you load a page, a single word from your chosen word list is
secretly hidden inside one of the paragraphs. The word is invisible to
your eye and to Ctrl+F. As you read naturally, you look for it. When
you spot it, you click it — and the hunt is complete.

FEATURES
• Curated word lists — Animals, Pokémon, or your own custom list
• Hunt Collection — a Pokédex-style grid that fills up as you catch words
• Daily streak counter and five achievement badges
• Per-word art — emoji for the Animals list, animated sprites for Pokémon
• Two visual themes — a clean "Slate" skin and a retro "Pokédex" skin,
  switchable any time
• Multilingual interface — English, Ukrainian, German, and Japanese
• Auto-Continue mode — auto-picks the next word after each find, so
  reload-to-keep-playing just works
• Optional hint timer — a small tooltip appears after a configurable
  delay if you get stuck
• Configurable minimum paragraph length — keeps the game out of
  navigation bars and one-line widgets
• Works on any website thanks to the activeTab permission

PRIVACY FIRST
• Your progress stays 100% local — stored in your browser, never on a server
• No analytics, no telemetry, no tracking
• No account, no sign-in, no cloud sync
• Outbound requests go only to GitHub's raw-content CDN: Pokémon sprite
  images and a tiny feature-toggle file. No user identifiers are ever sent

OPEN SOURCE (MIT)
Source code, issues, and discussions:
https://github.com/VinderOrnitier/word-hunter

Privacy policy:
https://github.com/VinderOrnitier/word-hunter/blob/master/PRIVACY.md

The Pokémon word list is an unofficial, non-commercial, fan-made
feature. Word Hunter is not affiliated with, endorsed by, or sponsored
by Nintendo, Game Freak, or The Pokémon Company.
```

### Category

Primary: **Fun** (or **Games**, depending on the catalog at submission
time — CWS reshuffles its top-level categories occasionally).

Secondary positioning is implicit through the description; CWS only
asks for one category.

### Language

Primary language: `English (United States)`.

The extension's `name` and `description` are localized: `manifest.json` uses
the `__MSG_name__` / `__MSG_description__` placeholders, resolved from
`_locales/{en,de,ja,uk}/messages.json`, so `chrome://extensions` and the
Chrome Web Store show the translated name and description in German,
Japanese, and Ukrainian automatically.

The CWS *listing page* (short/detailed description, screenshots) is a
separate, English-only surface entered in the Developer Dashboard. To
localize the full listing, add the target locales in the dashboard and
translate the listing copy there — tracked under
[Open questions and future work](#open-questions-and-future-work).

## Permission justifications

CWS asks for a justification for every permission and every host
pattern. These must match what the extension actually does — review
staff are very literal about wording, and mismatches between
justification and code are a common rejection cause.

| Permission / host | Justification (paste into CWS form) |
|---|---|
| `storage` | Persist the player's progress — completed hunts, the current active word, and user settings — across page loads and browser restarts. Data stays on the device; the extension does not sync to any account or external server. |
| `activeTab` | Inject the hidden word into the page the user is currently viewing. Access is granted by the browser only for the tab the user has actively engaged with; no background tabs are read. |
| `scripting` | Run the content script that locates a suitable paragraph and inserts the invisible word. Required by Manifest V3 to perform any dynamic DOM modification. |
| `alarms` | Schedule a roughly-hourly background check that fetches a small feature-flag JSON file (see the `host_permissions` row). Used only to toggle optional content (e.g. hide the Pokémon list) remotely without shipping an update; no user data is involved. |
| `<all_urls>` content script | The game is designed to work on any web page the player visits while reading. The script reads only paragraph text and inserts a single CSS-rendered `<span>`; it never reads form inputs, password fields, cookies, or site-local storage of the visited site. |
| `host_permissions`: `https://raw.githubusercontent.com/PokeAPI/sprites/*` and `https://raw.githubusercontent.com/VinderOrnitier/word-hunter/*` | Fetch Pokémon sprite images (from the public PokeAPI sprite repository) and the feature-flag file (from this extension's own repository). Scoped to those two static-file paths only; no other origin is accessible. No cookies or identifiers are sent. |

### What we DO NOT request (state explicitly if a reviewer asks)

- The only `host_permissions` are the two `raw.githubusercontent.com`
  static-file paths in the table above (Pokémon sprites + feature-flag
  file). No host permission is requested for the sites the user browses —
  page access is via `activeTab` + the `<all_urls>` content script only.
- No `tabs` permission — the service worker calls `chrome.tabs.query` only
  to obtain tab IDs for message passing. Without the `tabs` permission it
  cannot read tab URLs, titles, or favicons, and it does not.
- No `webRequest` or `declarativeNetRequest` — no network interception.
- No `cookies` — the extension does not read cookies.
- No `<all_urls>` host permission for the service worker — only the
  content script matches `<all_urls>`, and only while the user has
  activated the tab.
- No remote code execution — all JavaScript is bundled at build time
  (Vite + `@crxjs/vite-plugin`). No `eval`, no remote script loading,
  no dynamic `import()` of external URLs.

## Privacy disclosure

CWS's "Privacy practices" section asks several yes/no questions. The
honest answers for Word Hunter:

| Question | Answer |
|---|---|
| Does this extension handle personal communications? | No |
| Does it handle personally identifiable information? | No |
| Does it handle financial or payment information? | No |
| Does it handle authentication information? | No |
| Does it handle personal health information? | No |
| Does it handle location? | No |
| Does it handle web history? | **Yes** — the extension stores the URL and `<title>` of each page where the user completed a hunt, so the in-app history view can link back to it. This data never leaves the device. |
| Does it handle user activity? | **Yes** — the extension records that the user clicked the hidden word (a "find" event) along with hunt duration. Local-only. |
| Does it handle website content? | **Yes** — the content script reads paragraph text to choose where to embed the hidden word. The text is not stored or transmitted. |
| Is the data sold to third parties? | No |
| Is the data used or transferred for unrelated purposes? | No |
| Is the data used to determine creditworthiness or for lending purposes? | No |

**Privacy policy URL** (paste into the CWS field):

```
https://github.com/VinderOrnitier/word-hunter/blob/master/PRIVACY.md
```

Keep [`PRIVACY.md`](../../PRIVACY.md) in sync with what we declare
here. If the answer to any question above changes, update both files in
the same pull request.

## Screenshots

CWS requires **at least one** screenshot. Aim for **4–5** for a polished
listing.

- Format: PNG or JPEG.
- Dimensions: **1280×800** preferred, or 640×400.
- Fill the frame — avoid large empty margins; CWS crops aggressively in
  card views.
- Keep any text overlay legible at small thumbnail size.

Recommended shots, in order:

1. **Hunt Collection (Pokédex grid)** — popup open on the Play tab,
   several slots caught, progress bar visible. This is the visual hook;
   put it first.
2. **In-page hidden word + hint toast** — show the hint tooltip near a
   paragraph on a real-looking article (use
   [`tests/fixtures/smoke-article.html`](../../tests/fixtures/smoke-article.html)
   so the shot is reproducible).
3. **Celebration popup** — a mid-animation frame on a find. Mid-confetti
   is fine and conveys motion.
4. **Settings tab** — toggles and sliders, so the user understands the
   game is configurable.
5. **Achievements** — the badge row, with one or two unlocked.

If you have room for a sixth shot (or want to swap one in), include the
**theme picker** showing the Slate and Pokédex skins side by side — the
second skin is a strong visual differentiator. The localized UI is also
worth one shot if you target the uk/de/ja markets.

Store the final screenshots under `docs/screenshots/` so the
[README.md](../../README.md) can reuse them and so they stay version-
controlled alongside the listing copy.

## Promotional images (optional but boosts ranking)

| Asset | Size | Required? |
|---|---|---|
| Small promo tile | 440×280 | Strongly recommended — used on the listing card |
| Marquee promo tile | 1400×560 | Optional — used in editorial-feature spots |

Keep them brand-clean: extension name + tagline + one prop element from
the UI (e.g. a stylized Pokédex slot). Do **not** reproduce any Pokémon
logos or wordmarks — see [`NOTICE.md`](../../NOTICE.md). The promo art
must read at the smallest size the store ever renders it, which is
roughly the size of a favicon.

## Submission checklist

In order, before clicking "Submit for review":

- [ ] Real release tag pushed (e.g. `v0.1.0`), GitHub Release built,
      ZIP downloaded locally.
- [ ] Local smoke test of that exact ZIP (load unpacked) — checklist in
      [`tests/fixtures/smoke-checklist.md`](../../tests/fixtures/smoke-checklist.md).
- [ ] All 4–5 screenshots produced at 1280×800 and stored in
      `docs/screenshots/`.
- [ ] 440×280 promo tile produced.
- [ ] Listing copy reviewed for typos and length.
- [ ] [`PRIVACY.md`](../../PRIVACY.md) is up to date and reachable at
      its GitHub URL.
- [ ] Permission justifications copy-pasted into the CWS form match the
      table above word-for-word.
- [ ] Single-purpose statement matches the section above.
- [ ] Developer contact email is one you actively monitor — CWS uses
      it for review feedback, and you only have ~7 days to reply before
      a rejection becomes permanent for that submission.
- [ ] No console errors on `chrome://extensions` for the loaded build.
- [ ] Tested the unpacked extension on Chrome stable, latest version.

## After submission

- **First-time review:** typically 1–3 business days, occasionally
  longer (up to a few weeks) if the reviewer asks clarifying questions
  or routes the listing to a specialist.
- **Status** is visible at
  https://chrome.google.com/webstore/devconsole.
- **If rejected:** the rejection email lists the specific policy
  section that was violated. Address the issue, bump the version
  (`pnpm version patch --no-git-tag-version`), tag a new release,
  upload the new ZIP. There is no "appeal" workflow — just resubmit.
- **Once published**, the listing URL takes the shape
  `https://chromewebstore.google.com/detail/<extension-id>`. Update:
  - [README.md](../../README.md) Installation section
  - The `homepage` field in [package.json](../../package.json)
  - The "Website" field in
    [`github-settings.md`](github-settings.md) (Section 1)
  - Any social-media announcement

## Updates after the first publish

Subsequent releases follow [`releasing.md`](releasing.md):

1. Tag and push as usual — the GitHub Release workflow runs.
2. Download the new ZIP from the GitHub Release.
3. CWS Developer Dashboard → your extension → **Upload new package**.
4. Update screenshots and listing copy **only if** the feature surface
   actually changed — gratuitous re-edits can re-trigger a full review
   cycle.
5. Submit for review.

Patch updates that do not change permissions are usually reviewed
within 24 hours.

## Open questions and future work

- **Automate the CWS upload step** via
  [`chrome-webstore-upload-cli`](https://github.com/fregante/chrome-webstore-upload-cli)
  triggered from
  [`.github/workflows/release.yml`](../../.github/workflows/release.yml).
  The secrets needed are already enumerated in
  [`github-settings.md`](github-settings.md) (Section 5):
  `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`,
  `CWS_REFRESH_TOKEN`.
- **Hosted privacy policy on a custom domain.** Store reviewers
  occasionally flag GitHub-hosted policies as "unstable" even though
  they work fine in practice. A static page on a dedicated domain
  removes that risk.
- **Localized listings** — the extension's manifest name/description are
  already localized via `_locales/` (de/ja/uk). What remains is localizing
  the Chrome Web Store *listing page itself* (short + detailed description,
  screenshots) by adding those locales in the Developer Dashboard and
  translating the copy there.
- **Promotional video** — CWS supports a YouTube video URL in the
  listing. A 30-second screen capture of a full hunt would meaningfully
  raise the conversion rate of the listing page.
