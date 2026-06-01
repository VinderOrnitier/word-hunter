# 7. Theme architecture: parallel skins, not token override

Date: 2026-05-29

## Status

Accepted

## Context

Word Hunter is adding a second, user-selectable theme ("Pokédex", a
game-device skin) alongside the default ("Slate"). The two themes diverge on
more than colour: different DOM structure (LCD wells need scan-line/glare
sibling nodes; key caps need a border-bottom 3D treatment Slate has no use
for), different font families and metric scales (Press Start 2P at 12px ≈
Space Grotesk at 18px in advance width), different on-foreground rules
(Pokédex text colour depends on the surface — shell/LCD/key), and a different
copy voice (Slate sentence case vs Pokédex ALL CAPS + abbreviations).

## Decision

Build the themes as **parallel skins**, not as value-overrides of one token
set.

- **CSS layer.** Pokédex ships a separate stylesheet whose tokens live under a
  `.pdx` scope (`--pdx-*`). It is loaded *in addition to* the Slate stylesheet
  (`--wh-*`, at `:root`), never replacing it. No `--wh-*` value is redefined.
- **Component layer.** Each top-level surface renders a Slate *or* a Pokédex
  subtree. They share data hooks and domain logic; they do not share markup,
  because the DOM shapes differ.
- **Selection.** A new `theme: "slate" | "pokedex"` key in
  `chrome.storage.local` (default `slate`). The popup reads it once on mount
  and sets the scope class on its root. Switching themes prompts a popup
  re-open rather than a live re-render.

## Consequences

- Slate is fully insulated: no `--wh-*` token or Slate component markup is
  edited when adding Pokédex; with the default theme the Pokédex stylesheet is
  inert (nothing cascades without a `.pdx` ancestor).
- The cost is duplicated markup per forked surface. Accepted: the divergence in
  DOM shape, fonts, and copy makes a shared-markup approach carry tombstone
  elements and themed font tokens, defeating the point.
- Storage uses `chrome.storage.local` (not `sync` as the design-system handoff
  suggested) to stay consistent with every existing setting and avoid a split
  store.
