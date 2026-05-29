# Word Hunter — Design System

A design system for **Word Hunter**, a Chrome extension where the player searches for a word that's been invisibly hidden in the text of any web page.

The product picks a word from a chosen list (Animals, Pokémon, or a custom string), inserts it into a long enough paragraph using a CSS `::before` trick that bypasses Ctrl+F, and rewards the player with a celebration animation when they click the word they spotted. There is one product surface today (the Chrome extension popup) plus an in-page overlay layer (hint toast, the celebration popup, the no-paragraph toast, the auto-mode toast).

This system is **derived from the live `master` branch**, not the initial PRD. Where this document mentions a behaviour, it's because that behaviour ships in production today.

## Sources

- **Codebase**: `word-hunter/` — Chrome extension (Manifest V3). Vite + Preact. Vanilla TypeScript content scripts.
  - `CONTEXT.md` — domain language and UI architecture decisions (canonical vocabulary)
  - `docs/PRD.md` — feature spec, user stories, technical solution for the Ctrl+F bypass
  - `docs/adr/003-hunt-collection-derivation.md` — Hunt Collection is derived on-the-fly from `HuntRecord[]`; no separate storage key
  - `docs/adr/004-streak-grace-period.md` — one-day grace period for the daily Streak
  - `docs/adr/005-auto-continue-mode.md` — Auto-Continue chooses the next word inside the content script `FindEvent` handler
  - `src/popup/` — App.tsx + `tabs/{PlayTab,StatsTab,SettingsTab,RulesTab}.tsx`
  - `src/popup/components/` — Button · Input · Field · Tabs · Badge · Icon · PopupHeader · BottomActionBar · ConfirmOverlay · SearchableSelect · Select · Highlight · Card · Eyebrow
  - `src/popup/play/` — ActiveWordCard · ProgressRow · CustomWordModal · ReloadHint
  - `src/popup/collection/` — CollectionGrid · CollectionSlot + the four pure derivation functions
  - `src/popup/styles/popup.css` — popup layout & component CSS (resolves through `--wh-*` tokens)
  - `src/shared/styles/tokens.css` — authoritative source of `--wh-*` tokens (this file mirrors it into `colors_and_type.css`)
  - `src/shared/art-resolver.ts` — maps `(word, source)` to its art (emoji for Animals, PokeAPI sprite URL for Pokémon)
  - `src/content/` — paragraph selector, word renderer, hint timer, celebration manager, find handler, auto-mode toast, no-paragraph toast
  - `src/content/components/{CelebrationPopup,InPageToast,HiddenWord,HiddenWordHost}.tsx`
  - `src/content/styles/overlay.css` — in-page overlay CSS (loaded into the content bundle)
  - `src/assets/logo.png` — the real brand mark (`W` on a dark slate tile with a yellow highlighter stripe under it)
  - `public/icons/` — 16/32/48/128 px PNG manifest icons (toolbar / Web Store only — not used inside the popup UI)
- **No Figma file** was provided.

## Brand position

The brand direction is **grounded in two things the product is built around**:

1. **The hunt** — the player is *looking* for something. Magnifying-glass / highlighter / detective vibes.
2. **The reading surface** — the word lives inside other people's text. The extension's UI must feel quiet enough to share a screen with The New York Times, Wikipedia, or a Substack post.

The result is **"highlighter on slate"**: a deep dark UI with a single warm-amber accent that mirrors the highlighter mark a reader makes when they spot something. One bright moment per surface.

The Hunt Collection (the Pokédex-style grid that fills the Play tab) is a deliberate counterweight: the grid is *the only place* in the system where joy is allowed to be a bit louder than the rest — emoji art, sprite silhouettes, a progress bar, achievement chips. Everything else stays marginalia.

The brand mark on the logo doubles as a manifesto: a slab "W" sits on the slate, and a horizontal yellow stripe runs across its baseline. That stripe is the same highlighter mark the player makes when they spot the active word. Wherever the logo appears (header, in-page toast), it carries that contract.

## Index

```
README.md                  ← you are here
SKILL.md                   ← cross-compatible Agent Skills entry
colors_and_type.css        ← all design tokens for the default (slate) theme
                              — mirror of src/shared/styles/tokens.css

themes/
  theme-pokedex.css        ← Pokédex theme — parallel skin, all --pdx-* tokens
                              + theme primitives (key cap, LCD, lens, slot, etc.)

assets/
  logo.png                 ← the brand mark (used everywhere — popup header, in-page toast)
  icon16.png  icon48.png  icon128.png   (manifest icons; not used in UI)

preview/                   ← cards rendered into the Design System tab

  logo.html
  iconography.html

  colors-brand.html        colors-surfaces.html
  colors-foreground.html   colors-semantic.html

  type-display.html        type-scale.html        type-mono-word.html
  highlighter.html         spacing.html           radii.html
  shadows.html             motion.html

  components-popup-header.html
  components-tabs.html

  components-buttons.html        components-inputs.html         components-badge.html
  components-card.html           components-chips.html
  components-modal.html          components-confirm-overlay.html
  components-reload-hint.html
  components-switch.html         components-range-slider.html
  components-searchable-select.html

  components-active-word-card.html
  components-progress-row.html
  components-bottom-action-bar.html
  components-collection-slot.html       components-collection-grid.html

  components-table-row.html      components-stats-tooltips.html

  components-toasts.html         components-celebration.html

ui_kits/
  extension-popup/         ← popup recreation (note: pending refresh against master — see Open questions)
  in-page-overlay/         ← in-page recreation (note: pending refresh against master — see Open questions)
```

---

## CONTENT FUNDAMENTALS

The codebase has little user-facing copy — what exists is sober, mechanical, and brief. This system **leans into that** rather than dressing it up. Word Hunter is a quiet game; the copy should feel like marginalia, not marketing.

### Voice

- **Calm and observational, not hype.** The product is a reading game. Treat the player like an attentive reader, not a player to be entertained.
- **Second person, addressing the player directly.** "you found", "your hunts", "no word selected". Avoid "I" — there is no character speaking *to* the player.
- **Active and present.** "Find the word", not "Words can be found". "5 hunts logged", not "Has logged 5 hunts".
- **Plain English.** The domain has its own precise vocabulary (see `CONTEXT.md`) — use it consistently in *labels*, soften it in *copy*. A user-facing string can say "found word"; a JSON key is `huntRecord`.

### Domain vocabulary (canonical — from `CONTEXT.md`)

| Use | Don't use |
|---|---|
| Word | target, search term |
| Active word | current word, selected word |
| Word list | bank, category, set |
| Paragraph | text block, element |
| ParagraphGroup | merged paragraphs, text section |
| Hint | help, clue |
| Found / find | discovered, located, spotted |
| Hunt | game, round, session |
| Catch / caught | hit, score, collected (used only on the Collection) |
| Streak | run, chain |
| Collection | dex, grid, catalogue |
| Achievement | badge, trophy, medal |
| Auto-Continue | autoplay, continuous mode, auto-mode |
| Review click | second click, repeat click |

### Casing

