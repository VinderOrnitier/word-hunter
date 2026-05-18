import { render, screen } from "@testing-library/preact";
import { ProgressHeader } from "../../../src/popup/collection/ProgressHeader";
import type { Achievement, CollectionStats, StreakStats } from "../../../src/popup/collection/types";

const sampleStats: CollectionStats = {
  caught: 27,
  total: 55,
  totalCatches: 60,
  ratio: 27 / 55,
};

const sampleStreak: StreakStats = { current: 3, longest: 10 };

const sampleAchievements: Achievement[] = [
  { id: "first-catch", label: "First catch", unlocked: true },
  { id: "half-way", label: "Half-way", unlocked: false, hint: "Catch 1 more" },
  { id: "master-hunter", label: "Master hunter", unlocked: false, hint: "Catch 28 more" },
  { id: "streak-7", label: "7-day streak", unlocked: true },
  { id: "streak-30", label: "30-day streak", unlocked: false, hint: "Hunt 30 days" },
];

describe("ProgressHeader", () => {
  it("renders the caught / total count", () => {
    render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    expect(screen.getByText(/27/)).toBeInTheDocument();
    expect(screen.getByText(/55/)).toBeInTheDocument();
  });

  it("renders the list label in the eyebrow", () => {
    render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Pokémon"
      />
    );
    expect(screen.getByText("Pokémon")).toBeInTheDocument();
  });

  it("renders a progress bar fill scaled to the ratio", () => {
    const { container } = render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    const fill = container.querySelector(".wh-progress__fill") as HTMLElement;
    expect(fill).not.toBeNull();
    const expectedPct = Math.round(sampleStats.ratio * 100);
    expect(fill.style.width).toBe(`${expectedPct}%`);
  });

  it("renders the streak chip", () => {
    render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    expect(screen.getByText(/3d streak/)).toBeInTheDocument();
  });

  it("renders the total catches chip", () => {
    render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    expect(screen.getByText(/60 catches/)).toBeInTheDocument();
  });

  it("renders an AchievementBadge per achievement", () => {
    const { container } = render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    const badges = container.querySelectorAll(".wh-achievement");
    expect(badges).toHaveLength(5);
  });

  it("attaches the hint as tooltip on locked achievements", () => {
    const { container } = render(
      <ProgressHeader
        stats={sampleStats}
        streak={sampleStreak}
        achievements={sampleAchievements}
        listLabel="Animals"
      />
    );
    const locked = container.querySelectorAll(".wh-achievement.is-locked");
    expect(locked.length).toBeGreaterThan(0);
    locked.forEach((node) => {
      expect(node.getAttribute("title")).toBeTruthy();
    });
  });
});
