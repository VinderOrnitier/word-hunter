import { fireEvent, render } from "@testing-library/preact";
import { HiddenWordPdx } from "../../src/content/components/HiddenWord.pdx";

describe("HiddenWordPdx", () => {
  it("renders the reversed word with the highlight class", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={false} />);
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("pdx-highlight");
    expect(btn?.className).not.toContain("pdx-highlight--found");
    expect(btn?.textContent).toBe("retto");
  });

  it("uses the found variant class once found", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={true} />);
    expect(container.querySelector("button")?.className).toContain("pdx-highlight--found");
  });

  it("calls onFind on click", () => {
    const onFind = jest.fn();
    const { container } = render(<HiddenWordPdx word="otter" found={false} onFind={onFind} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(onFind).toHaveBeenCalledTimes(1);
  });
});
