import { render, screen } from "@testing-library/preact";
import { Badge } from "../../../src/popup/components/Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge tone="neutral">Animals</Badge>);
    expect(screen.getByText("Animals")).toBeInTheDocument();
  });

  it("applies a tone class for the given tone", () => {
    const { container } = render(<Badge tone="animals">Animals</Badge>);
    const badge = container.querySelector(".wh-badge");
    expect(badge).toHaveClass("wh-badge--animals");
  });

  it("renders a dot element when dotColor is provided", () => {
    const { container } = render(
      <Badge tone="pokemon" dotColor="var(--wh-list-pokemon)">
        Pokémon
      </Badge>
    );
    const dot = container.querySelector(".wh-badge__dot");
    expect(dot).not.toBeNull();
  });
});
