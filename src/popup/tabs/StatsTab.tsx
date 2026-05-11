import type { JSX } from "preact";
import type { HuntRecord } from "../../shared/types";
import { useStorage } from "../hooks/useStorage";
import { Eyebrow } from "../components/Eyebrow";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { formatDuration, formatRelative } from "../utils/format";

export function StatsTab(): JSX.Element {
  const [finds, setFinds] = useStorage("finds", []);

  if (finds.length === 0) {
    return (
      <div class="wh-stats__empty">
        <Icon name="search" size={28} />
        <span class="wh-body-sm">No words found yet.</span>
        <span class="wh-editorial">your hunts will appear here.</span>
      </div>
    );
  }

  const sorted = [...finds].sort((a, b) => b.foundAt - a.foundAt);

  return (
    <div class="wh-stats">
      <div class="wh-stats__header">
        <Eyebrow>{finds.length} hunts</Eyebrow>
        <Button
          variant="ghost"
          size="sm"
          leftIcon="trash"
          onClick={() => setFinds([])}
        >
          Clear
        </Button>
      </div>
      <div class="wh-stats__table" role="list">
        {sorted.map((r) => (
          <StatsRow key={`${r.word}-${r.foundAt}`} record={r} />
        ))}
      </div>
    </div>
  );
}

function StatsRow({ record }: { record: HuntRecord }): JSX.Element {
  return (
    <div class="wh-stats__row" role="listitem">
      <span class="wh-stats__word">{record.word}</span>
      <span class="wh-stats__meta">{formatRelative(record.foundAt)}</span>
      <span class="wh-stats__meta">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={
          record.hintUsed
            ? "wh-stats__hint wh-stats__hint--used"
            : "wh-stats__hint"
        }
      >
        {record.hintUsed ? "hint" : "—"}
      </span>
      <a
        class="wh-stats__link"
        href={record.pageUrl}
        target="_blank"
        rel="noopener"
      >
        <span>{record.pageTitle}</span>
        <Icon name="external" size={10} />
      </a>
    </div>
  );
}
