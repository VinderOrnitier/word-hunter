# Pokédex theme — production implementation guide

> Handoff doc for wiring the Pokédex theme into the live `word-hunter/` extension (Manifest V3, Vite + Preact). The **design** is fully specified in `README.md` → "THEMES" and rendered in `preview/pokedex/` + `ui_kits/*-pokedex/`. This file is the **build** map: what goes where in the codebase, in what order, and the traps we already hit so you don't re-hit them.

Read `README.md` "THEMES" first for the *why*. This doc is the *how*.

---

## 0. Mental model

The two themes are **parallel skins**, not value-overrides of one token set. Concretely, in the running extension that means the fork lives at **two layers**:

1. **CSS layer** — a separate token+component stylesheet (`theme-pokedex.css`) scoped under a `.pdx` class. Loaded *in addition to* the slate stylesheet, never replacing it.
2. **Component layer** — each top-level surface renders a slate *or* a pokedex subtree. They share data hooks and domain logic; they do **not** share markup, because the DOM shapes differ (LCD wells need scan-line/glare sibling nodes, key caps need the border-bottom 3D trick — slate has neither).

If you find yourself adding a `--pdx-*` token to make a slate component render, stop — that's the signal you're trying to override instead of fork.

---

## 1. File-by-file mapping: design system → codebase

| Design-system artifact | Lands in the codebase as | Notes |
|---|---|---|
| `themes/theme-pokedex.css` | `src/shared/styles/theme-pokedex.css` | Mirror, same as `colors_and_type.css` mirrors `tokens.css`. Authoritative `--pdx-*` source. |
| `ui_kits/extension-popup-pokedex/popup.css` | folded into `src/popup/styles/popup.pdx.css` | The composed popup component classes (`.pdx-popup`, `.pdx-active`, `.pdx-slot-v2`, …). Loaded only by the popup bundle. |
| `preview/pokedex/in-page-overlays.html` CSS | `src/content/styles/overlay.pdx.css` | Celebration / toast / reload-hint / highlighter classes for the content bundle. |
| `preview/pokedex/iconography.html` mapping + `icons.js` | `src/popup/components/Icon.tsx` (pokedex branch) | See §4. The 16-role → Pixelarticons slug table is the contract. |
| `preview/pokedex/*.html` | nothing — they're the visual spec | Keep them as the pixel-accurate reference. If code drifts from a preview card, the **code** is the bug (same rule as the slate kits). |

Naming convention: slate stays unsuffixed (`popup.css`, `overlay.css`); pokedex gets a `.pdx.css` sibling. Both are imported; the `.pdx` scope class decides which paints.

---

## 2. Loading the stylesheet + the scope class

`theme-pokedex.css` defines **every** token under the `.pdx` selector (not `:root`). Nothing cascades without a `.pdx` ancestor. This is deliberate — it's what lets both themes' stylesheets coexist in one document without colliding.

**Popup** (`src/popup/App.tsx`): put the scope class on the popup root element, driven by the stored theme:

```tsx
// App.tsx
const theme = useTheme();            // "slate" | "pokedex" — see §6
return (
  <div className={theme === "pokedex" ? "pdx" : "wh"}>
    {/* … header / tabs / tab body … */}
  </div>
);
```

**Content script** (`src/content/`): the overlay host root (the element the celebration/toast portal mounts into) gets the same class. Read the theme once at injection; see §6 for the mid-page-switch policy.

> **TRAP #1 — the missing `.pdx` class.** Every preview page sets `class="pdx"` on `<body>`. When we built the UI-kit files we forgot it and *every* `var(--pdx-*)` resolved to empty — popups fell back to `auto` size and lost all colour. If a Pokédex surface renders transparent / wrong-sized, check the scope class is on an ancestor **first**.

---

## 3. Fonts

Three families: **Press Start 2P** (labels stamped on the device), **VT323** (LCD output), **Space Grotesk** (body/helper — shared with slate).

- Preview + kit files currently pull Press Start 2P / VT323 from **Google Fonts** (`@import` at the top of `theme-pokedex.css`). That's fine for the design-system preview, **not** for production.
- Production self-hosts via `@fontsource`, same as the slate fonts already do in `main.tsx` (`@fontsource/space-grotesk`, etc.). Add:
  ```ts
  import "@fontsource/press-start-2p";   // ships 400 only
  import "@fontsource/vt323";            // ships 400 only
  ```
  and **remove the `@import` line** from the production copy of `theme-pokedex.css`.
- Both pixel fonts ship a single weight (400). You never set `font-weight` on them — "weight" is expressed through size + tracking. The `--pdx-tracking-*` tokens carry that.

