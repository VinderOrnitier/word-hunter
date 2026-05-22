import { listAchievements } from "../../../src/popup/collection/listAchievements";
import type { CollectionStats, StreakStats } from "../../../src/popup/collection/types";

function stats(overrides: Partial<CollectionStats> = {}): CollectionStats {
  return { caught: 0, total: 55, totalCatches: 0, ratio: 0, ...overrides };
}

function streak(overrides: Partial<StreakStats> = {}): StreakStats {
  return { current: 0, longest: 0, ...overrides };
}

describe("listAchievements", () => {
  it("returns 5 achievements in stable order", () => {
    const result = listAchievements(stats(), streak());
    expect(result.map((a) => a.id)).toEqual([
      "first-catch",
      "half-way",
      "master-hunter",
      "streak-7",
      "streak-30",
    ]);
  });

  it("unlocks first-catch when at least one catch has been made", () => {
    const locked = listAchievements(stats({ totalCatches: 0 }), streak());
    expect(locked.find((a) => a.id === "first-catch")?.unlocked).toBe(false);

    const unlocked = listAchievements(stats({ totalCatches: 1 }), streak());
    expect(unlocked.find((a) => a.id === "first-catch")?.unlocked).toBe(true);
  });

  it("unlocks half-way at ratio >= 0.5", () => {
    expect(
      listAchievements(stats({ ratio: 0.49 }), streak()).find((a) => a.id === "half-way")?.unlocked
    ).toBe(false);
    expect(
      listAchievements(stats({ ratio: 0.5 }), streak()).find((a) => a.id === "half-way")?.unlocked
    ).toBe(true);
  });

  it("unlocks master-hunter only at ratio === 1", () => {
    expect(
      listAchievements(stats({ ratio: 0.99 }), streak()).find((a) => a.id === "master-hunter")
        ?.unlocked
    ).toBe(false);
    expect(
      listAchievements(stats({ ratio: 1 }), streak()).find((a) => a.id === "master-hunter")
        ?.unlocked
    ).toBe(true);
  });

  it("unlocks streak-7 when either current or longest reaches 7", () => {
    expect(
      listAchievements(stats(), streak({ current: 6, longest: 6 })).find((a) => a.id === "streak-7")
        ?.unlocked
    ).toBe(false);
    expect(
      listAchievements(stats(), streak({ current: 7, longest: 7 })).find((a) => a.id === "streak-7")
        ?.unlocked
    ).toBe(true);
    expect(
      listAchievements(stats(), streak({ current: 0, longest: 9 })).find((a) => a.id === "streak-7")
        ?.unlocked
    ).toBe(true);
  });

  it("unlocks streak-30 when either current or longest reaches 30", () => {
    expect(
      listAchievements(stats(), streak({ current: 29, longest: 29 })).find(
        (a) => a.id === "streak-30"
      )?.unlocked
    ).toBe(false);
    expect(
      listAchievements(stats(), streak({ current: 30, longest: 30 })).find(
        (a) => a.id === "streak-30"
      )?.unlocked
    ).toBe(true);
  });

  it("attaches a hint to locked achievements", () => {
    const result = listAchievements(
      stats({ caught: 5, total: 55, ratio: 5 / 55 }),
      streak({ current: 0, longest: 0 })
    );
    const halfway = result.find((a) => a.id === "half-way")!;
    expect(halfway.unlocked).toBe(false);
    expect(halfway.hint).toBeTruthy();
  });

  it("does not attach a hint to unlocked achievements", () => {
    const result = listAchievements(stats({ totalCatches: 1 }), streak());
    const first = result.find((a) => a.id === "first-catch")!;
    expect(first.unlocked).toBe(true);
    expect(first.hint).toBeUndefined();
  });
});
