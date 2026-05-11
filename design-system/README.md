# Word Hunter — Design System

A design system for **Word Hunter**, a Chrome extension where the player searches for a word that's been invisibly hidden in the text of any web page.

The product picks a word from a chosen list (Animals, Pokémon, or a custom string), inserts it into a long enough paragraph using a CSS `::before` trick that bypasses Ctrl+F, and rewards the player with a celebration animation when they click the word they spotted. There is one product surface today (the Chrome extension popup) plus an in-page overlay layer (hint tooltips, the celebration popup, the no-paragraph notification).

## Sources

- **Codebase**: `word-hunter/` — Chrome extension (Manifest V3). Vite + Preact + Tailwind v4 (planned). Vanilla TypeScript content scripts.
  - `word-hunter/CONTEXT.md` — domain language and UI architecture decisions
  - `word-hunter/docs/PRD.md` — feature spec, user stories, technical solution for the Ctrl+F bypass
  - `word-hunter/src/popup/` — Play / Statistics / Settings / Rules tabs (currently unstyled HTML)
  - `word-hunter/src/content/` — paragraph selector, word renderer, hint timer, celebration tooltip, no-paragraph notification
  - `word-hunter/public/icons/` — 16/48/128 px icon (currently a flat blue placeholder, no real mark)
- **No Figma file** was provided.

## Brand position

The codebase is **pre-visual-design**: the popup is unstyled HTML, the icon is a flat blue square, and `CONTEXT.md` only commits to "dark theme default" + "design tokens for everything." This system establishes a brand direction grounded in two things the product already commits to:

1. **The hunt** — the player is *looking* for something. Magnifying-glass / highlighter / detective vibes.
2. **The reading surface** — the word lives inside other people's text. The extension's UI must feel quiet enough to share a screen with The New York Times, Wikipedia, or a Substack post.

The result is **"highlighter on slate"**: a deep dark UI with a single warm-amber accent that mirrors the highlighter mark a reader makes when they spot something. One bright moment per surface.

## Index

```
README.md                  ← you are here
SKILL.md                   ← cross-compatible Agent Skills entry
colors_and_type.css        ← all design tokens (CSS custom properties)

assets/                    ← logos, icons, brand glyphs
  icon16.png  icon48.png  icon128.png      (existing placeholder icons)
  wordmark.svg                              (designed wordmark — new)
  glyph.svg                                 (designed app glyph — new)

preview/                   ← cards rendered into the Design System tab
  logo.html        colors-brand.html      colors-surfaces.html
  colors-foreground.html   colors-semantic.html
  type-display.html        type-scale.html        type-mono-word.html
  highlighter.html         spacing.html           radii.html
  shadows.html             motion.html
  components-buttons.html  components-inputs.html
  components-tabs.html     components-card.html
  components-tooltip.html  components-badge.html
  components-table-row.html
  iconography.html

ui_kits/
  extension-popup/         ← the popup recreation (PlayTab, StatsTab, etc.)
    index.html
    *.jsx
  in-page-overlay/         ← hint tooltip, celebration popup, no-paragraph banner
    index.html
    *.jsx
```

---

## CONTENT FUNDAMENTALS

The codebase has very little user-facing copy yet — what exists is sober, mechanical, and brief. This system **leans into that** rather than dressing it up. Word Hunter is a quiet game; the copy should feel like marginalia, not marketing.

### Voice

- **Calm and observational, not hype.** The product is a reading game. Treat the player like an attentive reader, not a player to be entertained.
- **Second person, addressing the player directly.** "you found", "your hunts", "no word selected". Avoid "I" — there is no character speaking *to* the player.
- **Active and present.** "Find the word", not "Words can be found". "5 hunts logged", not "Has logged 5 hunts".
- **Plain English.** Never use jargon for jargon's sake. The domain has its own precise vocabulary (see CONTEXT.md) — use it consistently in *labels*, but soften it in copy. A user-facing string can say "found word"; a JSON key is `huntRecord`.

### Domain vocabulary (from CONTEXT.md, treat as canonical)

Use exactly these terms in user-facing copy:

| Use | Don't use |
|---|---|
| Word | target, search term |
| Active word | current word, selected word |
| Word list | bank, category, set |
| Paragraph | text block, element |
| Hint | help, clue (it *is* a clue, but the product calls it a hint) |
| Found / find | discovered, located, spotted |
| Hunt | game, round, session |

### Casing

- **Sentence case for everything UI**: buttons, headers, menu items, table headers. ("New word", "Hint delay", not "New Word", "Hint Delay".)
- **Title case is not used.**
- **Words from the lists keep the casing the source intended**: `cat`, `Pikachu`. Animals are lowercase; Pokémon are capitalized.
- **The product name is "Word Hunter"** — both words capitalized, always.

### Punctuation

- **Sentences in body copy end in periods.**
- **Labels and buttons do not.** "New word" not "New word."
- **Em-dashes (—) are welcome** for parenthetical asides — they suit the editorial feel of a reading tool. Use real em-dashes, not double hyphens.
- **No exclamation marks** outside the celebration tooltip. The single allowed exclamation is on the find: "Found!"

