# Pokédex theme — design & implementation spec

- **Date:** 2026-05-29
- **Status:** Draft (awaiting review)
- **Topic:** Add a second, user-selectable extension theme ("Pokédex") alongside the existing default ("Slate"), without breaking any existing Slate functionality.

---

## 1. Context

Word Hunter ships today with a single visual theme — **Slate** ("highlighter on slate": dark UI, one amber accent). The design system now specifies a second theme — **Pokédex** ("game-device": raspberry plastic shell, cyan LCD screen, cream key caps, LED accents, blue camera lens).

The Pokédex theme is **fully specified** in the design system. This spec does not re-derive the design; it adapts the design-system handoff into a concrete, codebase-grounded build plan and records the project-specific decisions.

### Source of truth (design system)

All under `design-system/`:

- `README.md` → **"THEMES"** section — rationale, copy contract, semantic token mapping, coverage contract, brand contract.
- `themes/POKEDEX-IMPLEMENTATION.md` — production build map (design→code file mapping, build order, the 5 known traps). **Read this first when implementing.**
- `themes/theme-pokedex.css` — every `--pdx-*` token + theme primitives, scoped under `.pdx`.
- `preview/pokedex/*` (7 pages + `icons.js`) — pixel-accurate visual reference per surface.
- `ui_kits/extension-popup-pokedex/*` and `ui_kits/in-page-overlay-pokedex/*` — composed recreations.

> **Note:** as of this writing these files are **untracked** in the main checkout and absent from the feature branch. Phase 0 brings them into the repo so the branch has a stable reference (see §7).

---

## 2. Goals / Non-goals

### Goals

- A `theme` setting the player chooses in Settings: `"slate"` (default) or `"pokedex"`.
- The Pokédex theme covers **every** player-facing surface Slate covers (popup chrome + in-page overlays + hidden-word treatment + iconography).
- Slate remains pixel-identical and behaviourally unchanged. No `--wh-*` token is touched; no Slate component markup is edited (only sibling branches/elements are added).
- Self-contained, incremental delivery on a single feature branch.

### Non-goals

- No live theme hot-swap. Switching themes prompts a popup re-open (accepted trade-off — a live re-render spanning font family + DOM shape is not worth the complexity).
- No new domain logic, storage migration, or data-shape change. Theme is purely presentational + one new setting key.
- Full uk/de/ja translations of new Pokédex copy keys are out of scope for this milestone (translations are added per-milestone, per project convention). English keys land now.

---

## 3. Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Theme model | **Parallel skins**, not token override | Themes diverge on DOM shape, fonts, on-foreground rules, and copy voice — overriding `--wh-*` values would force tombstone elements and themed font tokens (design-system "Why parallel"). |
| Token isolation | All `--pdx-*` scoped under `.pdx`; Slate stays `:root` | Both stylesheets coexist in one document; nothing cascades without a `.pdx` ancestor. |
| Component strategy | Per-surface fork: each surface renders a Slate **or** a Pokédex subtree, sharing data hooks + domain logic | DOM shapes differ (LCD wells, key caps). |
| Storage location | **`chrome.storage.local`** (NOT `chrome.storage.sync`) | The design-system doc says `sync`, but the entire codebase (`storage.ts`, `useStorage.ts`, `getLocale`) uses `local`. Staying on `local` avoids a split-brain store and matches every existing setting. **Deviation from the handoff doc — intentional.** |
| `theme` shape | Top-level storage key, mirroring `locale` (not nested in `GameSettings`) | Read by both popup and content script; mirrors the established `locale` pattern exactly. |
| Default | `"slate"`; missing/legacy record treated as slate | New installs and pre-change records keep today's look. |
| Switching | Reopen popup; show inline notice. Theme read **once on mount**. | Per design-system §6. |
| Rollout | **Incremental on a single feature branch**, no feature flag; merge to master when complete | Chosen by maintainer. Each phase is its own commit, verified against its preview file. |
| i18n / copy fork | **Hybrid**: `text-transform: uppercase` for casing-only differences; new i18n keys only where the words genuinely differ ("NOW HUNTING", "CGHT", "MISS") | Minimises key duplication while keeping all strings in the i18n system. |

---

## 4. Architecture

### 4.1 CSS layer

- `src/shared/styles/theme-pokedex.css` — mirror of `design-system/themes/theme-pokedex.css` (same as `tokens.css` mirrors `colors_and_type.css`). Authoritative `--pdx-*` source. **Remove the Google Fonts `@import`** — production self-hosts fonts.
- `src/popup/styles/popup.pdx.css` — composed Pokédex popup component classes (`.pdx-popup`, `.pdx-active`, `.pdx-slot-v2`, …). Loaded only by the popup bundle.
- `src/content/styles/overlay.pdx.css` — Pokédex celebration / toast / reload-hint / highlighter classes. Loaded by the content bundle.

