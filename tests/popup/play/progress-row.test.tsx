import { fireEvent, render, screen } from "@testing-library/preact";
import type {
  Achievement,
  CollectionStats,
  StreakStats,
} from "../../../src/popup/collection/types";
import { ProgressRow } from "../../../src/popup/play/ProgressRow";

const stats: CollectionStats = { caught: 3, total: 10, totalCatches: 7, ratio: 0.3 };
const streak: StreakStats = { current: 4, longest: 9 };
const achievements: Achievement[] = [
  { id: "first-catch", label: "First catch", unlocked: true },
  { id: "half-way", label: "Half-way", unlocked: false, hint: "Catch half of the list" },
  { id: "master-hunter", label: "Master hunter", unlocked: false },
  { id: "streak-7", label: "7-day streak", unlocked: false },
  { id: "streak-30", label: "30-day streak", unlocked: false },
];

describe("ProgressRow", () => {
  it("renders the count, achievement counter and chevron when collapsed", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("is collapsed by default — accordion panel is not rendered", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    expect(screen.queryByText(/streak$/i)).toBeNull();
    expect(screen.queryByText(/achievements$/i)).toBeNull();
  });

  it("toggles aria-expanded on the button when clicked", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    const button = screen.getByRole("button", { name: /progress/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("expands to show streak block (current vs longest) when clicked", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    fireEvent.click(screen.getByRole("button", { name: /progress/i }));
    expect(screen.getByText("4d")).toBeInTheDocument();
    expect(screen.getByText("9d")).toBeInTheDocument();
    expect(screen.getByText(/current/i)).toBeInTheDocument();
    expect(screen.getByText(/longest/i)).toBeInTheDocument();
  });

  it("expands to show all achievement labels", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    fireEvent.click(screen.getByRole("button", { name: /progress/i }));
    for (const a of achievements) {
      expect(screen.getByText(a.label)).toBeInTheDocument();
    }
  });

  it("marks locked achievement pills with the is-locked class", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    fireEvent.click(screen.getByRole("button", { name: /progress/i }));
    const halfway = screen.getByText("Half-way").closest(".wh-progress-row__ach");
    expect(halfway).toHaveClass("is-locked");
  });

  it("collapses again when clicked a second time", () => {
    render(<ProgressRow stats={stats} streak={streak} achievements={achievements} />);
    const button = screen.getByRole("button", { name: /progress/i });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("4d")).toBeNull();
  });

  it("renders the progress fill at the right ratio", () => {
    const { container } = render(
      <ProgressRow stats={stats} streak={streak} achievements={achievements} />
    );
    const fill = container.querySelector(".wh-progress-row__fill") as HTMLElement | null;
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe("30%");
  });
});
