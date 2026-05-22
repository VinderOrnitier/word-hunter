import type { Achievement, CollectionStats, StreakStats } from "./types";

export function listAchievements(stats: CollectionStats, streak: StreakStats): Achievement[] {
  const missing = Math.max(0, Math.ceil(stats.total / 2) - stats.caught);
  const remaining = Math.max(0, stats.total - stats.caught);

  const firstCatch: Achievement = {
    id: "first-catch",
    label: "First catch",
    unlocked: stats.totalCatches >= 1,
  };
  if (!firstCatch.unlocked) firstCatch.hint = "Find your first hidden word";

  const halfWay: Achievement = {
    id: "half-way",
    label: "Half-way",
    unlocked: stats.ratio >= 0.5,
  };
  if (!halfWay.unlocked) halfWay.hint = `Catch ${missing} more to reach 50%`;

  const masterHunter: Achievement = {
    id: "master-hunter",
    label: "Master hunter",
    unlocked: stats.ratio === 1,
  };
  if (!masterHunter.unlocked) masterHunter.hint = `Catch ${remaining} more for the full collection`;

  const streak7: Achievement = {
    id: "streak-7",
    label: "7-day streak",
    unlocked: streak.current >= 7 || streak.longest >= 7,
  };
  if (!streak7.unlocked) streak7.hint = `Hunt 7 days in a row`;

  const streak30: Achievement = {
    id: "streak-30",
    label: "30-day streak",
    unlocked: streak.current >= 30 || streak.longest >= 30,
  };
  if (!streak30.unlocked) streak30.hint = `Hunt 30 days in a row`;

  return [firstCatch, halfWay, masterHunter, streak7, streak30];
}
