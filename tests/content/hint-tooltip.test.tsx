import { render, fireEvent } from "@testing-library/preact";
import { HintTooltip } from "../../src/content/components/HintTooltip";

describe("HintTooltip", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(<HintTooltip visible={false} />);
    expect(container.querySelector(".hw-hint-tooltip")).toBeNull();
  });

  it("renders the hint message when visible=true", () => {
    const { container } = render(<HintTooltip visible={true} />);
    const tooltip = container.querySelector(".hw-hint-tooltip");
    expect(tooltip).not.toBeNull();
    expect(tooltip?.querySelector(".hw-hint-tooltip__message")?.textContent).toBe(
      "The word is hidden on this page"
    );
  });

  it("renders a close button when visible=true", () => {
    const { container } = render(<HintTooltip visible={true} />);
    expect(container.querySelector(".hw-hint-tooltip__close")).not.toBeNull();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(<HintTooltip visible={true} onClose={onClose} />);
    const btn = container.querySelector(".hw-hint-tooltip__close")!;
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
