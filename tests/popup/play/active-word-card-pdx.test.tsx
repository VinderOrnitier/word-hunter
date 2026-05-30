import { render } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { ActiveWordCardPdx } from "../../../src/popup/play/ActiveWordCard.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderPdx(ui: ComponentChildren) {
  return render(<ThemeContext.Provider value="pokedex">{ui}</ThemeContext.Provider>);
}

describe("ActiveWordCardPdx", () => {
  it("renders the empty state with NO HUNT eyebrow and a spacer", () => {
    const { container, getByText } = renderPdx(
      <ActiveWordCardPdx activeWord={null} onClear={() => {}} />
    );
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-active__art--empty")).not.toBeNull();
    expect(container.querySelector(".pdx-active__spacer")).not.toBeNull();
    expect(getByText("No hunt")).toBeInTheDocument();
  });

  it("renders the active word with NOW HUNTING eyebrow and a stop button", () => {
    const onClear = jest.fn();
    const { container, getByText, getByRole } = renderPdx(
      <ActiveWordCardPdx
        activeWord={{ word: "pikachu", list: "pokemon", insertedAt: 0 }}
        onClear={onClear}
      />
    );
    expect(getByText("Now hunting")).toBeInTheDocument();
    expect(container.querySelector(".pdx-active__word")?.textContent).toBe("pikachu");
    getByRole("button").click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
