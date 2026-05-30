import { fireEvent, render } from "@testing-library/preact";
import { TabsPdx } from "../../../src/popup/components/Tabs.pdx";

describe("TabsPdx", () => {
  it("renders three key-cap tabs with labels", () => {
    const { container } = render(<TabsPdx active="play" onNavigate={() => {}} />);
    const tabs = container.querySelectorAll(".pdx-popup__tab");
    expect(tabs).toHaveLength(3);
    expect(container.querySelectorAll(".pdx-popup__tab-label")).toHaveLength(3);
  });

  it("marks the active tab and fires onNavigate on click", () => {
    const onNavigate = jest.fn();
    const { container } = render(<TabsPdx active="play" onNavigate={onNavigate} />);
    const tabs = container.querySelectorAll(".pdx-popup__tab");
    expect(tabs[0]).toHaveClass("is-active");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabs[1] as Element);
    expect(onNavigate).toHaveBeenCalledWith("stats");
  });
});
