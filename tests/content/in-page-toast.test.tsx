import { fireEvent, render } from "@testing-library/preact";
import { InPageToast } from "../../src/content/components/InPageToast";

describe("InPageToast", () => {
  it("renders the toast container", () => {
    const { container } = render(<InPageToast message="Test" locale="en" variant="hint" onClose={() => {}} />);
    expect(container.querySelector(".hw-toast")).not.toBeNull();
  });

  it("applies hw-toast--hint class for hint variant", () => {
    const { container } = render(<InPageToast message="Test" locale="en" variant="hint" onClose={() => {}} />);
    expect(container.querySelector(".hw-toast--hint")).not.toBeNull();
  });

  it("applies hw-toast--info class for info variant", () => {
    const { container } = render(<InPageToast message="Test" locale="en" variant="info" onClose={() => {}} />);
    expect(container.querySelector(".hw-toast--info")).not.toBeNull();
  });

  it("renders the message text", () => {
    const { container } = render(
      <InPageToast message="The word is hidden on this page." locale="en" variant="hint" onClose={() => {}} />
    );
    expect(container.querySelector(".hw-toast__message")?.textContent).toBe(
      "The word is hidden on this page."
    );
  });

  it("renders a glyph button that opens the popup", () => {
    const { container } = render(<InPageToast message="Test" locale="en" variant="info" onClose={() => {}} />);
    const btn = container.querySelector(".hw-toast__glyph");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("aria-label")).toBe("Open Word Hunter");
  });

  it("renders a close button with accessible label", () => {
    const { container } = render(<InPageToast message="Test" locale="en" variant="hint" onClose={() => {}} />);
    const btn = container.querySelector(".hw-toast__close");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("aria-label")).toBe("Dismiss");
  });

  it("renders localized aria-labels when locale='uk'", () => {
    const { container } = render(<InPageToast message="Test" locale="uk" variant="hint" onClose={() => {}} />);
    expect(container.querySelector(".hw-toast__glyph")?.getAttribute("aria-label")).toBe("Відкрити Word Hunter");
    expect(container.querySelector(".hw-toast__close")?.getAttribute("aria-label")).toBe("Закрити");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(<InPageToast message="Test" locale="en" variant="hint" onClose={onClose} />);
    fireEvent.click(container.querySelector(".hw-toast__close")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
