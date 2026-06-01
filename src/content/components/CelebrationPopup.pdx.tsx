import type { JSX } from "preact";
import rawPlaceholderUrl from "../../assets/pokemon/_placeholder.png";
import type { Locale } from "../../i18n";
import { t } from "../../i18n";

const placeholderUrl = chrome.runtime.getURL(rawPlaceholderUrl.replace(/^\//, ""));
const IMAGE_URL_RE = /^(https?:|chrome-extension:|\/|data:|\.\.?\/)/;

interface NextWordPreview {
  word: string;
  art?: string;
}

interface CelebrationPopupPdxProps {
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

function artNode(art: string | undefined): JSX.Element | null {
  if (art === undefined) return null;
  if (IMAGE_URL_RE.test(art)) {
    return (
      <img
        class="pdx-celebration__art-img"
        src={art}
        alt=""
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = placeholderUrl;
        }}
      />
    );
  }
  return <>{art}</>;
}

export function CelebrationPopupPdx({
  visible,
  locale,
  word,
  durationS,
  hintUsed,
  art,
  next,
  onDismiss,
  onClear,
}: CelebrationPopupPdxProps): JSX.Element | null {
  if (!visible) return null;

  return (
    <div class="pdx-celebration-overlay">
      <button
        type="button"
        class="pdx-celebration__dismiss"
        onClick={onDismiss}
        aria-label={t("toast_dismiss_aria", locale)}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div class="pdx-celebration-stack">
        {next !== undefined && (
          <div class="pdx-next">
            <span class="pdx-next__label">{t("celebration_next_label", locale)}</span>
            <span class="pdx-next__word">{next.word}</span>
          </div>
        )}

        <div class="pdx-celebration" role="dialog" aria-modal="true" aria-label="Word found">
          <div class="pdx-celebration__header">
            <span class="pdx-celebration__lens" aria-hidden="true" />
            <div class="pdx-celebration__leds" aria-hidden="true">
              <span class="led led--red" />
              <span class="led led--green" />
              <span class="led led--yellow" />
            </div>
            <span class="pdx-celebration__stamp">{t("celebration_found_headline", locale)}</span>
          </div>
          <div class="pdx-celebration__lcd">
            {art !== undefined && (
              <div class="pdx-celebration__art" aria-hidden="true">
                {artNode(art)}
              </div>
            )}
            <div class="pdx-celebration__body">
              <span class="pdx-celebration__found">&gt;&gt; REGISTERED!</span>
              <span class="pdx-celebration__word">{word}</span>
              <div class="pdx-celebration__meta">
                <span>{durationS}s</span>
                <span class="pdx-celebration__sep">·</span>
                <span>
                  {hintUsed ? t("celebration_hint_used", locale) : t("celebration_no_hint", locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onClear !== undefined && (
          <button type="button" class="pdx-celebration__cta" onClick={onClear}>
            {t("celebration_remove_word", locale)}
          </button>
        )}
      </div>
    </div>
  );
}
