import type { JSX } from "preact";
import { resolveArt } from "../../shared/art-resolver";
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
  const art = resolveArt(word, source);
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
      <span class="wh-slot__art">{renderArt(source, art, caught)}</span>
      {caught && <span class="wh-slot__count">×{count}</span>}
    </button>
  );
}

function renderArt(source: WordListName, art: string | undefined, caught: boolean): JSX.Element {
  if (source === "pokemon") {
    if (!art) return <span class="wh-slot__placeholder">???</span>;
    const cls = caught ? "wh-slot__sprite" : "wh-slot__sprite wh-slot__silhouette";
    return (
      <img class={cls} src={art} alt="" width={48} height={48} loading="lazy" decoding="async" />
    );
  }
  if (caught && art) {
    return <span class="wh-slot__emoji">{art}</span>;
  }
  return <span class="wh-slot__placeholder">???</span>;
}
