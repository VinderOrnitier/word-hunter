import type { JSX } from "preact";
import { useThemeContext } from "../theme/ThemeContext";
import { PIXELARTICONS_BODIES } from "./pixelarticons";

export type IconName =
  | "search"
  | "bar-chart"
  | "settings"
  | "info"
  | "trash"
  | "external"
  | "refresh"
  | "check"
  | "x"
  | "target"
  | "timer"
  | "play"
  | "shuffle"
  | "pencil"
  | "star"
  | "chevron-down";

/** IconName role → Pixelarticons slug. The 16-role contract (see iconography.html). */
export const PIXELARTICONS_SLUG: Record<IconName, string> = {
  search: "search",
  "bar-chart": "chart",
  settings: "sliders",
  info: "info-box",
  trash: "trash",
  external: "external-link",
  refresh: "reload",
  check: "check",
  x: "close",
  target: "target",
  timer: "clock",
  play: "play",
  shuffle: "shuffle",
  pencil: "edit",
  star: "star",
  "chevron-down": "chevron-down",
};

interface IconProps {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 16, filled = false }: IconProps): JSX.Element | null {
  const theme = useThemeContext();

  if (theme === "pokedex") {
    // Pixelarticons are single-form pixel glyphs; "lit"/emphasis states are expressed
    // via parent color in .pdx CSS, so `filled` is intentionally ignored in this branch.
    const body = PIXELARTICONS_BODIES[PIXELARTICONS_SLUG[name]];
    if (!body) return null;
    // `body` is static, committed SVG markup from PIXELARTICONS_BODIES — never user or
    // page input — so injecting it as innerHTML carries no XSS risk.
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round" as const,
    "stroke-linejoin": "round" as const,
  };

  switch (name) {
    case "search":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
      );
    case "bar-chart":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M3 3v18h18" />
          <path d="M7 14v4M12 9v9M17 4v14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "info":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      );
    case "external":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      );
    case "check":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "x":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "target":
      return (
        <svg {...props} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "timer":
      return (
        <svg {...props} aria-hidden="true">
          <line x1="10" x2="14" y1="2" y2="2" />
          <line x1="12" x2="15" y1="14" y2="11" />
          <circle cx="12" cy="14" r="8" />
        </svg>
      );
    case "play":
      return (
        <svg {...props} aria-hidden="true">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
      );
    case "shuffle":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M16 3h5v5" />
          <path d="M4 20 21 3" />
          <path d="M21 16v5h-5" />
          <path d="m15 15 6 6" />
          <path d="M4 4l5 5" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...props} aria-hidden="true">
          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          <path d="m15 5 4 4" />
        </svg>
      );
    case "star":
      return (
        <svg {...props} aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...props} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}
