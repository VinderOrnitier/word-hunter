import { render } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { Icon, type IconName, PIXELARTICONS_SLUG } from "../../../src/popup/components/Icon";
import { PIXELARTICONS_BODIES } from "../../../src/popup/components/pixelarticons";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function pdx(children: ComponentChildren) {
  return <ThemeContext.Provider value="pokedex">{children}</ThemeContext.Provider>;
}

describe("Icon theme branch", () => {
  it("renders a Lucide (stroke) glyph under slate by default", () => {
    const { container } = render(<Icon name="search" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
  });

  it("renders a Pixelarticons (fill, no stroke) glyph under pokedex", () => {
    const { container } = render(pdx(<Icon name="search" />));
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).not.toHaveAttribute("stroke");
    expect(svg?.innerHTML).toContain("path");
  });

  it("respects the size prop in the pokedex branch", () => {
    const { container } = render(pdx(<Icon name="star" size={40} />));
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("maps all 17 roles to a slug that has a body", () => {
    const roles = Object.keys(PIXELARTICONS_SLUG) as IconName[];
    expect(roles).toHaveLength(17);
    for (const role of roles) {
      expect(PIXELARTICONS_BODIES[PIXELARTICONS_SLUG[role]]).toBeTruthy();
    }
  });

  it("renders a glyph for every role under pokedex", () => {
    for (const role of Object.keys(PIXELARTICONS_SLUG) as IconName[]) {
      const { container } = render(pdx(<Icon name={role} />));
      expect(container.querySelector("svg")?.innerHTML).toContain("path");
    }
  });
});
