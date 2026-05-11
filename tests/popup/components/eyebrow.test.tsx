import { render, screen } from "@testing-library/preact";
import { Eyebrow } from "../../../src/popup/components/Eyebrow";

describe("Eyebrow", () => {
  it("renders its children inside an element with the wh-eyebrow class", () => {
    render(<Eyebrow>Active word</Eyebrow>);
    const el = screen.getByText("Active word");
    expect(el).toHaveClass("wh-eyebrow");
  });
});
