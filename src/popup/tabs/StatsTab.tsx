import type { JSX } from "preact";
import type { HuntRecord, WordSource } from "../../shared/types";
import { Button } from "../components/Button";
import { ConfirmOverlay } from "../components/ConfirmOverlay";
import { Eyebrow } from "../components/Eyebrow";
import { Icon } from "../components/Icon";
import { useConfirmAction } from "../hooks/useConfirmAction";
import { useStorage } from "../hooks/useStorage";
import { formatDuration, formatRelative } from "../utils/format";

export function StatsTab(): JSX.Element {
  const [finds, setFinds] = useStorage("finds", []);
  const clearAction = useConfirmAction({ onConfirm: () => setFinds([]) });

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
      <div class="wh-stats__confirm-anchor">
        <div class="wh-stats__header">
          <Eyebrow>{finds.length} hunts</Eyebrow>
          <Button variant="ghost" size="sm" leftIcon="trash" onClick={clearAction.arm}>
            Clear
          </Button>
        </div>
        {clearAction.armed && (
          <ConfirmOverlay
            prompt="Clear all hunts?"
            onConfirm={clearAction.confirm}
            onCancel={clearAction.cancel}
          />
        )}
      </div>
      <div class="wh-stats__table" role="list">
        <StatsHeader />
        {sorted.map((r) => (
          <StatsRow key={`${r.word}-${r.foundAt}`} record={r} />
        ))}
      </div>
    </div>
  );
}

function StatsHeader(): JSX.Element {
  return (
    <div class="wh-stats__col-header" aria-hidden="true">
      <span>Word</span>
      <span>Found</span>
      <span class="wh-stats__col-header--icon" data-tooltip="Duration">
        <Icon name="timer" size={11} />
      </span>
      <span class="wh-stats__col-header--center">Hint</span>
      <span class="wh-stats__col-header--center">Page</span>
    </div>
  );
}

const DOT_COLOR: Record<WordSource, string> = {
  animals: "var(--wh-list-animals)",
  pokemon: "var(--wh-list-pokemon)",
  custom: "var(--wh-fg-3)",
};

function StatsRow({ record }: { record: HuntRecord }): JSX.Element {
  const dotColor = record.list ? DOT_COLOR[record.list] : "var(--wh-fg-3)";

  return (
    <div class="wh-stats__row" role="listitem">
      <span class="wh-stats__word" data-tooltip={record.word}>
        <span class="wh-stats__dot" style={{ background: dotColor }} />
        <span class="wh-stats__word-text">{record.word}</span>
      </span>
      <span class="wh-stats__meta">{formatRelative(record.foundAt)}</span>
      <span class="wh-stats__meta">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={record.hintUsed ? "wh-stats__hint wh-stats__hint--used" : "wh-stats__hint"}
        aria-label={record.hintUsed ? "hint used" : "no hint"}
        data-tooltip={record.hintUsed ? "Hint used" : "No hint"}
      />
      <a
        class="wh-stats__link"
        href={record.pageUrl}
        target="_blank"
        rel="noopener"
        aria-label={record.pageTitle}
        data-tooltip={record.pageTitle}
      >
        <Icon name="external" size={12} />
      </a>
    </div>
  );
}
