# Privacy Policy — Word Hunter

_Last updated: 2026-06-03_

Word Hunter is a browser extension that helps you find a hidden word embedded
in the text of web pages you visit. This document explains exactly what
information the extension reads, stores, and transmits.

## TL;DR

- **All gameplay data stays on your device.** Nothing is sent to a server we
  control, because we don't operate any servers.
- **No analytics, no telemetry, no tracking.** There are no third-party
  analytics SDKs, no crash reporting, no usage metrics collection.
- **Two kinds of outbound network call, both to `raw.githubusercontent.com`
  and neither carrying user identifiers:** (1) Pokémon sprite images loaded
  on-demand from the public PokeAPI repository during gameplay, and (2) a
  small feature-flag file (`config/features.json`) fetched from this
  project's own repository on install and roughly once an hour, used to
  remotely toggle optional content such as the Pokémon list.
- **No account, no sign-in, no cloud sync.**

## Data the extension reads from web pages

To inject a hidden word into a paragraph, the content script reads:

- the text content of paragraphs on the active tab
- the page's `<title>` element
- the page URL

It does **not** read form fields, password inputs, cookies, local storage of
the visited site, or any other content unrelated to paragraph text.

## Data stored locally on your device

Stored via the standard Chrome Storage API in the extension's private
`chrome.storage.local` partition (not synced to Google Account, not shared
with other devices):

| Key | Contents |
|---|---|
| `finds` | List of completed hunts. Each entry contains: the word, timestamp, the URL and title of the page where it was found, hunt duration in seconds, whether a hint was used, and the source word list. |
| `settings` | Your preferences: hint delay, celebration duration, paragraph word threshold, notification toggles, auto-continue toggle. |
| `activeWord` | The current word the extension is hiding (so it persists across page reloads). |
| `selectedList` | Which word list you used most recently (Animals, Pokémon, or Custom). |

The page URL and title are stored because the in-app history view lets you
revisit the page where each word was found. This data never leaves your
browser unless you export it yourself.

## Data transmitted off your device

There are two types of outbound network request, both to
`raw.githubusercontent.com`:

- **Pokémon sprite images.** When showing a celebration animation or the
  Pokédex grid, the extension fetches `.gif` images from
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/{id}.gif`,
  where `{id}` is a Pokémon ID between 1 and 151. No cookies, no headers
  identifying you personally, and no information about which page you are
  viewing, are sent in these requests.
- **Feature-flag file.** On install and roughly once an hour, the extension
  fetches a small JSON file from
  `https://raw.githubusercontent.com/VinderOrnitier/word-hunter/master/config/features.json`.
  It contains only on/off switches (currently a single flag that can hide the
  Pokémon list) and lets us disable optional content remotely without shipping
  an extension update. The request sends no cookies and no identifying
  information; if it fails, the last cached value is used.

No other network requests are made by Word Hunter. There is no first-party
backend server.

## Third parties

| Party | What they receive | When |
|---|---|---|
| GitHub (`raw.githubusercontent.com` — hosts the PokeAPI sprites and our feature-flag file) | Your IP address and a request for a static file (standard HTTP request metadata) | Each time a Pokémon sprite is rendered, and on the roughly-hourly feature-flag check |

We do not embed third-party scripts, fonts loaded over the network,
advertising libraries, social-media widgets, or analytics SDKs.

## Permissions and why we need them

| Permission | Reason |
|---|---|
| `storage` | To save your finds, settings, and current word locally. |
| `activeTab` | To inject the hidden word into the page you are currently viewing. |
| `scripting` | To execute the content script that performs the injection. |
| `alarms` | To schedule the roughly-hourly check of the feature-flag file described above. |
| `<all_urls>` content script | The game works on any website, so the script must be allowed to run on all of them. |
| `host_permissions`: `raw.githubusercontent.com/PokeAPI/sprites/*` and `raw.githubusercontent.com/VinderOrnitier/word-hunter/*` | To fetch Pokémon sprite images and the feature-flag file. Scoped to those two paths only. |

The extension reads the content of web pages only through `activeTab` plus
the `<all_urls>` content script, which run only on the tab you are actively
using. The `host_permissions` above are limited to two static-file paths on
`raw.githubusercontent.com` and grant no access to the websites you browse.

## Children's privacy

Word Hunter is suitable for all ages. We do not knowingly collect any
information from children. Because the extension does not collect data
centrally, no age-related processing is performed.

## Your control over your data

- **Clear all data:** Open `chrome://extensions`, find Word Hunter, click
  Details → Site access / Storage, and remove the extension. All locally
  stored data is removed with it.
- **Export / import:** Not currently supported. (Tracked as a roadmap item.)
- **Delete a single record:** Use the in-popup hunt history view if available
  in your version.

## Trademark notice

Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak,
and The Pokémon Company. Word Hunter is an unofficial, non-commercial,
fan-made browser extension and is not affiliated with, endorsed by, or
sponsored by them. See [NOTICE.md](NOTICE.md) for full attribution.

## Changes to this policy

If we materially change how Word Hunter handles data, we will update this
file and bump the "Last updated" date above. Significant changes will also
be noted in [CHANGELOG.md](CHANGELOG.md).

## Contact

For privacy questions, vulnerability reports, or trademark concerns, contact:

- Email: `vinder.ornitier@gmail.com`
- GitHub: https://github.com/VinderOrnitier/word-hunter/issues (public issues
  only — for sensitive reports use the email above or
  [SECURITY.md](SECURITY.md))
