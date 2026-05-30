import { fireEvent, render } from "@testing-library/preact";
import type {
  Achievement,
  CollectionStats,
  StreakStats,
} from "../../../src/popup/collection/types";
import { ProgressRowPdx } from "../../../src/popup/play/ProgressRow.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

const stats: CollectionStats = { caught: 31, total: 151, totalCatches: 42, ratio: 31 / 151 };
const streak: StreakStats = { current: 3, longest: 7 };
const achievements: Achievement[] = [
  { id: "first-catch", label: "First catch", unlocked: true },
  { id: "half-way", label: "Half way", unlocked: false, hint: "Catch half" },
];

function renderPdx() {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ProgressRowPdx stats={stats} streak={streak} achievements={achievements} />
    </ThemeContext.Provider>
  );
}

describe("ProgressRowPdx", () => {
  it("renders exactly 4 grid children and a 10-cell bar (TRAP #4)", () => {
    const { container } = renderPdx();
    const row = container.querySelector(".pdx-progress");
    expect(row?.children.length).toBe(4);
    expect(container.querySelectorAll(".pdx-progress__cell").length).toBe(10);
  });

  it("fills floor(pct/10) cells with a head cell after them", () => {
    const { container } = renderPdx(); // 31/151 = 20.5% -> 2 filled, head at index 2
    expect(container.querySelectorAll(".pdx-progress__cell.is-filled").length).toBe(2);
    expect(container.querySelectorAll(".pdx-progress__cell.is-head").length).toBe(1);
  });

  it("shows the spaced count text", () => {
    const { getByText } = renderPdx();
    expect(getByText("31 / 151")).toBeInTheDocument();
  });

  it("toggles the expansion panel via the chevron", () => {
    const { container, getByRole } = renderPdx();
    expect(container.querySelector(".pdx-progress__panel")).toBeNull();
    fireEvent.click(getByRole("button"));
    expect(container.querySelector(".pdx-progress__panel")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-progress__ach").length).toBe(2);
  });
});
