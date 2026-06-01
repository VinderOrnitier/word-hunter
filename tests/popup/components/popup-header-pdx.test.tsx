import { fireEvent, render } from "@testing-library/preact";
import { PopupHeaderPdx } from "../../../src/popup/components/PopupHeader.pdx";

describe("PopupHeaderPdx", () => {
  it("renders the device chrome: lens, three LEDs, pixel wordmark, info key", () => {
    const { container } = render(<PopupHeaderPdx onRules={() => {}} rulesActive={false} />);
    expect(container.querySelector(".pdx-popup__lens")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-popup__leds .led")).toHaveLength(3);
    expect(container.querySelector(".pdx-popup__wordmark")?.textContent).toBe("WORD HUNTER");
    expect(container.querySelector(".pdx-popup__info")).not.toBeNull();
  });

  it("marks the info key active and fires onRules when clicked", () => {
    const onRules = jest.fn();
    const { container, rerender } = render(<PopupHeaderPdx onRules={onRules} rulesActive={true} />);
    const info = container.querySelector(".pdx-popup__info");
    expect(info).toHaveClass("is-active");
    expect(info).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(info as Element);
    expect(onRules).toHaveBeenCalledTimes(1);
    rerender(<PopupHeaderPdx onRules={onRules} rulesActive={false} />);
    expect(container.querySelector(".pdx-popup__info")).not.toHaveClass("is-active");
  });
});