### Numbers

- Numerals always (`5 hunts`, `2 minutes`), never spelled out.
- Durations: `1.5s`, `2 min`, `5 min` — terse, no spaces around units in compact UI; with spaces in body copy.

### Emoji & icons in copy

- **No emoji in copy.** The brand has its own visual marks (the highlighter, the glyph, the iconography set described below); emoji clash with the cozy reader feel.
- **No unicode-as-icon hacks** (✓, →, ★ inside text). Use real SVG icons.

### Tone examples

| Surface | Bad (too hype) | Good |
|---|---|---|
| Empty stats | "🎉 Time to start your hunting adventure!" | "No words found yet." |
| Hint tooltip | "Pssst! There's a hidden word here 👀" | "The word is hidden on this page." |
| No paragraph | "Sorry! This page is too short ☹️" | "No long text on this page — word not hidden." |
| Found word | "AMAZING! YOU GOT IT!" | "Found! 12s · no hint" |
| Settings label | "How long until we help you?" | "Hint delay" |
| Active word state | "Currently hunting:" | "Active word" |

### Vibe in one line

> Marginalia, not megaphone. The product whispers. The found-word moment is the only time it allows itself a flourish — and even then, it's a single highlighter stroke, not a confetti cannon.

---

## VISUAL FOUNDATIONS

### Color

- **Dark by default.** `--wh-bg: #0B0F19` (deep slate). The UI sits on top of paper-feeling surfaces (`--wh-surface: #151B2C`, `--wh-surface-2: #1F2740`) — *never* pure black. Black would clash with the warmth of the primary.
- **One accent: the highlighter.** `--wh-primary: #FFD23F` is reserved for the active-word state and the highlighter underline. It is **never** used as a button background unless the button is the *find* / hunt CTA. Use it sparingly — overuse breaks the metaphor.
- **Semantic accents stay quiet**: `--wh-found` (mint, only on the celebration), `--wh-hint` (cool blue, only on the hint tooltip), `--wh-danger` (coral, only on destructive confirms).
- **Word-list colors** distinguish lists in the dropdown and in stats: Animals → mint, Pokémon → pink. Custom words have no color (they're the player's own).
- **No purple/blue gradients.** No glassmorphism. No neon. The accent earns its brightness by being the only one.

### Typography

- **`Space Grotesk`** for everything UI. Geometric, slightly playful, reads cleanly at 12 px (which the popup needs).
- **`JetBrains Mono`** for *the word* — the active-word display, the word-list options, and the hidden word's reveal in stats. Mono-spaced text *means something* in this product: it's the thing being hunted.
- **`Fraunces` (italic)** is reserved for one editorial moment per surface — the "hunt" metaphor copy in the rules tab, or a tagline above the empty state. Used as flavor; never as a UI workhorse. (Skill guidance flagged Fraunces as overused — we accept that and limit it tightly.)
- Sizes: `11 / 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48`. Popup body is `14px`.
- Tracking is tight on display (`-0.01em`), normal on body, wide caps on eyebrow labels (`+0.08em`).

### Spacing

- **4 px base.** Scale: `0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`.
- Popup is dense — most components sit in 8–12 px gaps; only major sections get 24+.
- Use `gap` on flex/grid containers, never per-child margins.

### Backgrounds

- **No imagery.** No hand-drawn illustrations. No repeating patterns. No grain. The extension lives on top of the user's web page — its surfaces should feel inert so the host page reads correctly.
- **No gradients** on surfaces or buttons. The only gradient in the system is the *highlighter underline* (which is technically a stripe, not a gradient).
- A `--wh-surface-2` (slightly lighter than `--wh-surface`) creates depth between cards and inputs — that's the entire elevation language for backgrounds.

### Borders

- **1 px hairlines** (`--wh-border: #2A334D`) on cards, inputs, dividers.
- **No 2 px borders.** No double borders. No animated borders.
- Border radius scale: `4 / 8 / 12 / 16 / 999`. Inputs and buttons → `8`. Cards → `12`. Pills/chips → `999`.

### Shadows

Three elevation levels plus a focus glow:

- `--wh-shadow-1` — sits-on-page (subtle 1 px and 2 px combined).
- `--wh-shadow-2` — raised (cards in the popup, dropdown menus).
- `--wh-shadow-3` — overlay (the celebration popup floating on a host page).
- `--wh-shadow-glow` — `0 0 0 4px var(--wh-primary-soft)` — the focus ring. Always 4 px. Always primary-tinted.
- The found-word celebration uses `--wh-shadow-glow-found` instead.

There is **no inner shadow** on inputs (it would muddy the dark surface). Inputs depend on `--wh-surface-2` + a 1 px border for affordance instead.

### Hover & press states

- **Hover on buttons**: lift one surface step (`--wh-surface-2` → `--wh-surface-3`); never lighten via `opacity`.
- **Hover on the primary button**: brighten the yellow slightly (`#FFD23F` → `#FFDC5C`); the text stays `--wh-on-primary` (almost-black).
- **Press**: a 1 px translate-down (`transform: translateY(1px)`) plus a slight darken. No shrink scale tricks; the popup is too small for that to read.
- **Hover on rows / list items**: `background: var(--wh-surface-2)`. No underline-on-hover for non-link items.
- **Disabled**: `opacity: 0.45`, `cursor: not-allowed`. No greyscale filters.