> **TRAP #2 — metric reflow.** Press Start 2P is ~1.6× wider per glyph than Space Grotesk. The `--pdx-pixel-*` scale is already tuned for this (caps at 14px in chrome). Don't reuse slate's px sizes for pixel-font text or it overflows the 360px popup.

---

## 4. Icons

Slate uses Lucide stroke icons. Pokédex uses **Pixelarticons** (Gerrit Halfmann, MIT) — a 24×24 pixel-art set. The 16 roles map 1:1 so the `Icon` component just swaps renderer by theme:

| role | pokedex slug | role | pokedex slug |
|---|---|---|---|
| search | `search` | target | `target` |
| bar-chart | `chart` | timer | `clock` |
| settings | `sliders` | check | `check` |
| info | `info-box` | x | `close` |
| play | `play` | trash | `trash` |
| shuffle | `shuffle` | external | `external-link` |
| pencil | `edit` | (minus) | `minus` |
| refresh | `reload` | (plus) | `plus` |
| star | `star` | bookmark | `bookmark` |
| chevron-down | `chevron-down` | trophy | `trophy` |

**Production icon delivery — do NOT ship the `iconify-icon` web component.** The preview pages use `icons.js`, which fetches icon JSON once from the Iconify CDN and bakes inline `<svg>`. Two reasons it exists, both of which apply doubly in production:

> **TRAP #3 — iconify-icon races at scale.** The `<iconify-icon>` custom element silently fails to render past ~20 instances on a page (we hit this on `screens-tabs.html` — 35 of 49 icons came up empty). `icons.js` sidesteps it with a single fetch + inline-SVG swap + a MutationObserver for late inserts.

For production, go one step further than `icons.js`: **bundle the icon set offline** (Iconify offline plugin or just commit the ~20 needed icon bodies as a static JSON) so the popup makes **zero network requests** at runtime. The slug names stay identical. In Preact, the cleanest form is an `Icon` component that holds the body map and emits inline SVG with `width:1em;height:1em;fill:currentColor` — that reproduces exactly how every preview icon behaves (parent `font-size` + `color` drive it).

---

## 5. The component fork — which files get a pokedex sibling

Each surface below needs a pokedex implementation sharing the slate one's data hooks. Source of truth for markup/state is the named preview file.