- **Sentence case for everything UI**: buttons, headers, menu items, table headers, settings labels. ("New word", "Hint delay", "Reload hint" — not "New Word", "Hint Delay".)
- **Title case is not used.**
- **Words from the lists keep the casing the source intended**: `cat`, `Pikachu`. Animals are lowercase; Pokémon are capitalized.
- **The product name is "Word Hunter"** — both words capitalized, always.
- **"Auto-Continue"** is hyphenated and capitalised in body copy; the storage key is `autoContinue` (camelCase).

### Punctuation

- Sentences in body copy end in periods.
- Labels and buttons do not. ("New word" not "New word.")
- Em-dashes (—) are welcome for parenthetical asides — they suit the editorial feel of a reading tool.
- No exclamation marks outside the celebration popup. The single allowed exclamation is the find: **"Found!"**

### Numbers & durations

- Numerals always (`5 hunts`, `2 minutes`).
- Compact UI: `14s`, `2m 03s`, `12d streak` — terse, no spaces around units.
- Body copy: `2 minutes`, `7 days` — with spaces, written out.

### Emoji & icons in copy

- **No emoji in copy.** No ✓ / → / ★ inside body text either. Use real SVG icons via `<Icon>`.
- Emoji *art* in the Collection grid is content (the species mark for Animals), not copy.

### Tone examples

| Surface | Bad (too hype) | Good |
|---|---|---|
| Empty stats | "🎉 Time to start your hunting adventure!" | "No words found yet." |
| Hint toast | "Pssst! There's a hidden word here 👀" | "The word is hidden on this page." |
| No paragraph | "Sorry! This page is too short ☹️" | "Not enough text to hide the word." |
| Found word | "AMAZING! YOU GOT IT!" | "Found! 12s · no hint" |
| Settings label | "How long until we help you?" | "Hint delay" |
| Active word state | "Currently hunting:" | "Active word" |
| Empty collection | "No catches yet — let's go!! 🐾" | "No caught words yet — go hunt!" |
| Locked achievement hint | "You haven't done this yet!" | "Catch 7 more to reach 50%" |
| Auto-mode toast | "Auto-mode is ON! 🎯" | "Auto-Hunter active" |
| Reload hint | "Click here to start playing!" | "Reload the page to begin hunting." |

### Vibe in one line

> Marginalia, not megaphone. The product whispers. The found-word moment is the only time it allows itself a flourish — and even then, it's a single highlighter stroke, not a confetti cannon.

---

## THEMES

Word Hunter ships with **two themes** the player can choose between in Settings. The two themes are deliberately built as **parallel skins**, not as token overrides of each other.

| Theme | Slug | Tokens prefix | Vibe |
|---|---|---|---|
| **Slate** (default) | `slate` | `--wh-*` | "Highlighter on slate" — dark, quiet, marginalia |
| **Pokédex** | `pokedex` | `--pdx-*` | "Game-device" — raspberry shell, cyan LCD, key caps, LED accents |

### Why parallel, not override?

We considered the simpler approach — keep one set of `--wh-*` tokens and have each theme redefine their *values* via `[data-theme="…"]` scopes — and rejected it. The two themes diverge on more than colour:

- **Different DOM structure.** Pokédex LCD wells need scan-line + glare overlay siblings, key caps need the border-bottom-width 3D trick. The slate theme has neither, and shouldn't carry tombstone elements "just in case".
- **Different font families and scales.** Press Start 2P at 12px ≈ Space Grotesk at 18px in horizontal advance. A shared `--font-size-md` token would have to be themed too, defeating the point.
- **Different on-foreground rules.** Pokédex's correct text colour depends on which surface (`--pdx-on-shell` / `--pdx-on-lcd` / `--pdx-on-key` / `--pdx-on-primary`) — slate has one foreground family.
- **Different voice in copy.** Slate uses sentence case ("Caught", "Settings"); Pokédex uses ALL CAPS PIXEL labels and abbreviations ("CGHT", "SETS"). The copy fork is real.

The two themes share what's genuinely portable (spacing scale, popup dimensions, data computations, domain vocabulary) and fork everything else cleanly.

### Architecture

```
design-system/
├── colors_and_type.css           ← slate tokens (kept at root for back-compat)
├── themes/
│   ├── theme-pokedex.css         ← pokedex tokens + theme primitives
│   └── POKEDEX-IMPLEMENTATION.md ← production build map (codebase mapping + traps)
├── preview/                      ← slate preview cards
├── preview/pokedex/              ← pokedex preview cards (7 pages + icons.js)
└── ui_kits/
    ├── extension-popup/          ← slate-skinned popup recreations
    ├── extension-popup-pokedex/  ← pokedex popup (index.html + popup.css + icons.js)
    ├── in-page-overlay/          ← slate-skinned in-page recreations
    └── in-page-overlay-pokedex/  ← pokedex in-page (scene.html + icons.js)
```

**In the live extension**, the skin fork lives at the React-tree level. Each top-level surface (PlayTab, StatsTab, SettingsTab, Rules, CelebrationPopup, InPageToast, ReloadHint) gets two implementations — a slate one and a pokedex one — sharing the same data hooks and the same domain logic underneath. The setting is read once on mount; switching themes prompts a popup re-open (acceptable trade-off — re-renders that span font family and DOM shape are not free).

> **Implementing this in the live code?** Read **`themes/POKEDEX-IMPLEMENTATION.md`** — it maps every design-system artifact to its codebase destination, gives a build order, and documents the five traps we already hit (missing `.pdx` scope class, font metric reflow, the iconify-icon race, grid column/child mismatch, switch-cap `box-sizing`).

### Coverage contract

The Pokédex theme covers **every player-facing surface** the slate theme covers. Specifically:

- **Popup chrome** — header, tabs, all four tab bodies (Play / Stats / Settings / Rules), action bars, the custom-word modal, the clear-hunts confirm overlay
- **In-page overlays** — the celebration popup, the three InPageToast variants (hint / info / auto-mode), the no-paragraph toast
- **The hidden-word treatment itself** — the highlighter that appears under the word once it's found. Pokédex variant: a yellow LED rectangle with a pixel-art outline behind the word, dark-navy text on top. See `.pdx-highlight` in `themes/theme-pokedex.css`.
- **Iconography** -- slate uses Lucide stroke icons; Pokedex uses the **Pixelarticons** set by Gerrit Halfmann (open source, MIT, ~486 icons on a strict 24x24 pixel grid) loaded via Iconify. The roles are identical (search / bar-chart / settings / info / play / shuffle / pencil / refresh / star / chevron / target / timer / check / x / trash / external) -- the icon mapping lives in `preview/pokedex/iconography.html` next to the live preview.

### Semantic token mapping — how the six roles cross over

Slate's semantic accents map to Pokédex's physical-device equivalents:

| Role | Slate (`--wh-*`) | Pokédex (`--pdx-*`) | Metaphor |
|---|---|---|---|
| primary | highlighter yellow `#FFD23F` | yellow LED `#FFD23F` | the hunt cue (same hex, different vehicle — stripe vs LED dot) |
| found | mint `#5EE3A1` | green LED `#2FD46E` | a registered catch — Pokédex green is more saturated, reads as LED-on |
| info | sky blue `#8AB4FF` | blue lens `#2A85D6` | system communicating quietly — Pokédex re-uses the camera-lens hue |
| selected | sky blue `#8AB4FF` | blue lens `#2A85D6` | a slot picked but not yet started |
| warning | soft amber `#FFA862` | soft amber `#FFA862` | reserved for both themes — same hex |
| danger | red `#FF6B6B` | red LED `#FF3B3B` | destructive confirm — Pokédex red is fully saturated |

