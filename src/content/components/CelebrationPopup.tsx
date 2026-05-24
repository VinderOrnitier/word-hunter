import type { JSX } from "preact";
import { t } from "../../i18n";
import type { Locale } from "../../i18n";
import rawPlaceholderUrl from "../../assets/pokemon/_placeholder.png";

const placeholderUrl = chrome.runtime.getURL(rawPlaceholderUrl.replace(/^\//, ""));

interface NextWordPreview {
  word: string;
  art?: string;
}

interface CelebrationPopupProps {
  visible: boolean;
  locale: Locale;
  word: string;
  durationS: number;
  hintUsed: boolean;
  art?: string;
  next?: NextWordPreview;
  onDismiss: () => void;
  onClear?: () => void;
}

const IMAGE_URL_RE = /^(https?:|chrome-extension:|\/|data:|\.\.?\/)/;

export function CelebrationPopup({
  visible,
  locale,
  word,
  durationS,
  hintUsed,
  art,
  next,
  onDismiss,
  onClear,
}: CelebrationPopupProps): JSX.Element | null {
  if (!visible) return null;
  const artIsImage = typeof art === "string" && IMAGE_URL_RE.test(art);
  const nextArtIsImage = typeof next?.art === "string" && IMAGE_URL_RE.test(next.art);

  return (
    <div class="hw-celebration">
      <button
        type="button"
        class="hw-celebration__dismiss"
        onClick={onDismiss}
        onKeyDown={(e) => {
          if (e.key === "Escape") onDismiss();
        }}
        aria-label="Dismiss"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div class="hw-celebration__wrap" role="dialog" aria-modal="true" aria-label="Word found">
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
            <span class="hw-celebration__headline">{t("celebration_found_headline", locale)}</span>
            <span class="hw-celebration__word">{word}</span>
            <div class="hw-celebration__meta">
              <span>{durationS}s</span>
              <span class="hw-celebration__meta-sep">·</span>
              <span>{hintUsed ? t("celebration_hint_used", locale) : t("celebration_no_hint", locale)}</span>
            </div>
          </div>
        </div>
        {next !== undefined && (
          <div class="hw-celebration__next">
            <span class="hw-celebration__next-label">{t("celebration_next_label", locale)}</span>
            {next.art !== undefined && (
              <span class="hw-celebration__next-art" aria-hidden="true">
                {nextArtIsImage ? (
                  <img
                    class="hw-celebration__next-art-img"
                    src={next.art}
                    alt=""
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = placeholderUrl;
                    }}
                  />
                ) : (
                  next.art
                )}
              </span>
            )}
            <span class="hw-celebration__next-word">{next.word}</span>
          </div>
        )}
        {onClear !== undefined && (
          <button type="button" class="hw-celebration__clear-btn" onClick={onClear}>
            {t("celebration_remove_word", locale)}
          </button>
        )}
      </div>
    </div>
  );
}