### Focus

- **Always visible**, always the primary glow ring. `outline: none; box-shadow: var(--wh-shadow-glow);` — uses the same yellow as the highlighter so the focus state is on-brand, not a generic browser default.

### Transparency & blur

- **Transparency lives in the `*-soft` color tokens** (`--wh-primary-soft` etc.) — used for tinted backgrounds on chips, hint tooltip, and focus glows.
- **No backdrop blur** in the extension popup (Chrome popups are small and solid; blur looks fake on a flat dark background).
- **Backdrop blur is allowed on the celebration popup** (the only surface that overlays a real web page). 12 px backdrop-blur over a `rgba(11, 15, 25, 0.78)` fill keeps the page legible underneath.

### Animation

- **Easing**: `--wh-ease-standard` (`cubic-bezier(0.2, 0.8, 0.2, 1)`) for almost everything. `--wh-ease-pop` (overshoot) reserved exclusively for the celebration popup entrance. `--wh-ease-out` for outgoing transitions.
- **Durations**: `120 / 200 / 360 ms`. Most micro-interactions are 200 ms. The celebration is 360 ms.
- **No bouncy/spring animations except on the celebration.** The rest is calm.
- **No fade-only transitions** for entering elements — always pair fade with a small `translateY(4px)` so it feels intentional. (Fade-only feels like a ghost.)

### Layout rules

- **Popup is `360 × 440+` minimum.** The repo's current `320 × 400` is too tight; we recommend 360. (Listed as a delta from current.)
- **Tabs are sticky-top** in the popup; tab content scrolls beneath.
- **Stats table scrolls vertically** inside the popup; never expand the popup vertically forever.
- **No fixed positioning** inside the popup chrome. The popup itself is the fixed layer.
- **In-page overlays** (hint, celebration, no-paragraph) are `position: fixed`, `z-index: 2147483000` (chosen high enough to clear most host-page UIs without hitting the int32 ceiling).

### Cards

- `background: var(--wh-surface)`, `border: 1px solid var(--wh-border)`, `border-radius: var(--wh-radius-3)` (12 px), `box-shadow: var(--wh-shadow-2)`. Padding is `16 px` for compact, `24 px` for comfortable.
- **Cards never have a colored left-border accent.** (Per skill anti-trope guidance — that pattern is not in this system.)

### Imagery

There is no imagery in the brand. The future word-list expansion mentions per-word images (a photo of a cat, a sprite of Pikachu) — those are content, not brand. When they arrive, render them at `48×48` rounded `--wh-radius-2`, no border, on `--wh-surface-2`.

---

## ICONOGRAPHY

### Existing assets

The codebase ships three PNGs in `public/icons/` — `icon16.png`, `icon48.png`, `icon128.png`. **They are flat blue placeholders**, not a real icon design. They've been copied to `assets/` for completeness and so the extension still has a runnable manifest, but they should be replaced.

### Approach

- **Lucide** is the icon system for this design system. Stroke-based, 1.5 px stroke, 24 px viewbox, friendly geometry — it pairs well with Space Grotesk and reads cleanly at 16 px in the popup.
- Loaded from CDN: `https://unpkg.com/lucide@latest`.
- **Lucide is a substitution.** The codebase has no icon set of its own — there are no SVGs in `src/`, no icon component, no icon font. Lucide was chosen because (a) it's free, (b) its stroke style matches our type, (c) it's the de-facto Preact-friendly icon set. **Flagged: please confirm or substitute.**
- **No emoji.** No unicode-as-icon (✓ / → / ★ inside body text).
- **No PNG icons inside the popup UI.** The PNG icons are only for the extension's manifest (browser toolbar / Chrome Web Store).

### The four icons that matter most

These appear repeatedly across both surfaces. They should always render at `16` or `20 px` inside the popup, `24 px` in the in-page overlay:

- **`search`** — the play tab and the empty state ("hunt for a word")
- **`bar-chart-3`** — the statistics tab
- **`settings`** — the settings tab
- **`info`** — the rules tab and the no-paragraph notification

### The brand mark

The wordmark and glyph are designed in this system (see `assets/wordmark.svg`, `assets/glyph.svg`). The glyph is a **literal `H` with a highlighter stripe through it** — the brand-mark equivalent of the product mechanic. The wordmark sets the product name in Space Grotesk semibold with the same highlighter stripe behind the letter `o` of "Word".

These are *new designs*, not derived from existing brand work — flagged for the user to approve or replace.

### Font substitution flag

The system uses **Space Grotesk**, **JetBrains Mono**, and **Fraunces** — all loaded from Google Fonts. No font files were provided in the codebase, so no substitution was needed at the file level. If the team standardizes on Geist or another house typeface, swap `--wh-font-sans` and re-test the popup at 320 px width.

---

## Caveats & open questions

See the closing message — bullets for what's flagged.
