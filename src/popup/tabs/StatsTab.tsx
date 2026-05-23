import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { HuntRecord, WordSource } from "../../shared/types";
import { Button } from "../components/Button";
import { ConfirmOverlay } from "../components/ConfirmOverlay";
import { Eyebrow } from "../components/Eyebrow";
import { Icon } from "../components/Icon";
import { useConfirmAction } from "../hooks/useConfirmAction";
import { useStorage } from "../hooks/useStorage";
import { formatDuration, formatRelative } from "../utils/format";

export function StatsTab(): JSX.Element {
  const t = useT();
  const [finds, setFinds] = useStorage("finds", []);
  const clearAction = useConfirmAction({ onConfirm: () => setFinds([]) });

  if (finds.length === 0) {
    return (
      <div class="wh-stats__empty">
        <Icon name="search" size={28} />
        <span class="wh-body-sm">{t("stats_empty_body")}</span>
        <span class="wh-editorial">{t("stats_empty_editorial")}</span>
      </div>
    );
  }

  const sorted = [...finds].sort((a, b) => b.foundAt - a.foundAt);

  return (
    <div class="wh-stats">
      <div class="wh-stats__confirm-anchor">
        <div class="wh-stats__header">
          <Eyebrow>{t("stats_n_hunts", { count: finds.length })}</Eyebrow>
          <Button variant="ghost" size="sm" leftIcon="trash" onClick={clearAction.arm}>
            {t("stats_clear")}
          </Button>
        </div>
        {clearAction.armed && (
          <ConfirmOverlay
            prompt={t("stats_clear_confirm")}
            onConfirm={clearAction.confirm}
            onCancel={clearAction.cancel}
          />
        )}
      </div>
      <ul class="wh-stats__table">
        <StatsHeader />
        {sorted.map((r) => (
          <StatsRow key={`${r.word}-${r.foundAt}`} record={r} />
        ))}
      </ul>
    </div>
  );
}

function StatsHeader(): JSX.Element {
  const t = useT();
  return (
    <div class="wh-stats__col-header" aria-hidden="true">
      <span>{t("stats_col_word")}</span>
      <span>{t("stats_col_found")}</span>
      <span class="wh-stats__col-header--icon" data-tooltip={t("stats_col_duration_tooltip")}>
        <Icon name="timer" size={11} />
      </span>
      <span class="wh-stats__col-header--center">{t("stats_col_hint_header")}</span>
      <span class="wh-stats__col-header--center">{t("stats_col_page")}</span>
    </div>
  );
}

const DOT_COLOR: Record<WordSource, string> = {
  animals: "var(--wh-list-animals)",
  pokemon: "var(--wh-list-pokemon)",
  custom: "var(--wh-fg-3)",
};

function StatsRow({ record }: { record: HuntRecord }): JSX.Element {
  const t = useT();
  const dotColor = record.list ? DOT_COLOR[record.list] : "var(--wh-fg-3)";

  return (
    <li class="wh-stats__row">
      <span class="wh-stats__word" data-tooltip={record.word}>
        <span class="wh-stats__dot" style={{ background: dotColor }} />
        <span class="wh-stats__word-text">{record.word}</span>
      </span>
      <span class="wh-stats__meta">{formatRelative(record.foundAt)}</span>
      <span class="wh-stats__meta">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={record.hintUsed ? "wh-stats__hint wh-stats__hint--used" : "wh-stats__hint"}
        role="img"
        aria-label={record.hintUsed ? t("stats_hint_used_aria") : t("stats_no_hint_aria")}
        data-tooltip={record.hintUsed ? t("stats_hint_used_tooltip") : t("stats_no_hint_tooltip")}
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
    </li>
  );
}
