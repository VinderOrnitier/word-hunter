# UI Kit — In-page Overlay

The content-script surfaces — what the player sees on the host page they're reading.

- `index.html` — fake article with a `HiddenWord` embedded in a paragraph; click triggers the celebration popup.
- `HiddenWord.jsx` — span using `::before { content: attr(data-char) }` to bypass Ctrl+F.
- `HintTooltip.jsx` — small floating notice at top-right after `hintDelayMinutes`.
- `CelebrationPopup.jsx` — found-word popup with `--wh-shadow-glow-found` ring, ease-pop entrance.
- `NoParagraphBanner.jsx` — short notification when no paragraph qualifies.

Maps to: `word-hunter/src/content/{word-renderer,hint-timer,celebration-tooltip,no-paragraph-notification}.ts`.
