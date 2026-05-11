import { render } from "@testing-library/preact";
import { Icon } from "../../../src/popup/components/Icon";

describe("Icon", () => {
  it("renders an SVG with the given size", () => {
    const { container } = render(<Icon name="search" size={20} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("uses default size 16 when none is provided", () => {
    const { container } = render(<Icon name="settings" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
  });

  it("renders nothing for an unknown icon name", () => {
    const { container } = render(<Icon name={"nope" as never} />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
