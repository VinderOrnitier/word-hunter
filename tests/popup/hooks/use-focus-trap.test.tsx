import { fireEvent, render, waitFor } from "@testing-library/preact";
import { useRef } from "preact/hooks";
import { useFocusTrap } from "../../../src/popup/hooks/useFocusTrap";

interface HarnessProps {
  active: boolean;
  onEscape: () => void;
}

function Harness({ active, onEscape }: HarnessProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstRef = useRef<HTMLButtonElement | null>(null);
  useFocusTrap(containerRef, { active, onEscape, initialFocusRef: firstRef });
  return (
    <div ref={containerRef}>
      <button ref={firstRef} type="button">
        first
      </button>
      <button type="button">middle</button>
      <button type="button">last</button>
    </div>
  );
}

function buttons(container: ParentNode): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll("button"));
}

describe("useFocusTrap", () => {
  it("moves focus to the initialFocusRef element when activated", async () => {
    const { container } = render(<Harness active onEscape={() => {}} />);
    const [first] = buttons(container);
    await waitFor(() => expect(document.activeElement).toBe(first));
  });

  it("calls onEscape when Escape is pressed while active", () => {
    const onEscape = jest.fn();
    render(<Harness active onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("wraps focus from the last element to the first on Tab", () => {
    const { container } = render(<Harness active onEscape={() => {}} />);
    const els = buttons(container);
    const first = els[0];
    const last = els[els.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("wraps focus from the first element to the last on Shift+Tab", () => {
    const { container } = render(<Harness active onEscape={() => {}} />);
    const els = buttons(container);
    const first = els[0];
    const last = els[els.length - 1];
    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("does nothing when inactive", () => {
    const onEscape = jest.fn();
    const { container } = render(<Harness active={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).not.toHaveBeenCalled();
    expect(buttons(container).includes(document.activeElement as HTMLButtonElement)).toBe(false);
  });
});
