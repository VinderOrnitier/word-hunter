import { render, screen, fireEvent } from "@testing-library/preact";
import { PopupHeader } from "../../../src/popup/components/PopupHeader";

describe("PopupHeader", () => {
  it("renders the Word Hunter wordmark without a highlight span on 'u'", () => {
    render(<PopupHeader onRules={() => {}} rulesActive={false} />);
    const wordmark = document.querySelector(".wh-header__wordmark");
    expect(wordmark?.querySelector(".wh-highlight")).toBeNull();
    expect(wordmark?.textContent).toMatch(/word hunter/i);
  });

  it("renders a Rules button with accessible label", () => {
    render(<PopupHeader onRules={() => {}} rulesActive={false} />);
    expect(screen.getByRole("button", { name: /rules/i })).toBeInTheDocument();
  });

  it("calls onRules when the Rules button is clicked", () => {
    const onRules = jest.fn();
    render(<PopupHeader onRules={onRules} rulesActive={false} />);
    fireEvent.click(screen.getByRole("button", { name: /rules/i }));
    expect(onRules).toHaveBeenCalledTimes(1);
  });

  it("marks the Rules button as pressed when rulesActive is true", () => {
    render(<PopupHeader onRules={() => {}} rulesActive={true} />);
    expect(screen.getByRole("button", { name: /rules/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("marks the Rules button as not pressed when rulesActive is false", () => {
    render(<PopupHeader onRules={() => {}} rulesActive={false} />);
    expect(screen.getByRole("button", { name: /rules/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
