# UI Kits

Composition references showing the design system put together as real product surfaces. These are not the production code — they're static HTML that mirrors the current `master` build so designers can see the system at scale, take screenshots, and remix.

For component-by-component documentation, use the cards under `preview/`. For the full system in composition, open the files here.

## What's inside

```
extension-popup/
  index.html              ← all three tabs side-by-side · 360 × 560 each · every state visible inline

in-page-overlay/
  scene.html              ← host-page mock with the three InPageToast variants and the CelebrationPopup
```

Two files. Two screens. Open them in a wide window and you have the whole product in front of you.

## Style of these kits

- **Static HTML + inline CSS.** No JSX framework, no build step. Open the file, see the result. The prior JSX kits forced a fork-and-rewrite cycle every time the system moved; static compositions can be edited directly when the code changes.
- **Loads `../../colors_and_type.css`.** Every surface pulls from the same token system as production.
- **All visible state.** Where a component has multiple states (toggles on/off, slots active/pending, error vs focused inputs), the composition shows them inline rather than gating behind interaction.

## When to use

- **Designers** → as a starting point for new surfaces. Copy a tab, swap in the variation you want to explore, take screenshots.
- **Developers** → as a pixel-accurate reference when implementing or refactoring. If a kit drifts from the live popup, the kit is the bug.
- **Reviewers** → as a quick scan of "is the system internally consistent" without opening Chrome.

If a composition shows something the design system doesn't cover, that's the signal to add a `preview/` card for the missing pattern.