Naming: Slate stays unsuffixed (`popup.css`, `overlay.css`); Pokédex gets a `.pdx.css` sibling. Both are imported; the `.pdx` scope class decides which paints.

### 4.2 Scope class

- **Popup:** `App.tsx` root element gets `"pdx"` when theme is pokedex, `"wh"` otherwise (driven by the mounted theme).
- **Content:** the overlay host root (where celebration/toast portals mount) gets the same class, set from the theme read at injection time.

### 4.3 Theme read model

- New top-level storage key: `StorageSchema.theme: "slate" | "pokedex"`, default `"slate"`.
- Helpers in `src/shared/storage.ts`: `getTheme()` / `setTheme()` (mirror `getActiveWord` etc.); plus a content helper consistent with `getLocale`.
- `useTheme()` hook (`src/popup/hooks/`): reads the stored theme **once on mount** (does NOT subscribe to `onChanged`) → drives which tree renders. A lightweight `ThemeProvider` context exposes the mounted theme so leaf components (e.g. `Icon`) read it without prop-drilling.
- The Settings picker writes the new value via a reactive setter and compares it to the mounted theme; when they differ it shows the "reopen the popup to apply" notice. The live tree does not swap.
- **Content script:** reads `theme` at injection; already-injected overlays keep their theme until the page reloads (consistent with how `locale` already behaves).

### 4.4 Fonts

Three families: **Press Start 2P** (labels stamped on the device), **VT323** (LCD output), **Space Grotesk** (body/helper — shared with Slate).

- Add deps `@fontsource/press-start-2p` and `@fontsource/vt323`; import in `main.tsx` (both ship weight 400 only — never set `font-weight`; "weight" is size + tracking via `--pdx-tracking-*`).
- Pixel-font scale (`--pdx-pixel-*`) is pre-tuned (caps at 14px in chrome) because Press Start 2P is ~1.6× wider per glyph than Space Grotesk — do not reuse Slate px sizes for pixel text.

### 4.5 Icons

- Slate uses Lucide stroke icons (`Icon.tsx`, 16 roles). Pokédex uses **Pixelarticons** (Gerrit Halfmann, MIT, 24×24 pixel grid). The 16 roles map 1:1 (table in `POKEDEX-IMPLEMENTATION.md` §4).
- **Production: bundle the needed icon bodies offline** as static SVG data committed in the repo — zero runtime network requests. **Do NOT ship the `<iconify-icon>` web component** (it silently fails past ~20 instances).
- `Icon` becomes theme-aware: same `name` prop + role contract; emits inline SVG (`width:1em;height:1em;fill:currentColor`), selecting Lucide paths or Pixelarticons bodies by theme.

### 4.6 Copy fork (hybrid i18n)

- Shared **vocabulary** (Active word, Hunt, Catch, Streak…). Diverging **voice** (Slate sentence case; Pokédex ALL CAPS + abbreviations).
- Casing-only differences ("Hint delay" → "HINT DELAY"): reuse the existing i18n key, apply `text-transform: uppercase` in `.pdx` CSS.
- Genuinely different words ("Active word" → "NOW HUNTING", "Caught"/"Uncaught" → "CGHT"/"MISS", "No caught words yet — go hunt!" → "NO CATCHES — GO HUNT!"): add new English keys in `src/i18n/messages/en.ts`; the Pokédex component references its own key. No pokedex strings hardcoded in shared logic.

---

## 5. File mapping (design system → codebase)

| Design-system artifact | Lands as | Notes |
|---|---|---|
| `themes/theme-pokedex.css` | `src/shared/styles/theme-pokedex.css` | Mirror; strip Google Fonts `@import`. |
| `ui_kits/extension-popup-pokedex/popup.css` | `src/popup/styles/popup.pdx.css` | Popup component classes; popup bundle only. |
| `preview/pokedex/in-page-overlays.html` CSS | `src/content/styles/overlay.pdx.css` | Content-bundle overlay classes. |
| `preview/pokedex/iconography.html` + `icons.js` | `src/popup/components/Icon.tsx` (pokedex branch) | 16-role → Pixelarticons slug table is the contract. |
| `preview/pokedex/*.html` | nothing (visual spec) | If code drifts from a preview, the **code** is the bug. |

### Surfaces to fork (component layer)

`PopupHeader` · `Tabs` · `ActiveWordCard` · `ProgressRow` · `CollectionSlot`/`CollectionGrid` · `BottomActionBar` · `CustomWordModal` · `ReloadHint` · `StatsTab` · `SettingsTab` · `RulesTab` · `ConfirmOverlay` · `SearchableSelect` · `Switch`/`NumberStepper`/`RangeSlider` (form controls) · `CelebrationPopup` · `InPageToast` (3 variants) · `HiddenWord` (`.pdx-highlight`). Each shares the Slate one's data hooks; markup source-of-truth is the named preview file.

---

## 6. Known traps (from the handoff doc)

