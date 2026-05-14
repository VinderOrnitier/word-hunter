import type { JSX } from "preact";
import placeholderUrl from "../../assets/pokemon/_placeholder.png";

interface CelebrationPopupProps {
  visible: boolean;
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
  onDismiss: () => void;
  onClear?: () => void;
}

const IMAGE_URL_RE = /^(https?:|chrome-extension:|\/|data:|\.\.?\/)/;

export function CelebrationPopup({
  visible,
  word,
  durationS,
  hintUsed,
  art,
  onDismiss,
  onClear,
}: CelebrationPopupProps): JSX.Element | null {
  if (!visible) return null;
  const artIsImage = typeof art === "string" && IMAGE_URL_RE.test(art);

  return (
    <div class="hw-celebration" onClick={onDismiss}>
      <div
        class="hw-celebration__wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="hw-celebration__modal">
          {art !== undefined && (
            <div class="hw-celebration__art" aria-hidden="true">
              {artIsImage ? (
                <img
                  class="hw-celebration__art-img"
                  src={art}
                  alt=""
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = placeholderUrl;
                  }}
                />
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
        {onClear !== undefined && (
          <button class="hw-celebration__clear-btn" onClick={onClear}>
            Remove word
          </button>
        )}
      </div>
    </div>
  );
}
