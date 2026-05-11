import type { JSX } from "preact";

export function PopupHeader(): JSX.Element {
  return (
    <header class="wh-header">
      <svg
        class="wh-header__glyph"
        viewBox="0 0 64 64"
        width="28"
        height="28"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="var(--wh-surface)" />
        <text
          x="32"
          y="42"
          text-anchor="middle"
          font-family="var(--wh-font-sans)"
          font-weight="700"
          font-size="34"
          letter-spacing="-0.02em"
          fill="var(--wh-fg)"
        >
          H
        </text>
        <rect
          x="20"
          y="50"
          width="24"
          height="3"
          rx="1.5"
          fill="var(--wh-primary)"
        />
      </svg>
      <span class="wh-header__wordmark">
        Word H<span class="wh-highlight">u</span>nter
      </span>
    </header>
  );
}
