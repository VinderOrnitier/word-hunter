export type CatchCounts = Map<string, number>;

export interface CollectionStats {
  caught: number;
  total: number;
  totalCatches: number;
  ratio: number;
}

export interface StreakStats {
  current: number;
  longest: number;
}

export type AchievementId = "first-catch" | "half-way" | "master-hunter" | "streak-7" | "streak-30";

export interface Achievement {
  id: AchievementId;
  label: string;
  unlocked: boolean;
  hint?: string;
}

export type CollectionFilter = "all" | "caught" | "uncaught";
