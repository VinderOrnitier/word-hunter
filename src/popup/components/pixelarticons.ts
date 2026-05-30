// Pixelarticons SVG bodies — the Pokédex theme icon set.
// Source: Pixelarticons by Gerrit Halfmann (MIT) — https://pixelarticons.com
// Fetched from https://api.iconify.design/pixelarticons.json (24×24 grid) and committed
// offline so the popup makes ZERO network requests at runtime (spec §4.5, trap #3 — the
// <iconify-icon> web component is intentionally NOT shipped).
// Keys are Pixelarticons slugs; the IconName → slug mapping lives in Icon.tsx
// (PIXELARTICONS_SLUG). To add a role, fetch the new slug body from the source above.
export const PIXELARTICONS_BODIES = {
  search:
    '<path fill="currentColor" d="M22 22h-2v-2h2zm-2-2h-2v-2h2zm-6-2H6v-2h8zm4 0h-2v-2h2zM6 16H4v-2h2zm10 0h-2v-2h2zM4 14H2V6h2zm14 0h-2V6h2zM6 6H4V4h2zm10 0h-2V4h2zm-2-2H6V2h8z"/>',
  chart:
    '<path fill="currentColor" d="M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zM7 11h2v6H7zm4-4h2v10h-2zm4 6h2v4h-2z"/>',
  sliders:
    '<path fill="currentColor" d="M17 4h2v10h-2zm0 12h-2v2h2v2h2v-2h2v-2zm-4-6h-2v10h2zm-8 2H3v2h2v6h2v-6h2v-2zm8-8h-2v2H9v2h6V6h-2zM5 4h2v6H5z"/>',
  "info-box":
    '<path fill="currentColor" d="M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-9 5h2V7h-2zm0 8h2v-6h-2z"/>',
  trash:
    '<path fill="currentColor" d="M18 22H6v-2h12zM9 6h6V4h2v2h5v2h-2v12h-2V8H6v12H4V8H2V6h5V4h2zm6-2H9V2h6z"/>',
  "external-link":
    '<g fill="currentColor"><path d="M11 5H5v2h6zM5 7H3v12h2zm12 12H5v2h12zm2-6h-2v6h2zm-8 0H9v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zm2-2h-2v8h2z"/><path d="M21 3h-8v2h8z"/></g>',
  reload:
    '<g fill="currentColor"><path d="M16 4h2v6h-2zm-2-2h2v2h-2zm0 2h2v8h-2zM4 8H2v5h2z"/><path d="M4 6h16v2H4zm4 14H6v-6h2zm2 2H8v-2h2zm0-2H8v-8h2zm10-4h2v-5h-2z"/><path d="M20 18H4v-2h16z"/></g>',
  check:
    '<path fill="currentColor" d="M10 18H8v-2h2zm-2-2H6v-2h2zm4-2v2h-2v-2zm-6 0H4v-2h2zm8 0h-2v-2h2zm2-2h-2v-2h2zm2-2h-2V8h2zm2-2h-2V6h2z"/>',
  close:
    '<path fill="currentColor" d="M7 19H5v-2h2zm12 0h-2v-2h2zM9 15v2H7v-2zm8 2h-2v-2h2zm-6-2H9v-2h2zm4 0h-2v-2h2zm-2-2h-2v-2h2zm-2-2H9V9h2zm4 0h-2V9h2zM9 9H7V7h2zm8 0h-2V7h2zM7 7H5V5h2zm12 0h-2V5h2z"/>',
  target:
    '<path fill="currentColor" d="M5 1h14v2H5zM3 3h2v2H3zm0 16h2v2H3zm16 0h2v2h-2zm0-16h2v2h-2zm2 2h2v14h-2zM5 21h14v2H5zM1 5h2v14H1zm8 0h6v2H9zM5 9h2v6H5zm4 8h6v2H9zm8-8h2v6h-2zm-6 0h2v2h-2zM7 7h2v2H7zm0 8h2v2H7zm8 0h2v2h-2zm0-8h2v2h-2zm-6 4h2v2H9zm2 2h2v2h-2zm2-2h2v2h-2z"/>',
  clock:
    '<path fill="currentColor" d="M6 2h12v2H6zM2 6h2v12H2zm18 0h2v12h-2zm-2-2h2v2h-2zM4 4h2v2H4zm2 18h12v-2H6zm12-2h2v-2h-2zM4 20h2v-2H4zm7-14h2v7h-2zm2 7h2v2h-2zm2 2h2v2h-2z"/>',
  play: '<path fill="currentColor" d="M15 11h-2V9h2zm0 4h-2v-2h2zm-2 2h-2v-2h2zm0-8h-2V7h2zm-2-2H9V5h2zM9 21H7V3h2zm6-8h2v-2h-2zm-6 4h2v2H9z"/>',
  shuffle:
    '<path fill="currentColor" d="M10 19H2v-2h8zm12 0h-8v-2h8zm-10-2h-2v-6h2zm6-10h2v2h2v2h-2v2h-2v2h-2v-4h-4V9h4V5h2zM8 11H2V9h6z"/>',
  edit: '<path fill="currentColor" d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2zM6 16H4v4h4v-2H6z"/>',
  star: '<path fill="currentColor" d="M5 20h3v2H3v-6h2zm16 2h-5v-2h3v-4h2zm-11-2H8v-2h2zm6 0h-2v-2h2zm-2-2h-4v-2h4zm-7-2H5v-3h2zm12 0h-2v-3h2zM5 13H3v-2h2zm16 0h-2v-2h2zM9 9H3v2H1V7h8zm14 2h-2V9h-6V7h8zM11 7H9V3h2zm4 0h-2V3h2zm-2-4h-2V1h2z"/>',
  "chevron-down":
    '<path fill="currentColor" d="M13 16h-2v-2h2zm-2-2H9v-2h2zm4 0h-2v-2h2zm-6-2H7v-2h2zm8 0h-2v-2h2zM7 10H5V8h2zm12 0h-2V8h2z"/>',
} satisfies Record<string, string>;

/** Union of the committed Pixelarticons slugs — the single source of truth for slug names. */
export type PixelarticonSlug = keyof typeof PIXELARTICONS_BODIES;
