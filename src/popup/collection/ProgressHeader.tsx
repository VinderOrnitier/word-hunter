import type { JSX } from "preact";
import { Eyebrow } from "../components/Eyebrow";
import { AchievementBadge } from "./AchievementBadge";
import type { Achievement, CollectionStats, StreakStats } from "./types";

interface ProgressHeaderProps {
  stats: CollectionStats;
  streak: StreakStats;
  achievements: Achievement[];
  listLabel: string;
}

export function ProgressHeader({
  stats,
  streak,
  achievements,
  listLabel,
}: ProgressHeaderProps): JSX.Element {
  const pct = Math.round(stats.ratio * 100);
  return (
    <div class="wh-progress-header">
      <div class="wh-progress-header__row">
        <Eyebrow>{listLabel}</Eyebrow>
        <span class="wh-progress-header__count">
          {stats.caught} / {stats.total}
        </span>
      </div>
      <div class="wh-progress" aria-label={`${pct}% complete`}>
        <div class="wh-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div class="wh-progress-header__chips">
        <span class="wh-chip-info wh-chip-info--streak">
          {streak.current}d streak
        </span>
        <span class="wh-chip-info wh-chip-info--catches">
          {stats.totalCatches} catches
        </span>
      </div>
      <div class="wh-progress-header__achievements">
        {achievements.map((a) => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}