The slate `--wh-primary` highlighter-yellow and the Pokédex `--pdx-led-yellow` use the same hex (`#FFD23F`) on purpose — it's the one piece of brand DNA the two themes share. In Slate it's a stripe; in Pokédex it's a dot.

### Copy contract — voice differs between themes

Both themes use the same **vocabulary** (the canonical domain table — Active word, Hunt, Streak, Caught — stays). They diverge on **voice**:

| Aspect | Slate | Pokédex |
|---|---|---|
| Casing | Sentence case ("Caught", "Settings") | ALL CAPS for labels & buttons ("CAUGHT", "SETS") |
| Length | Plain English, breathable | Abbreviated where space tight ("CGHT" / "MISS" / "ANIM" / "POKE") |
| Punctuation | Periods on sentences; em-dashes welcome | Periods rare; "!" on action verbs ("GO HUNT!", "FOUND!") |
| Tone | Observational, marginalia | Imperative, game-device prompt |
| Editorial italic | Reserved Fraunces moments ("pick a word below to start the hunt.") | None — italic doesn't read on a pixel grid |

Example translation:

| Slate | Pokédex |
|---|---|
| "No caught words yet — go hunt!" | "NO CATCHES — GO HUNT!" |
| "Active word" | "NOW HUNTING" |
| "Hint delay" | "HINT DELAY" (same string, all-caps) |
| "Reload the page to begin hunting." | "RELOAD TO HUNT" |
| "Found! 12s · no hint" | "FOUND!" + LCD line `12s · no hint` |

### What's shared regardless of theme

- **Popup dimensions** — `360 × 560`. Product constraint, not a theme decision.
- **Tab structure** — Play / Statistics / Settings, with Rules as a header-info toggle.
- **Spacing scale** — `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`. Both themes import the same base.
- **Domain vocabulary** — Active word, Hunt, Catch, Streak, Collection. Identical across themes.
- **Data computations** — `computeCatchCounts`, `computeCollectionStats`, `computeStreak`, `listAchievements`, `pickRandomWord`. Theme-agnostic.
- **Storage keys** — `huntRecord`, `autoContinue`, `minWordThreshold`, etc. Adding the new `theme` key for the user's choice.

### Theme storage and switching

- New `theme: "slate" | "pokedex"` setting persisted via `chrome.storage.sync` (same store as the rest of settings).
- Default is `"slate"` for both new installs and any record that pre-dates this change.
- The Settings tab gains a theme picker — two preview-tile radio cards, each a tiny mock of the popup in that theme.
- Switching themes prompts a popup re-open via a small inline notice ("reopen the popup to apply") — accepted trade-off, see Architecture above.
- The content script reads the theme on injection; in-page overlays match the popup. If the player switches mid-page, already-injected overlays keep their original theme until the page reloads (cheap and consistent with how other settings behave today).

### Brand contract for the Pokédex theme

The slate theme's brand position ("marginalia, not megaphone") is **explicitly suspended** inside `.pdx`. The Pokédex theme is allowed to be loud — that's its whole point. Its own contract:

- **One device, one screen.** Every surface should read as if it's stamped on or displayed through the same physical handheld. No mixing skeumorphisms (no skeuomorphic LCD on slate, no flat surfaces inside Pokédex).
- **Yellow LED is still the brand moment.** Used for active state, found celebration, primary CTA. Not for incidental decoration.
- **All caps is the voice, not the volume.** Loud casing, quiet copy. Don't add exclamation marks to compensate for losing italic.
- **Pixel art is the icon language.** No stroke icons; no emoji. Lucide is forbidden inside `.pdx`. We use Pixelarticons by Gerrit Halfmann (MIT) via Iconify; the role mapping lives in `preview/pokedex/iconography.html`.
- **Three fonts, no more.** Press Start 2P (labels stamped on the device), VT323 (LCD output), Space Grotesk (body / helper copy where pixel hurts legibility).

The Pokédex theme has the same **"one bright moment per surface"** rule as slate. The brand-yellow LED earns its brightness by being the only saturated element on its surface; the cream key caps and raspberry shell stay quiet around it.

---

## VISUAL FOUNDATIONS

## Color tokens — reference

This section enumerates every accent / semantic token so future surfaces know which to reach for.

| Token | Used for | Notes |
|---|---|---|
| `--wh-primary` / `--wh-primary-soft` | the hunt — CTA, active word ring, focus glow, highlighter | one and only brand accent |
| `--wh-found` / `--wh-found-soft` | celebration / success | CelebrationPopup border + glow |
| `--wh-info` / `--wh-info-soft` | informational blue — the system communicates quietly | hint toast, ReloadHint, stats hint-dot, link icon |
| `--wh-selected` / `--wh-selected-soft` | selection / pending state | is-pending slot, current-streak value |
| `--wh-warning` / `--wh-warning-soft` | soft heads-up (between primary CTA and danger) | reserved — no surface uses it today |
| `--wh-danger` / `--wh-danger-soft` | destructive confirm | Clear hunts, Action footer confirm mode |
| `--wh-list-animals` | Animals list theming | alias of `--wh-found` (shares mint hex by design) |
| `--wh-list-pokemon` | Pokémon list theming | `#FF8AC2` — the only list-specific hue |

### Legacy aliases

Kept so codebase CSS that references the old names keeps compiling. Prefer the new tokens for any new code.

| Old | Resolves to |
|---|---|
| `--wh-hint` | `var(--wh-info)` |
| `--wh-hint-soft` | `var(--wh-info-soft)` |

The split: `--wh-hint` used to do duty across seven unrelated surfaces (game help, selection, instructions, links, streak state, hint-dot indicator). Splitting into `--wh-info` (the message family) + `--wh-selected` (the state family) lets each surface advance independently without a token rename. Both tokens resolve to the same hex today; promote to distinct hues only if a surface ever needs to show both at once.

### Color

- **Dark by default.** `--wh-bg: #0B0F19` (deep slate). The UI sits on top of paper-feeling surfaces (`--wh-surface: #151B2C`, `--wh-surface-2: #1F2740`, `--wh-surface-3: #2A334D`) — *never* pure black.
- **One brand accent: the highlighter.** `--wh-primary: #FFD23F` is reserved for the active-word state, the highlighter underline, the Start-a-hunt CTA, and focus rings (`--wh-shadow-glow`). It earns its brightness by being the only one.
- **Semantic accents stay quiet** (see the table above for the full split).
- **Word-list colors** distinguish lists everywhere: Animals reuses the success-mint via `--wh-list-animals` (alias of `--wh-found`); Pokémon has its own pink (`--wh-list-pokemon`). Custom words have no colour — they're `--wh-fg-3`.
- **No purple/blue gradients.** No glassmorphism. No neon.

### Typography

