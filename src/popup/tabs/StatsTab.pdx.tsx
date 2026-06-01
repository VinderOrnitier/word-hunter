import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { HuntRecord, WordSource } from "../../shared/types";
import { ConfirmOverlayPdx } from "../components/ConfirmOverlay.pdx";
import { Icon } from "../components/Icon";
import { useConfirmAction } from "../hooks/useConfirmAction";
import { useStorage } from "../hooks/useStorage";
import { formatDuration, formatRelative } from "../utils/format";

const DOT_COLOR: Record<WordSource, string> = {
  animals: "var(--pdx-led-green)",
  pokemon: "var(--pdx-led-red)",
  custom: "var(--pdx-lcd-ink-2)",
};

export function StatsTabPdx(): JSX.Element {
  const t = useT();
  const [finds, setFinds] = useStorage("finds", []);
  const clearAction = useConfirmAction({ onConfirm: () => setFinds([]) });

  if (finds.length === 0) {
    return (
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="stats-empty">
            <Icon name="search" size={36} />
            <span class="stats-empty__line">{t("stats_empty_body")}</span>
            <span class="stats-empty__flavor">{t("stats_empty_editorial")}</span>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...finds].sort((a, b) => b.foundAt - a.foundAt);

  return (
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="pdx-stats__header">
            <span class="pdx-progress__label">{t("stats_n_hunts", { count: finds.length })}</span>
            <button
              type="button"
              class="pdx-keycap-action pdx-keycap-action--danger"
              onClick={clearAction.arm}
            >
              <Icon name="trash" size={10} />
              {t("stats_clear")}
            </button>
          </div>
          <div class="stats-list">
            <div class="stats-row stats-row--header" aria-hidden="true">
              <span class="col">{t("stats_col_word")}</span>
              <span class="col">{t("stats_col_found")}</span>
              <span class="col">
                <Icon name="timer" size={10} />
              </span>
              <span class="col">{t("stats_col_hint_header")}</span>
              <span class="col">{t("stats_col_page")}</span>
            </div>
            {sorted.map((r) => (
              <StatsRowPdx key={`${r.word}-${r.foundAt}`} record={r} />
            ))}
          </div>
        </div>
      </div>

      {clearAction.armed && (
        <ConfirmOverlayPdx
          prompt={t("stats_clear_confirm")}
          onConfirm={clearAction.confirm}
          onCancel={clearAction.cancel}
        />
      )}
    </>
  );
}

function StatsRowPdx({ record }: { record: HuntRecord }): JSX.Element {
  const t = useT();
  const dotColor = record.list ? DOT_COLOR[record.list] : "var(--pdx-lcd-ink-2)";
  return (
    <div class="stats-row">
      <span class="stats-row__word" title={record.word}>
        <span class="stats-row__dot" style={{ color: dotColor }} />
        {record.word}
      </span>
      <span class="stats-row__time">{formatRelative(record.foundAt)}</span>
      <span class="stats-row__dur">{formatDuration(record.searchDurationSeconds)}</span>
      <span
        class={`stats-row__hint${record.hintUsed ? "" : " stats-row__hint--empty"}`}
        role="img"
        aria-label={record.hintUsed ? t("stats_hint_used_aria") : t("stats_no_hint_aria")}
      />
      <a
        class="stats-row__link"
        href={record.pageUrl}
        target="_blank"
        rel="noopener"
        aria-label={record.pageTitle}
      >
        <Icon name="external" size={12} />
      </a>
    </div>
  );
}
