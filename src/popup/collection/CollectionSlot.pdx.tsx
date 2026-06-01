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

export function CollectionSlotPdx({
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
    "pdx-slot-v2",
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
      {renderArt(art, caught)}
      {caught && <span class="pdx-slot-v2__count">x{count}</span>}
    </button>
  );
}

function renderArt(art: ReturnType<typeof resolveArtView>, caught: boolean): JSX.Element {
  switch (art.kind) {
    case "sprite":
      return (
        <img
          class={`pdx-slot-v2__sprite${caught ? "" : " is-silhouette"}`}
          src={art.url}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
        />
      );
    case "emoji":
      return caught ? (
        <span class="pdx-slot-v2__emoji">{art.char}</span>
      ) : (
        <span class="pdx-slot-v2__ph">???</span>
      );
    default:
      return <span class="pdx-slot-v2__ph">???</span>;
  }
}