- **`Space Grotesk`** for everything UI. Geometric, slightly playful, reads cleanly at 12 px (which the popup needs).
- **`JetBrains Mono`** for *the word* — the active-word display, the word-list options, the hidden word's reveal in stats, the catch-counter chip, the custom-word input, the searchable-select dropdown. Mono-spaced text *means something* in this product: it's the thing being hunted.
- **`Fraunces` (italic)** is reserved for one editorial moment per surface — the "pick a word below to start the hunt." line under the empty ActiveWordCard, and the "your hunts will appear here." line in the empty Stats state. Used as flavor; never as a UI workhorse.
- Sizes: `11 / 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48`. Popup body is `14px`; mono word display at `16px`; very-tight popup chrome down to `9–11px` for eyebrow labels and counters.
- Tracking is tight on display (`-0.01em`), snug on heading-2 (`-0.005em`), normal on body, wide caps on eyebrow labels (`+0.08em`).

### Spacing

- **4 px base.** Scale: `0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`.
- Popup is dense — most components sit in 6–12 px gaps; only major sections (between footer and content) get 14+.
- Use `gap` on flex/grid containers, never per-child margins.

### Backgrounds

- **No imagery.** No hand-drawn illustrations. No repeating patterns. No grain.
- **No gradients** on surfaces or buttons. The only gradient in the system is the *highlighter underline* (which is technically a stripe) and the inline `linear-gradient` that paints the range-slider's filled-vs-empty track.
- `--wh-surface` / `--wh-surface-2` / `--wh-surface-3` form a three-step elevation language for backgrounds. That's the whole story.

### Borders

- **1 px hairlines** (`--wh-border: #2A334D`, `--wh-border-soft: #1C2238`) on cards, inputs, dividers.
- **No 2 px borders.** No double borders. No animated borders.
- Border radius scale: `4 / 8 / 12 / 16 / 999`. Inputs and buttons → `8`. Cards → `12`. Pills/chips → `999`. Small chrome (the stop button on ActiveWordCard, the modal close, value-chip on range slider) → `4`.

### Shadows

Three elevation levels plus two focus glows:

- `--wh-shadow-1` — sits-on-page (subtle 1 px and 2 px combined). Used by the ActiveWordCard, ProgressRow row, chip-group selected state.
- `--wh-shadow-2` — raised (cards in the popup, dropdown menus, tooltips).
- `--wh-shadow-3` — overlay (the celebration popup, the in-page toast, the CustomWordModal).
- `--wh-shadow-glow` — `0 0 0 4px var(--wh-primary-soft)` — the focus ring and the active-slot ring. Always 4 px.
- `--wh-shadow-glow-found` — same shape, found-mint instead of primary. Used on the celebration modal.

The BottomActionBar and the Settings footer carry a unique upward shadow: `0 -6px 14px rgba(0, 0, 0, 0.25)`. It's the only "anti-shadow" in the system — used because both surfaces sit at the bottom of the popup chrome and need to read as floating above the scrolling body.

The primary CTA in the BottomActionBar carries a tinted bloom: `0 4px 12px rgba(255, 210, 63, 0.25)`. It's the only place the primary colour appears as a shadow.

There is **no inner shadow** on inputs. Inputs depend on `--wh-surface-2` + a 1 px border for affordance instead.

### Hover & press states

- **Hover on buttons**: lift one surface step (`--wh-surface-2` → `--wh-surface-3`).
- **Hover on the primary button**: brighten the yellow slightly (`#FFD23F` → `#FFDC5C`); text stays `--wh-on-primary`.
- **Press**: a 1 px translate-down (`transform: translateY(1px)`).
- **Hover on rows / list items**: `background: var(--wh-surface-2)`. No underline-on-hover for non-link items.
- **Disabled**: `opacity: 0.45`, `cursor: not-allowed`. No greyscale filters.

### Focus

- **Always visible**, always the primary glow ring. `outline: none; box-shadow: var(--wh-shadow-glow);` — uses the same yellow as the highlighter so the focus state is on-brand, not a generic browser default.

### Transparency & blur

- **Transparency lives in the `*-soft` color tokens** (`--wh-primary-soft`, `--wh-found-soft`, `--wh-hint-soft`, `--wh-danger-soft`) — used for tinted backgrounds on chips, ReloadHint, focus glows, the achievement-pill family.
- **No backdrop blur in the popup chrome itself.** Chrome popups are small and solid; blur looks fake on a flat dark background.
- **Backdrop blur is allowed on two surfaces**: the in-page overlays (Celebration popup, InPageToast — they overlay a real web page and the blur preserves host-page legibility) and the CustomWordModal backdrop (it covers the popup body and the 6 px blur gives a slight depth cue).

### Animation

