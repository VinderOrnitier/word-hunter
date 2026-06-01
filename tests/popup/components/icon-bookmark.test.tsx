import { render } from "@testing-library/preact";
import { Icon } from "../../../src/popup/components/Icon";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

describe("Icon bookmark", () => {
  it("renders a bookmark under slate", () => {
    const { container } = render(
      <ThemeContext.Provider value="slate">
        <Icon name="bookmark" size={16} />
      </ThemeContext.Provider>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("16");
  });

  it("renders the offline Pixelarticons bookmark body under pokedex", () => {
    const { container } = render(
      <ThemeContext.Provider value="pokedex">
        <Icon name="bookmark" size={16} />
      </ThemeContext.Provider>
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.innerHTML).toContain("M6 2h12v2H6z");
  });
});
