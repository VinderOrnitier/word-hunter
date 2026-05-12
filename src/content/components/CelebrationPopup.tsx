import type { JSX } from "preact";

interface CelebrationPopupProps {
  visible: boolean;
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
  onDismiss: () => void;
}

const IMAGE_URL_RE = /^(https?:|chrome-extension:|\/|data:|\.\.?\/)/;

export function CelebrationPopup({
  visible,
  word,
  durationS,
  hintUsed,
  art,
  onDismiss,
}: CelebrationPopupProps): JSX.Element | null {
  if (!visible) return null;
  const artIsImage = typeof art === "string" && IMAGE_URL_RE.test(art);

  return (
    <div class="hw-celebration" onClick={onDismiss}>
      <div
        class="hw-celebration__modal"
        onClick={(e) => e.stopPropagation()}
      >
        {art !== undefined && (
          <div class="hw-celebration__art" aria-hidden="true">
            {artIsImage ? (
              <img class="hw-celebration__art-img" src={art} alt="" />
            ) : (
              art
            )}
          </div>
        )}
        <div class="hw-celebration__body">
          <span class="hw-celebration__headline">Found!</span>
          <span class="hw-celebration__word">{word}</span>
          <div class="hw-celebration__meta">
            <span>{durationS}s</span>
            <span class="hw-celebration__meta-sep">·</span>
            <span>{hintUsed ? "hint used" : "no hint"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