- **Easing**: `--wh-ease-standard` (`cubic-bezier(0.2, 0.8, 0.2, 1)`) for almost everything. `--wh-ease-pop` (overshoot) reserved exclusively for the celebration popup entrance. `--wh-ease-out` for outgoing transitions.
- **Durations**: `120 / 200 / 360 ms`. Micro-interactions are 200 ms. The celebration is 360 ms. CSS-tooltips reveal in `--wh-dur-fast`.
- **No bouncy/spring animations except on the celebration.** The rest is calm.
- **No fade-only transitions** for entering elements — always pair fade with a small `translateY(4px)` so it feels intentional. The settings footer slides in from `+8 px` (a touch more dramatic because it's a chrome surface arriving).
- **`@media (prefers-reduced-motion: reduce)`** disables the progress-row fill animation and chevron rotation. (Other surfaces should follow.)

### Layout rules

- **Popup is `360 × 560`.** Fixed. Tokens: `--wh-popup-width: 360px; --wh-popup-min-h: 560px`. Body has `overflow: hidden`; scroll happens *inside* tab panels (`.wh-tab-panel`, `.wh-play__scroll`, `.wh-settings__scroll`) which have hidden scrollbars.
- **Header is fixed-top, tabs are sticky-top, main scrolls beneath.** The Play and Settings tabs add a sticky-bottom action surface (BottomActionBar / Settings footer).
- **In-page overlays** are `position: fixed`, `z-index: 2147483000` (chosen high enough to clear most host-page UIs without hitting the int32 ceiling).
- **The CustomWordModal backdrop is `position: absolute`, not `fixed`** — it only covers the popup interior, never the page.

### Cards

`background: var(--wh-surface)`, `border: 1px solid var(--wh-border)`, `border-radius: var(--wh-radius-3)`, `box-shadow: var(--wh-shadow-2)`. Padding is `16 px` for compact, `24 px` for comfortable.

ActiveWordCard is the tighter sibling: smaller padding (`10px 12px`), shadow-1 instead of shadow-2, and the art-square overlap on the left adds enough visual weight that the shadow can be soft.

**Cards never have a colored left-border accent.** (Anti-trope.)

### Imagery

There is no imagery in the brand chrome. The only "art" the system uses is per-word **content** art: emoji for Animals, PokeAPI sprite for Pokémon, a pencil glyph as the placeholder for Custom. These render at `26 px` (emoji) / `36–48 px` (sprite) inside the 40 × 40 art square of ActiveWordCard and the slot art square (`max-width: 48px; max-height: 48px`); sprites use `image-rendering: pixelated`.

---

## ICONOGRAPHY

### Approach

- **Lucide** is the icon system. Stroke-based, 1.5–2 px stroke, 24 px viewbox.
- Implemented inline as a single `<Icon>` component (`src/popup/components/Icon.tsx`) — no CDN dependency in the popup; the SVG paths live in the codebase. Easy to fork an icon if needed.
- **Filled mode** flips fill to `currentColor` — used for the play glyph in the Start-a-hunt CTA and the unlocked-achievement star.
- **No emoji in chrome.** No unicode-as-icon (✓ / → / ★ inside body text).
- **No PNG icons inside the popup UI.** The PNG icons under `public/icons/` are only for the extension's manifest (browser toolbar / Chrome Web Store).

### The four navigation icons that matter most

These appear repeatedly across both surfaces. They should always render at `14` or `16 px` inside the popup, `20–24 px` in the in-page overlay:

- **`search`** — the Play tab and the empty Stats state
- **`bar-chart`** — the Statistics tab
- **`settings`** — the Settings tab
- **`info`** — the Rules info button in the header and the in-page no-paragraph toast

### The full icon set used today

`search · bar-chart · settings · info · play · shuffle · pencil · refresh · star · chevron-down · target · timer · check · x · trash · external`

See `preview/iconography.html` for the rendered set.

### The brand mark

The brand mark ships at `src/assets/logo.png` (and is mirrored to `assets/logo.png` in this skill). It's the only piece of brand artwork in the system. It renders at three sizes:

- **72 × 72** — the lockup display in `preview/logo.html` (system documentation only)
- **28 × 28** — the header glyph in PopupHeader
- **20 × 20** — the leading button inside InPageToast (clickable: sends `OPEN_POPUP` to the service worker)

The previous `wordmark.svg` and `glyph.svg` placeholders have been removed — the PNG ships as the production asset.

### Font substitution flag

The system uses **Space Grotesk**, **JetBrains Mono**, and **Fraunces** — bundled via `@fontsource` packages and imported in `main.tsx` (i.e. self-hosted, no Google Fonts request at runtime). If the team standardises on Geist or another house typeface, swap `--wh-font-sans` and re-test the popup at 360 px width.

---

## POPUP SHELL

The popup is `360 × 560`. It has three structural surfaces stacked vertically:

```
┌─────────────────────────────────────┐
│  PopupHeader   logo · "Word Hunter" │ ← fixed
│                          [info]     │
├─────────────────────────────────────┤
│  Tabs  Play · Statistics · Settings │ ← sticky
├─────────────────────────────────────┤
│                                     │
│  <tab body — scrolling>             │
│                                     │
├─────────────────────────────────────┤
│  Action bar / Settings footer       │ ← sticky (Play & Settings)
└─────────────────────────────────────┘
```

### PopupHeader

Glyph (28 × 28 rounded-6) + "Word Hunter" wordmark (Space Grotesk 18 / 700 / tight) on the left. A 30 × 30 transparent `info` button on the right toggles the Rules view into the main panel. When Rules is active the info button colours itself `--wh-primary` and tints to `--wh-surface-2`.

> **Changed from initial spec.** Rules used to be a fourth tab. It was pulled into a header button so the three real game tabs (Play / Statistics / Settings) keep their full width.

See `preview/components-popup-header.html`.

### Tabs

Three tabs, each `flex: 1`. Sticky-top under the header. Active tab takes `--wh-fg` colour and a 2 px `--wh-primary` bottom border. Hover lifts the inactive label from `--wh-fg-3` to `--wh-fg-2`.

When Rules is open the active tab does *not* highlight — the Rules panel replaces the tab body but doesn't claim a tab identity (closing Rules drops you back into Play).

See `preview/components-tabs.html`.

### Tab panels

Each panel scrolls vertically inside its allotted height with hidden scrollbars (`scrollbar-width: none`, `::-webkit-scrollbar { display: none; }`). The Play and Settings panels switch to `display: flex; flex-direction: column` and surrender padding control to the scroll wrapper inside — that's because both have a non-scrolling action surface at the bottom.

---

## PLAY TAB

The Play tab is the product's primary surface. It scrolls between a sticky-top tab nav and a sticky-bottom action bar.

### Vertical anatomy

```
┌── wh-play__scroll (the scrolling region) ──┐
│                                            │
│   ReloadHint (conditional)                 │
│   ActiveWordCard                           │
│   Chip-group · list   (Animals / Pokémon)  │
│   ProgressRow                              │
│   Chip-group · filter (All / Caught / …)   │
│   CollectionGrid                           │
│                                            │
└────────────────────────────────────────────┘
┌── BottomActionBar (sticky) ────────────────┐
│  [↺] [Start a hunt]    [⤺] [✎]            │
└────────────────────────────────────────────┘
```

### ActiveWordCard

`wh-active-card`. A horizontal card with a 40 × 40 art square (yellow border + primary glow), the eyebrow `Active word`, the word itself in mono-18-bold, and a 28 × 28 stop button.

The art square is the strongest visual anchor in the whole product — it's the only place outside the celebration popup where the primary colour acts as a steady ring. Pokémon sprites render at 36 × 36 inside it (pixelated); Animals emoji at 26 px; Custom words show a pencil glyph at 18 px.

**Empty state** drops the glow, drops the shadow, and replaces the body with a Fraunces-italic invitation: *"pick a word below to start the hunt."*

See `preview/components-active-word-card.html`.

### ProgressRow

`wh-progress-row`. A single horizontal button — `caught/total` count (mono-11-semibold) · slim 4 px progress bar (primary fill, surface-2 track) · an `unlocked/total` achievement chip with a star icon · chevron. Click to expand.

When expanded, an inner panel reveals:

- A **Streak block** — `Streak` eyebrow + `Xd current` (in hint-blue) and `Yd longest` (in `--wh-fg-2`) separated by a 1 px divider.
- A dashed divider.
- All five **Achievement** pills (`First catch` / `Half-way` / `Master hunter` / `7-day streak` / `30-day streak`). Locked pills drop to `opacity: 0.45` with a fg-4 star and carry a `title` hint ("Catch 7 more to reach 50%").

The expansion is transient — closing the popup loses the open state. The expanded button takes `--wh-surface-2` so the row feels connected to the panel below.

> **Replaced.** ProgressRow supersedes the older standalone ProgressHeader card. Same data sources (`computeCollectionStats`, `computeStreak`, `listAchievements`), denser footprint.

See `preview/components-progress-row.html`.

### Chip-group (segmented)

`wh-chip-group`. Pill track on `--wh-surface` with a 1 px `--wh-border-soft` border; each chip `flex: 1` (when full-width in the play tab) or auto (compact). Selected chip drops to `--wh-surface-2` with shadow-1.

Two instances on Play: the **list picker** (Animals / Pokémon) and the **filter** (All / Caught / Uncaught).

See `preview/components-chips.html`.

### CollectionGrid + CollectionSlot

4-column grid for Animals (54 slots), 5-column for Pokémon (151 slots). `gap: 8px`. Each slot is a square (`aspect-ratio: 1 / 1`) on `--wh-surface-2` with a `--wh-border-soft` hairline.

**Slot states** ladder as `caught` or `uncaught` (art treatment) — then additive overlays on top:

| State | Art rule |
|---|---|
| `caught · animal` | the species emoji at 26 px with a drop-shadow filter |
| `uncaught · animal` | mono `???` placeholder in `--wh-fg-4` |
| `caught · pokémon` | full-colour PokeAPI sprite, `image-rendering: pixelated`, max 48 × 48 |
| `uncaught · pokémon` | same sprite, filtered `brightness(0) opacity(.35)` (silhouette) |
| `is-active` (additive) | `--wh-primary` 1 px border + `--wh-shadow-glow` |
| `is-pending` (additive) | `--wh-hint` 1 px border + `0 0 0 4px var(--wh-hint-soft)` |

The `is-pending` state is **new**: it's the visual signal between "user clicked a slot" and "user pressed Start a hunt". The slot wears a cool-blue twin to the yellow active ring so the player can see they're holding a fresh pick, distinct from the live ActiveWord.

**Catch counter** chip (`wh-slot__count`) sits absolute-positioned at bottom-right of caught slots — mono-10, semibold, on a translucent slate pill.

> **Consider:** `is-pending` reuses `--wh-hint`. That token is otherwise reserved for "informational blue" (the hint toast). A future `--wh-selected` or `--wh-pending` token would disambiguate; for now the metaphor reads (blue = "pending, awaiting confirmation") and adding a token without changing the colour would be busywork.

See `preview/components-collection-slot.html`, `preview/components-collection-grid.html`.

### Empty states

- `filter = caught` with no catches yet → "No caught words yet — go hunt!" in `.wh-collection-empty` (dashed border, `--wh-fg-3`).
- `filter = uncaught` with a fully-completed list → "Every word in this list is caught."

### BottomActionBar

`wh-action-bar`. Sticky, edge-to-edge, top-border + downward shadow. From left to right:

1. **Auto-Continue toggle** — 42 × 42 icon button with the `refresh` glyph. `role="switch"` + `aria-checked`. When on, the icon takes `--wh-primary` and the title-tooltip clarifies *"Auto-continue — pick next word after each find"*.
2. **Start a hunt** — primary CTA, `flex: 1`. Carries the `play` glyph (filled), Space-Grotesk-14-bold, on the brand-yellow with a 12 px amber bloom shadow. Disabled until the player has picked a word (from the grid or the shuffle).
3. **Shuffle** — 42 × 42 icon button (`shuffle` glyph). Picks a random uncaught word from the active list (fallback to the full list when complete).
4. **Custom word** — 42 × 42 icon button (`pencil` glyph). Opens the CustomWordModal.

> **Consider:** Auto-Continue visual signal is subtle (icon color flip only). A tiny dot on the icon, or a chip badge somewhere on the action bar, could communicate "auto-continue is running" more clearly without cluttering the bar. Worth a UX pass once we have real-user feedback.

See `preview/components-bottom-action-bar.html`.

### CustomWordModal

`wh-modal__backdrop` + `wh-modal__dialog`. Modal absolute-positioned over the popup interior only (never the host page). Backdrop is `rgba(11, 15, 25, 0.7)` + 6 px backdrop-blur. Dialog on `--wh-surface` with shadow-3.

Header: "Custom word" title + 28 × 28 close button (`x` glyph). Body: a single `Field` with `Word` label, mono input, counter (`X / 25`), helper / error slot. Footer: `Cancel` (ghost) + `Start hunt` (primary).

**Validation pattern**:
- Errors are suppressed until the player attempts to submit (the `submitAttempted` ref).
- After the first submit, validation becomes real-time and the input gains `.wh-input--error` + a soft danger glow.
- Counter goes danger-red when the word is over the 25-char limit.

Focus traps inside the dialog (Tab cycles between input ↔ Cancel ↔ Start hunt). Esc and backdrop click close it.

See `preview/components-modal.html`.

### ReloadHint

`wh-reload-hint`. A translucent hint-blue card that appears at the top of the Play scroll region *after* the player starts a hunt. Fires `chrome.scripting.executeScript` on the active tab to `window.location.reload()` so the player doesn't need to leave the popup.

Anatomy: info glyph (with a `title` nudge — *"Can be disabled in Settings."*) — message — `Reload` CTA — `×` dismiss.

Gated by the `showReloadHint` setting (default on, disabled on the Settings tab).

> **Consider:** colour family overlaps with the in-page hint toast. They sit in different surfaces (popup vs host page) and serve different audiences, but the design system should be honest that `--wh-hint` does double duty — see *Hint blue does double duty* in **Open questions** below.

See `preview/components-reload-hint.html`.

### Custom-word note

The Custom-word block exists only as a power-user escape hatch — the input is inside its own modal, and `WordSource = "custom"` words never appear in the CollectionGrid. They also opt out of Auto-Continue (no list to cycle through).

---

## STATISTICS TAB

The Stats tab is denser than Play — five-column grid (`1.4fr · 1fr · 0.8fr · 20px · 20px`) for each row. Header eyebrow `N hunts` + a ghost `Clear` button on the right.

### Header confirm flow

Clicking `Clear` arms the **Action footer** in confirm mode — a sticky-bottom panel that slides up with `Clear all hunts?` + `Cancel` (ghost) / `Yes, clear` (danger). Uses the `useConfirmAction` hook for the two-step arm-then-confirm pattern. This is the same chrome as the Settings save footer (see below) — one component, two modes.

See `preview/components-confirm-overlay.html`.

### Row anatomy

| Column | Width | Style |
|---|---|---|
| Word | `1.4fr` | mono-12-medium, leading list-color dot (6 px), truncates with ellipsis |
| Found (relative time) | `1fr` | mono-11, `--wh-fg-3` |
| Duration | `0.8fr` | mono-11, `--wh-fg-3` |
| Hint indicator | `20px` | 7 px dot — hollow border = no hint, filled hint-blue = used |
| Page (external link) | `20px` | `external` glyph in `--wh-hint` |

The duration column header is an **icon** (`timer`), not text — there's no room for both a 10 px caps label and a numeric column at 360 px popup width. The icon header carries its own CSS tooltip (`data-tooltip="Duration"`).

> **Changed:** the hint column used to be a text label ("used" / "—"). It's now a 7 px dot — filled `--wh-hint` when hint was used, hollow 1.5 px `--wh-fg-4` border when not. Two opposite visual states, no negative connotation either way.

See `preview/components-table-row.html`.

### CSS-only tooltips

Used pervasively in the Stats tab: every cell that may not fit its content (word, page URL) and every icon-header carries a `data-tooltip="…"` attribute and renders the tooltip with a `::after` pseudo-element.

Pattern in one snippet — see `preview/components-stats-tooltips.html` for the canonical CSS. Anchoring variants: above-center (default), above-left, above-right (so a flush-right link doesn't push its tooltip off-screen).

> **Consider:** the pattern is duplicated four times across `popup.css` (`.wh-stats__col-header--icon::after`, `.wh-stats__word::after`, `.wh-stats__hint::after`, `.wh-stats__link::after`). A single mixin / utility class (`.wh-tooltip[data-tooltip][data-tip-anchor="…"]`) would make it cheaper to add new tooltipped cells.

### Empty state

`wh-stats__empty` — centered column with a 28 px `search` icon, the body line "No words found yet.", and the Fraunces-italic flavor line "your hunts will appear here." Sits high (32 px top padding) so it doesn't feel anchored to the page.

---

## SETTINGS TAB

Form layout — vertical stack of `Field` rows in a scrolling region, with a conditional sticky footer.

### Fields shipped today

| Label | Control | Range / type | Helper |
|---|---|---|---|
| Minimum paragraph length | **range slider** | 30 → 150, step 10, default 30 | "paragraphs below this word count are skipped" |
| Hint delay | numeric input + `min` unit | int, min 1 | "minutes the page is open before the hint tooltip shows" |
| Cursor reveal delay | numeric input + `s` unit | float, min 0.1, step 0.1 | "seconds of hovering before the cursor reveals the word" |
| Reload hint | **switch** | bool, default on | "prompt to reload the page after starting a hunt" |
| Show next word preview | **switch** | bool, default on | "Reveal the upcoming word in the celebration popup when Auto-Continue is on" |

`celebrationHoverSeconds` keeps its storage key but the UI label is now "Cursor reveal delay" — the behaviour drives the `pointer` cursor reveal on hover over the hidden word, not the celebration popup directly.

### Switch

`wh-settings__switch`. 32 × 18 track, 14 px thumb, pill radius. **Off** → `--wh-surface-3` track + `--wh-fg` thumb + `Off` text in fg-3. **On** → `--wh-primary` track + `--wh-on-primary` (near-black) thumb + `On` text in primary. The explicit text label is kept because the bare track is too small to scan at popup density.

See `preview/components-switch.html`.

### Range slider

`wh-settings__range`. 4 px track painted as an inline `linear-gradient` (primary up to value, surface-2 after); 18 px thumb with a 2 px primary border on a `--wh-bg` fill. Hover fills the thumb soft-primary and scales to 1.15; active state fills solid primary and scales to 0.96; focus draws the standard `--wh-shadow-glow` ring.

A mono value-chip sits to the right of the track — primary text on `--wh-primary-soft`, 36 px min-width, center-aligned.

See `preview/components-range-slider.html`.

### Settings footer · save mode of the Action footer

`wh-settings__footer`. Sticky-bottom. Appears only when `draft !== saved` (i.e. there are unsaved edits). Mirrors the BottomActionBar's chrome — top border, downward shadow — and slides in from `+8 px`. Contents: ghost `Cancel` (revert to saved) + primary `Save`. Both are size-`sm`.

This is the **save mode** of the unified Action footer pattern. The same chrome handles destructive confirms in Stats (confirm mode), giving the popup a single sticky-bottom transient-actions language.

---

## RULES

The Rules view replaces the tab body when the header info button is active. Sober copy with the editorial italic line ("a quiet game while you read.") followed by the paragraph and a three-row list (30+ word threshold, 1× active word, no-paragraph behaviour). Uses `wh-rules__marker` for the leading number — mono-12, semibold, `--wh-primary`.

The `<code>Ctrl + F</code>` keyboard-shortcut treatment is `wh-rules__kbd` — mono-11 inside a `--wh-surface-2` pill with a 1 px `--wh-border` hairline, 4 px radius. The only "kbd-style" element in the system.

---

## IN-PAGE OVERLAYS

These render through content scripts onto the host web page. They share the highest `z-index: 2147483000` so they sit above virtually any host-page chrome.

### InPageToast (`hw-toast`)

**One component, three semantic variants** (one proposed).

| Variant | Position | Border | Used by | Status |
|---|---|---|---|---|
| `hint` | `top-right` | `1px solid var(--wh-hint)` | HintTimer | shipped |
| `info` | `top-center` | `1px solid var(--wh-border)` | NoParagraphNotification | shipped |
| `auto` | `top-center` | `1px solid rgba(255, 210, 63, 0.5)` | AutoModeToast | proposed |

All three variants share the same leading glyph — the 20 × 20 logo button that opens the popup. The differentiation lives entirely in the border tint and the message content, so the "tap to open" affordance stays consistent across the family.

The `auto` variant is a planned split out of the current `info` — today AutoModeToast and NoParagraphNotification render identically and can only be told apart by reading the message. The primary-tinted border lets the player parse "mode active" vs "can't run here" at a glance.

**Copy update for auto-mode**: the message becomes `"Auto-Hunter active · <Word>"` so the player can verify the current target without opening the popup. The active word is rendered in mono + `--wh-primary` — optional polish that lifts it out of the sentence. PRD specifies including the word; the current build does not ship it yet.

Shared chrome (all variants): `rgba(11, 15, 25, 0.92)` fill, 12 px backdrop-blur, `--wh-shadow-3`, sans-medium-12 message, dismiss ×. Mutual exclusion: `info` (no-paragraph) beats `auto` on the same page load.

**Code-side rollout** lives in `src/content/styles/overlay.css` + `InPageToast.tsx` + `auto-mode-toast.ts` — three files, no schema migration.

See `preview/components-toasts.html`.

### CelebrationPopup (`hw-celebration`)

The system's one loud moment. Triggered by a `FindEvent` (or a review-click — see below). Full-screen overlay with a centered modal.

**Modal:**
- 84 × 84 art square on the left (emoji at 56 px or PokeAPI sprite at native px, max 100 %).
- Body: `Found!` headline in Space-Grotesk-22-bold + `--wh-found` colour · the word itself in mono-16-semibold · meta line in mono-11 (`12s · no hint`).
- 1 px `--wh-found` border *and* the found-coloured 4 px glow (`--wh-shadow-glow-found`) — the only surface in the system that wears two simultaneous found-coloured cues.
- 12 px backdrop-blur preserves host-page legibility.
- Enters with `wh-pop` (`--wh-ease-pop`, 360 ms) — the only place spring overshoot is used.

**Three layout variants** (additive, can combine):

1. **Solo find** — modal alone. Default.
2. **Auto-Continue + spoiler on** — adds a `Next up` pill *below* the modal (translucent slate pill with the next word's mini-art + name). Subordinate visually (`opacity: 0.85`) so it doesn't compete with the find moment.
3. **Review click** — replaces auto-clear behaviour with an explicit `Remove word` button below the modal. Lets the player drop the ActiveWord after re-finding it; otherwise the celebration is purely informational on a review click.

See `preview/components-celebration.html`.

### HiddenWord (`hw-word` / `hw-char`)

The actual hidden word in the page text. Implementation lives in `src/content/word-renderer.ts` + `src/content/components/HiddenWord.tsx`. Rendered as a `<span class="hw-word">` containing per-char `<span class="hw-char" data-char="…">` whose text is invisible to Ctrl+F (the glyph lives in `::before { content: attr(data-char) }`). The found-state of the same span swaps to the highlighter underline (`linear-gradient` stripe with `--wh-found`).

Transitions on `background-image` are timed `--wh-dur-base` `--wh-ease-standard`.

---

## CONTROLS — reference

| Control | Shape | Where it appears |
|---|---|---|
| Button (primary / secondary / ghost / danger) | sm / md / lg sizes; `--wh-radius-2` (8 px) | everywhere |
| Input | mono optional; `--wh-radius-2` | CustomWordModal · Settings (numeric) |
| Field | label + control + counter + helper / error | every form row |
| Switch | 32 × 18 track + 14 px thumb | Settings · BottomActionBar (as icon-button) |
| Range slider | 4 px gradient track + 18 px thumb + value-chip | Settings (minWordThreshold) |
| Select | native styled with custom chevron | Settings (where applicable) |
| SearchableSelect | mono trigger + mono dropdown + inline magnifier | content where the option set is long enough to warrant search |
| Chip-group | pill track + transparent chips, selected drops to surface-2 | Play (list, filter) |
| Badge | pill 3px 9px padding, dot + label | Stats list dots (via inline dot), word-list theming, achievement pills |
| Tooltip (CSS-only) | `::after` + `data-tooltip` | every truncated / icon-only cell in Stats |
| Modal (CustomWord) | absolute backdrop blur + dialog | Custom-word entry |
| Action footer | sticky-bottom panel · save mode or confirm mode | Settings save · Stats clear-all

---

## OPEN QUESTIONS · OPPORTUNITIES

A running list of where the system is honest with itself. Most items from the previous revision have been resolved in this pass — marked **resolved** below — and the lifted ones are now part of the canonical system.

### 1. Hint blue did double duty — **resolved**

The old `--wh-hint` was overloaded across seven surfaces. Split into `--wh-info` (informational — toast, link, ReloadHint, hint-dot) + `--wh-selected` (state — pending slot, current streak value). Both resolve to the same hex today; `--wh-hint` is kept as a legacy alias to `--wh-info` for back-compat with the codebase. Code-side migration can happen incrementally.

### 2. AutoModeToast visual identity — **resolved**

New `auto` variant of InPageToast: soft primary-tinted border (`rgba(255, 210, 63, 0.5)`) + the active-word name appended to the message (in mono + primary). Logo glyph stays consistent across all variants so the "tap to open" affordance is identical everywhere. Code-side rollout pending in `src/content/styles/overlay.css` + `auto-mode-toast.ts`.

### 3. Auto-Continue affordance on BottomActionBar — **resolved**

When Auto-Continue is on, the toggle now flips three signals: icon → `--wh-primary`, border → `--wh-primary` (replacing default `--wh-border`), and an outer 2&nbsp;px `--wh-primary-soft` ring. Triple cue, no extra space, obvious at a glance.

### 4. Tooltip pattern duplicated CSS — **resolved (proposed pattern)**

The four duplicated `::after` blocks in `popup.css` (word · icon-header · hint dot · link) collapse to a single utility `.wh-tooltip[data-tip-anchor="left|right|center"][data-tooltip]`. Recipe documented in `preview/components-stats-tooltips.html`. Code-side rollout pending.

### 5. `ui_kits/` recreations — **rebuilt this revision**

The old `extension-popup/` and `in-page-overlay/` JSX kits represented a pre-Auto-Continue, pre-PopupHeader world. Replaced with focused static-HTML compositions that mirror the current Play / Stats / Settings tabs and the in-page overlay surfaces. See `ui_kits/` for the new structure.

### 6. Warning state had no token — **resolved**

Added `--wh-warning: #FFA862` + `--wh-warning-soft`. Reserved — no surface uses it today — but pre-allocated so future "heads-up" states (e.g. "this page has another extension already injecting words") don't reach for `--wh-primary` or `--wh-danger`.

### 7. Range slider Firefox parity — **flagged for code rollout**

The `::-moz-range-thumb` pseudo currently only carries the base look. Three hover/focus/active states need to be mirrored from `::-webkit-slider-thumb`. Documented as a to-do block inside `preview/components-range-slider.html`; the change is a copy-paste of three rules into `popup.css`.

### 8. Reduced-motion coverage — **planned**

Full coverage map documented in `preview/motion.html`. Today only ProgressRow ships the media query. The remaining 6 animated surfaces (toasts, ReloadHint, SearchableSelect dropdown, Action footer, CelebrationPopup, Range slider thumb) need to drop their `translate` / `scale` transforms while keeping the opacity fade. Recipe block included.

### 9. `--wh-list-animals` = `--wh-found` collision — **resolved**

Now declared explicitly as an alias in `colors_and_type.css`: `--wh-list-animals: var(--wh-found)`. Honest about the reuse rather than two hexes that happen to match. If a future surface needs to differentiate them, splitting is a one-line job.

---

## CHANGELOG vs initial system

Brief: what's different in this revision so the next reviewer can scan changes without re-reading the file.

**Components & surfaces**
- **Logo** — real `assets/logo.png` ships; `wordmark.svg` + `glyph.svg` placeholders removed.
- **Tabs** — three tabs (Play / Statistics / Settings). Rules moved into a `PopupHeader` info button.
- **Popup size** — `360 × 560` is now canonical (was "recommend 360 × 440+").
- **ActiveWordCard** — new component, replaces the old "active word state" treatment.
- **ProgressRow** — collapsible row replaces the old ProgressHeader card. Streak block + Achievements moved inside the expanded panel.
- **BottomActionBar** — new sticky footer on Play. Auto-Continue toggle, primary CTA, shuffle, custom-word entry.
- **CustomWordModal** — new modal pattern, replaces inline custom-word input.
- **ReloadHint** — new soft info-blue card that appears after starting a hunt.
- **Action footer** — unified sticky-bottom pattern with save mode (Settings) and confirm mode (Stats clear-all). Replaces the old top-anchored ConfirmOverlay.
- **Switch** — formalised as a control (Settings + Auto-Continue toggle).
- **Range slider** — formalised as a control (Settings minWordThreshold). Firefox parity to-do flagged.
- **Number input** — custom stacked stepper replaces native browser spinners; chrome stays consistent with the rest of the input family.
- **CelebrationPopup** — gains the `Next up` pill (Auto-Continue) and `Remove word` button (review click) variants.
- **InPageToast** — three variants: `hint` (top-right, info border), `info` (top-center, neutral border), `auto` (top-center, soft primary border + active-word name).
- **CollectionSlot** — adds `is-pending` state (clicked but not yet started). Uses dedicated `--wh-selected` token.
- **Iconography** — full Lucide subset documented (`play`, `shuffle`, `pencil`, `star`, `chevron-down`, `timer`, etc.).
- **CSS-only tooltips** — formalised with utility-class recipe (`.wh-tooltip[data-tip-anchor]`).
- **Chip-group info-chip** variant — removed (streak / catches data moved into ProgressRow panel).
- **Card** preview — reset to show the base primitive (compact / comfortable / tight) instead of an old active-hunt mockup.
- **Auto-Continue mode** — documented as a first-class feature with its toast, next-up preview, and triple-cue toggle indicator.

**Tokens**
- **`--wh-info` / `--wh-info-soft`** — new (split from `--wh-hint`). Informational blue for the system communicating with the player.
- **`--wh-selected` / `--wh-selected-soft`** — new (split from `--wh-hint`). State blue for pending / current-state surfaces.
- **`--wh-warning` / `--wh-warning-soft`** — new. Reserved soft amber.
- **`--wh-hint` / `--wh-hint-soft`** — kept as legacy aliases to `--wh-info`. Prefer `--wh-info` in new code.
- **`--wh-list-animals`** — now explicitly `var(--wh-found)` instead of a duplicated hex.

**Patterns**
- **Reduced-motion** — coverage map documented; recipe published. Code-side rollout in 6 surfaces pending.
- **Tooltip utility** — single class + `data-tip-anchor` attribute pattern documented; replaces 4 duplicated `::after` blocks.
- **Number stepper** — custom stacked chevron column replaces native browser spinners.
