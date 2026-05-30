import { render } from "@testing-library/preact";
import { CollectionGridPdx } from "../../../src/popup/collection/CollectionGrid.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderGrid(filter: "all" | "caught" | "uncaught", counts: Map<string, number>) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <CollectionGridPdx
        list="animals"
        filter={filter}
        counts={counts}
        activeWord={null}
        pendingWord={null}
        onPick={() => {}}
      />
    </ThemeContext.Provider>
  );
}

describe("CollectionGridPdx", () => {
  it("renders a .pdx-grid of slots for the all filter", () => {
    const { container } = renderGrid("all", new Map());
    expect(container.querySelector(".pdx-grid")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-slot-v2").length).toBeGreaterThan(0);
  });

  it("shows the pokedex empty message when no caught words match", () => {
    const { container, getByText } = renderGrid("caught", new Map());
    expect(container.querySelector(".pdx-collection-empty")).not.toBeNull();
    expect(getByText("No catches — go hunt!")).toBeInTheDocument();
  });
});
