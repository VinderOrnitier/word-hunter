import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { Achievement, CollectionStats, StreakStats } from "../collection/types";
import { Icon } from "../components/Icon";

interface ProgressRowProps {
  stats: CollectionStats;
  streak: StreakStats;
  achievements: Achievement[];
}

const CELL_COUNT = 10;

export function ProgressRowPdx({ stats, streak, achievements }: ProgressRowProps): JSX.Element {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(stats.ratio * 100);
  const filled = Math.min(CELL_COUNT, Math.floor(pct / 10));
  const headIndex = filled < CELL_COUNT ? filled : -1;
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div class="pdx-progress-wrap">
      <div class="pdx-progress">
        <span class="pdx-progress__label">{t("pdx_progress_caught_label")}</span>
        <div class="pdx-progress__bar" aria-hidden="true">
          {Array.from({ length: CELL_COUNT }, (_, i) => (
            <span
              key={i}
              class={`pdx-progress__cell${i < filled ? " is-filled" : ""}${
                i === headIndex ? " is-head" : ""
              }`}
            />
          ))}
        </div>
        <span class="pdx-progress__count">
          {stats.caught} / {stats.total}
        </span>
        <button
          type="button"
          class="pdx-progress__chev"
          aria-expanded={expanded}
          aria-label={t("progress_aria_label", {
            caught: stats.caught,
            total: stats.total,
            unlocked,
            achTotal: achievements.length,
          })}
          onClick={() => setExpanded((v) => !v)}
        >
          <Icon name="chevron-down" size={12} />
        </button>
      </div>

      {expanded && (
        <div class="pdx-progress__panel">
          <div class="pdx-progress__section">
            <span class="pdx-progress__eyebrow">{t("progress_streak_eyebrow")}</span>
            <div class="pdx-progress__streak-stats">
              <div class="pdx-progress__stat">
                <span class="pdx-progress__stat-value">{streak.current}d</span>
                <span class="pdx-progress__stat-label">{t("progress_current_label")}</span>
              </div>
              <div class="pdx-progress__stat">
                <span class="pdx-progress__stat-value">{streak.longest}d</span>
                <span class="pdx-progress__stat-label">{t("progress_longest_label")}</span>
              </div>
            </div>
          </div>
          <div class="pdx-progress__section">
            <span class="pdx-progress__eyebrow">{t("progress_achievements_eyebrow")}</span>
            <div class="pdx-progress__ach-list">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  class={`pdx-progress__ach${a.unlocked ? "" : " is-locked"}`}
                  title={a.hint ?? a.label}
                >
                  <span class="pdx-progress__ach-icon" aria-hidden="true">
                    <Icon name="star" size={9} filled={a.unlocked} />
                  </span>
                  <span class="pdx-progress__ach-label">{a.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
