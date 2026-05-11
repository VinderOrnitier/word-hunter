import type { JSX } from "preact";

interface NoParagraphBannerProps {
  visible: boolean;
}

export function NoParagraphBanner({
  visible,
}: NoParagraphBannerProps): JSX.Element | null {
  if (!visible) return null;
  return (
    <div class="hw-no-paragraph">
      <span class="hw-no-paragraph__dot" />
      <span>No long text found on this page — word not hidden</span>
    </div>
  );
}
