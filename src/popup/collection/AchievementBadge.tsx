import type { JSX } from "preact";
import type { Achievement } from "./types";

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps): JSX.Element {
  const classes = `wh-achievement${achievement.unlocked ? "" : " is-locked"}`;
  return (
    <span class={classes} title={achievement.hint ?? achievement.label}>
      <span class="wh-achievement__dot" aria-hidden="true" />
      <span class="wh-achievement__label">{achievement.label}</span>
    </span>
  );
}
