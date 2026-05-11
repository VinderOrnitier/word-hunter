import { render } from "@testing-library/preact";
import { Highlight } from "../../../src/popup/components/Highlight";

describe("Highlight", () => {
  it("wraps children in a .wh-highlight span (primary by default)", () => {
    const { container } = render(<Highlight>eagle</Highlight>);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.classList.contains("wh-highlight")).toBe(true);
    expect(span?.classList.contains("wh-highlight--found")).toBe(false);
    expect(span?.textContent).toBe("eagle");
  });

  it("applies .wh-highlight--found when tone='found'", () => {
    const { container } = render(<Highlight tone="found">eagle</Highlight>);
    const span = container.querySelector("span");
    expect(span?.classList.contains("wh-highlight")).toBe(true);
    expect(span?.classList.contains("wh-highlight--found")).toBe(true);
  });
});
