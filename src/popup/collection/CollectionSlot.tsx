import type { JSX } from "preact";
import { resolveArtView } from "../../shared/art-resolver";
import type { WordListName } from "../word-lists";

interface CollectionSlotProps {
  word: string;
  source: WordListName;
  count: number;
  isActive: boolean;
  isPending?: boolean;
  onClick: () => void;
}

export function CollectionSlot({
  word,
  source,
  count,
  isActive,
  isPending,
  onClick,
}: CollectionSlotProps): JSX.Element {
  const caught = count > 0;
  const art = resolveArtView(word, source);
  const classes = [
    "wh-slot",
    caught ? "is-caught" : "is-uncaught",
    isActive ? "is-active" : "",
    isPending === true ? "is-pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabel = caught
    ? `${word}, caught ${count} ${count === 1 ? "time" : "times"}`
    : `${word}, not caught yet`;

  return (
    <button type="button" class={classes} onClick={onClick} aria-label={ariaLabel} title={word}>
      <span class="wh-slot__art">{renderArt(art, caught)}</span>
      {caught && <span class="wh-slot__count">×{count}</span>}
    </button>
  );
}

function renderArt(art: ReturnType<typeof resolveArtView>, caught: boolean): JSX.Element {
  switch (art.kind) {
    case "sprite": {
      const cls = caught ? "wh-slot__sprite" : "wh-slot__sprite wh-slot__silhouette";
      return (
        <img
          class={cls}
          src={art.url}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
        />
      );
    }
    case "emoji":
      return caught ? (
        <span class="wh-slot__emoji">{art.char}</span>
      ) : (
        <span class="wh-slot__placeholder">???</span>
      );
    default:
      return <span class="wh-slot__placeholder">???</span>;
  }
}
