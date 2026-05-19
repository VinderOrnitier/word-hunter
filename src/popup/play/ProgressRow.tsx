import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { Icon } from "../components/Icon";
import type { Achievement, CollectionStats, StreakStats } from "../collection/types";

interface ProgressRowProps {
  stats: CollectionStats;
  streak: StreakStats;
  achievements: Achievement[];
}

export function ProgressRow({ stats, streak, achievements }: ProgressRowProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(stats.ratio * 100);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const hasUnlocked = unlocked > 0;

  return (
    <div class="wh-progress-row">
      <button
        type="button"
        class={`wh-progress-row__button${expanded ? " is-expanded" : ""}`}
        aria-expanded={expanded}
        aria-label="Progress"
        onClick={() => setExpanded((v) => !v)}
      >
        <span class="wh-progress-row__count">
          {stats.caught}/{stats.total}
        </span>
        <span class="wh-progress-row__bar" aria-hidden="true">
          <span class="wh-progress-row__fill" style={{ width: `${pct}%` }} />
        </span>
        <span
          class={`wh-progress-row__ach-chip${expanded ? " is-expanded" : ""}`}
          aria-label={`${unlocked} of ${total} achievements unlocked`}
        >
          <span
            class={`wh-progress-row__ach-icon${hasUnlocked ? " is-unlocked" : ""}`}
            aria-hidden="true"
          >
            <Icon name="star" size={10} filled={hasUnlocked} />
          </span>
          <span class="wh-progress-row__ach-count">
            {unlocked}/{total}
          </span>
        </span>
        <span
          class={`wh-progress-row__chevron${expanded ? " is-expanded" : ""}`}
          aria-hidden="true"
        >
          <Icon name="chevron-down" size={10} />
        </span>
      </button>

      {expanded && (
        <div class="wh-progress-row__panel">
          <div class="wh-progress-row__streak">
            <span class="wh-progress-row__eyebrow">Streak</span>
            <div class="wh-progress-row__streak-stats">
              <div class="wh-progress-row__stat wh-progress-row__stat--current">
                <span class="wh-progress-row__stat-value">{streak.current}d</span>
                <span class="wh-progress-row__stat-label">current</span>
              </div>
              <span class="wh-progress-row__stat-sep" aria-hidden="true" />
              <div class="wh-progress-row__stat">
                <span class="wh-progress-row__stat-value">{streak.longest}d</span>
                <span class="wh-progress-row__stat-label">longest</span>
              </div>
            </div>
          </div>
          <div class="wh-progress-row__divider" aria-hidden="true" />
          <div class="wh-progress-row__achievements">
            <span class="wh-progress-row__eyebrow">Achievements</span>
            <div class="wh-progress-row__ach-list">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  class={`wh-progress-row__ach${a.unlocked ? "" : " is-locked"}`}
                  title={a.hint ?? a.label}
                >
                  <span
                    class={`wh-progress-row__ach-icon${a.unlocked ? " is-unlocked" : ""}`}
                    aria-hidden="true"
                  >
                    <Icon name="star" size={9} filled={a.unlocked} />
                  </span>
                  <span class="wh-progress-row__ach-label">{a.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