1. **Missing `.pdx` scope class** — without it every `var(--pdx-*)` resolves empty (popup loses size + colour). Check the scope class on an ancestor first if a Pokédex surface renders transparent/wrong-sized.
2. **Font metric reflow** — Press Start 2P ~1.6× wider; use `--pdx-pixel-*`, not Slate px sizes, or it overflows the 360px popup. Remove the Google Fonts `@import` in production.
3. **`<iconify-icon>` races at scale** — fails past ~20 instances. Ship offline inline-SVG.
4. **Grid column / child count** — `grid-template-columns` count must equal child count on every grid row (e.g. `.pdx-progress` is 4 children → 4 columns).
5. **`box-sizing: border-box` on switch caps** — bordered sliding elements float asymmetrically without it.

---

## 7. Phased plan

Each phase is its own commit(s) on the feature branch and is verified against its named preview file at 360×560. Testable logic is built test-first (`/tdd`); pure CSS/markup forks are verified visually.

### Phase 0 — Foundation + theme plumbing (no visible change)
1. Bring the Pokédex design-system files into the repo (docs commit) → stable reference. *(Optional: ADR `docs/adr/007-theme-architecture.md` recording "parallel skins, not override".)*
2. Mirror `theme-pokedex.css` → `src/shared/styles/theme-pokedex.css` (strip the Google Fonts `@import`).
3. Storage: add `theme` top-level key (default `"slate"`), `getTheme`/`setTheme`, `useTheme()` (read-once) + `ThemeProvider`, content `getTheme`.
4. Scope class on `App.tsx` root + content overlay hosts; import `theme-pokedex.css` in `main.tsx` and `content/index.ts`. **(trap #1)**
5. Self-host fonts: add `@fontsource/press-start-2p` + `@fontsource/vt323`, import in `main.tsx`. **(trap #2)**

**Verify:** class toggles by stored value; Slate visually + behaviourally unchanged; build/test/lint green.

### Phase 1 — Icon: Pokédex branch
- Offline inline-SVG Pixelarticons; theme-aware `Icon`; ~20 icon bodies as committed static data; zero network requests. **(trap #3)**

**Verify:** every role renders in both themes against `preview/pokedex/iconography.html`.

### Phase 2 — Shell + Tabs + Play (prove end-to-end)
- Fork `PopupHeader`, `Tabs`, then Play surfaces: `ActiveWordCard`, `ProgressRow`, `CollectionSlot`/`CollectionGrid`, `BottomActionBar`, `CustomWordModal`, `ReloadHint`. Build `popup.pdx.css`. **(traps #4, #5)**

**Verify:** against `play-tab.html`.

### Phase 3 — Remaining tabs + form controls
- `StatsTab`, `SettingsTab` body, `RulesTab` + `Switch`/`NumberStepper`/`RangeSlider`/`SearchableSelect` + `ConfirmOverlay`.

**Verify:** against `screens-tabs.html` + `components-form-controls.html`.

### Phase 4 — In-page overlays
- `CelebrationPopup`, `InPageToast` (hint/info/auto), `ReloadHint` (in-page), `HiddenWord` `.pdx-highlight`. Build `overlay.pdx.css`.

**Verify:** against `in-page-overlays.html`.

### Phase 5 — Theme picker + switch-reopen + copy fork
- Picker as the **first** field in `SettingsTab` (two preview-tile radio cards) + "reopen popup to apply" notice.
- Apply hybrid i18n: CSS uppercase for casing-only; new `en.ts` keys for genuinely different copy.

**Verify:** switching writes the setting, notice shows, next open mounts the other tree; both themes render all surfaces.

### Phase 6 — Verification + polish
- `prefers-reduced-motion` coverage, a11y pass, end-to-end smoke test of **both** themes against every preview, green `pnpm test` / `build` / `lint`.
- Then finish the branch (PR) via `finishing-a-development-branch`.

---

## 8. Testing strategy

- **Test-first (`/tdd`)** for logic units: `theme` storage default/round-trip, `useTheme` read-once behaviour, `getTheme` content helper, the icon role→slug map, and any copy-resolution helper.
- **Visual verification** for skin work: each forked surface compared to its named preview at 360×560.
- **Regression guard for Slate:** existing tests stay green; Slate snapshots/visuals unchanged. No edits to `--wh-*` tokens or Slate component markup.

---

## 9. "Don't break Slate" guarantees

- No `--wh-*` token is modified; `tokens.css` is untouched.
- Slate components are not edited — Pokédex adds sibling branches/elements gated by theme.
- Slate remains the default for new and legacy records.
- `theme-pokedex.css` cascades only under `.pdx`; with theme=slate it has no effect.

---

## 10. Open items

- ADR for the theme architecture — include in Phase 0? (recommended, given the project's ADR convention).
- Confirm exact offline-icon delivery format (committed JSON of bodies vs inline component map) — decided at Phase 1 start against the role table.
- uk/de/ja translations of new Pokédex keys — deferred to a later localisation milestone.