| Codebase module | Pokédex spec lives in | Key structural deltas vs slate |
|---|---|---|
| `src/popup/components/PopupHeader.tsx` | `play-tab.html` header | lens + 3 LED dots + pixel wordmark + cream info key |
| `src/popup/components/Tabs.tsx` | any screen, tab row | cream key caps, icon-left-of-label, `is-active` → yellow LED cap |
| `src/popup/play/ActiveWordCard.tsx` | `play-tab.html` state 1/2 | cyan LCD art well + yellow ring; empty state uses pixel eyebrow + sans hint (no Fraunces) |
| `src/popup/play/ProgressRow.tsx` | `play-tab.html` | inset mini-LCD, 10-cell bar, **4-col grid** (see TRAP #4) |
| `src/popup/collection/CollectionSlot.tsx` | `play-tab.html` grid | `.pdx-slot-v2` cream cap; `is-active` yellow ring, `is-pending` cyan ring, silhouette = `filter: brightness(0)` |
| `src/popup/components/BottomActionBar.tsx` | `play-tab.html` action bar | raised raspberry housing, yellow pixel primary, cream icon keys, `is-on` toggle |
| `src/popup/play/CustomWordModal.tsx` | `play-tab.html` state 4 | absolute over popup interior only; raspberry shell + LCD inner; cream input w/ VT323 |
| `src/popup/play/ReloadHint.tsx` | `in-page-overlays.html` | LCD inline notice, cyan info glyph, "RELOAD TO HUNT" |
| `src/popup/tabs/StatsTab.tsx` | `screens-tabs.html` Stats | LCD list rows, squared dots, cyan hint cell; CLEAR → confirm footer |
| `src/popup/tabs/SettingsTab.tsx` | `screens-tabs.html` Settings | **theme picker is the first field**; switch/stepper/range pokedex variants; save footer |
| `src/popup/tabs/RulesTab.tsx` | `screens-tabs.html` Rules | info key flips lens-blue active; VT323 flavor + 01/02/03 pixel markers; CTRL/F kbd caps |
| `src/popup/components/ConfirmOverlay.tsx` | `screens-tabs.html` Stats confirm | raspberry sliding footer, red destructive key |
| `src/popup/components/SearchableSelect.tsx` | `searchable-select.html` | cream trigger + pixel chevron, navy LCD dropdown sharing a flattened seam, LCD search input, yellow-rail selected option, "NO MATCH" empty |
| `src/popup/components/{Switch,NumberStepper,RangeSlider}` | `components-form-controls.html` | physical slide key / LCD stepper / 12-cell LCD slider |
| `src/content/components/CelebrationPopup.tsx` | `in-page-overlays.html` | centred device over scrim; "REGISTERED!" green stamp + green LED; Auto-Continue NEXT-UP pill; review-click REMOVE WORD |
| `src/content/components/InPageToast.tsx` | `in-page-overlays.html` | horizontal raspberry device; 4px LED ribbon = variant (cyan hint / cream info / yellow auto); solid, **no host-page blur** |
| `src/content/components/HiddenWord.tsx` | `in-page-overlays.html` + `.pdx-highlight` in theme css | yellow LED rectangle w/ 1px charcoal inset outline; `--found` flips to green. Inline flow preserved. |

> **TRAP #4 — grid column / child count.** `.pdx-progress` has 4 children (label / bar / count / chev) and **must** declare 4 grid columns (`auto auto 1fr 18px`). We first shipped 3 columns → the count clipped and the chevron wrapped to a second row. Any time you add a child to a grid row, re-count the template.

> **TRAP #5 — `box-sizing` on the switch cap.** `.pdx-switch*__cap` carries a 1px L/R + 2px bottom border. Without `box-sizing: border-box` the border is added *outside* the declared width/height, so the cap floats asymmetrically and OFF/ON gaps differ. The cap rules already set it; keep it if you refactor.

---

## 6. Theme storage + switching

- New setting `theme: "slate" | "pokedex"`, persisted in **`chrome.storage.sync`** alongside the existing settings (same store as `minWordThreshold`, `autoContinue`, etc.).
- **Default `"slate"`** for new installs and any record predating this change (treat missing as slate).
- Settings tab gains the picker (two preview-tile radio cards) — already designed as the first field in `SettingsTab`.
- **Switching reopens the popup.** A live re-render that spans font-family + DOM shape isn't worth the complexity; show the inline "switching reopens the popup" notice and let the next open mount the other tree. This is the accepted trade-off the user signed off on.
- **Content script:** reads the theme at injection time. If the user switches mid-page, already-injected overlays keep their original theme until the page reloads — cheap and consistent with how other settings already behave.

---

## 7. Copy fork

Both themes share the **vocabulary** (Active word, Hunt, Catch, Streak…) but diverge on **voice**. Don't hardcode pokedex strings inside shared logic — route display strings through a theme-aware label map, or keep per-theme copy in the per-theme component. Quick reference (full table in README "Copy contract"):

| slate | pokedex |
|---|---|
| "Active word" | "NOW HUNTING" |
| "No caught words yet — go hunt!" | "NO CATCHES — GO HUNT!" |
| "Caught" / "Uncaught" | "CGHT" / "MISS" |
| "Settings" | "SETS" |
| "Reload the page to begin hunting." | "RELOAD TO HUNT" |
| "Found! 12s · no hint" | "REGISTERED!" + LCD line `12s · NO HINT` |
| Fraunces-italic empty-state flavour | VT323 LCD flavour line (no italic — doesn't read on a pixel grid) |

---

## 8. Suggested build order

1. **Tokens + scope** — land `theme-pokedex.css`, wire the `.pdx` class in `App.tsx`, add the `theme` setting (default slate). Nothing visual yet; verify the class toggles.
2. **Fonts + Icon component** — self-host the two pixel fonts; build the pokedex `Icon` branch with the offline slug map.
3. **Shell + Tabs + one tab (Play)** — prove the chrome end-to-end against `play-tab.html` before fanning out.
4. **Remaining tabs + form controls** — Stats / Settings / Rules + Switch/Stepper/Range/SearchableSelect.
5. **Content overlays** — Celebration / InPageToast / ReloadHint / HiddenWord against `in-page-overlays.html`.
6. **Theme picker + switch-reopen** — wire the Settings picker and the reopen notice last, once both trees exist to switch between.

Verify each surface against its named preview file at 360×560. If a surface shows something the preview doesn't cover, that's the signal to add a preview card first, then build.

---

## 9. Checklist of traps (quick scan)

- [ ] `.pdx` scope class on the popup root **and** the content overlay host (TRAP #1)
- [ ] `@import` Google Fonts removed; `@fontsource` pixel fonts imported in `main.tsx` (TRAP #2)
- [ ] No `<iconify-icon>` in production — offline inline-SVG `Icon` component (TRAP #3)
- [ ] Grid `grid-template-columns` count == child count on every grid row (TRAP #4)
- [ ] `box-sizing: border-box` on switch caps and any bordered sliding element (TRAP #5)
- [ ] Theme default is `"slate"`; missing record treated as slate
- [ ] Display copy routed through theme-aware strings, not hardcoded in shared logic
