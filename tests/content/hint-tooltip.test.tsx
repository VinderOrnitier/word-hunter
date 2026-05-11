import { render } from "@testing-library/preact";
import { HintTooltip } from "../../src/content/components/HintTooltip";

describe("HintTooltip", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(<HintTooltip visible={false} />);
    expect(container.querySelector(".hw-hint-tooltip")).toBeNull();
  });

  it("renders the hint message at top-right when visible=true", () => {
    render(<HintTooltip visible={true} />);
    const tooltip = document.querySelector(".hw-hint-tooltip");
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toBe("The word is hidden on this page");
  });
});
