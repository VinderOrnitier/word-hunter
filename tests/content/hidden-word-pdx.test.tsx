import { fireEvent, render } from "@testing-library/preact";
import { HiddenWordPdx } from "../../src/content/components/HiddenWord.pdx";

describe("HiddenWordPdx", () => {
  it("renders invisibly (hw-word, no pdx-highlight) when unfound", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={false} />);
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("hw-word");
    expect(btn?.className).not.toContain("pdx-highlight");
    expect(btn?.textContent).toBe("retto");
  });

  it("shows a yellow gradient underline (same as Slate) when hinted, no pdx-highlight", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={false} hinted={true} />);
    const btn = container.querySelector("button") as HTMLElement;
    expect(btn?.className).toContain("hw-word");
    expect(btn?.className).not.toContain("pdx-highlight");
    expect(btn.style.backgroundImage).toContain("var(--wh-primary)");
  });

  it("renders the same green gradient underline as Slate (hw-word--found) when found", () => {
    const { container } = render(<HiddenWordPdx word="otter" found={true} />);
    const btn = container.querySelector("button") as HTMLElement;
    expect(btn?.className).toContain("hw-word--found");
    expect(btn?.className).not.toContain("pdx-highlight");
    expect(btn.style.backgroundImage).toContain("var(--wh-found)");
  });

  it("calls onFind on click", () => {
    const onFind = jest.fn();
    const { container } = render(<HiddenWordPdx word="otter" found={false} onFind={onFind} />);
    fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    expect(onFind).toHaveBeenCalledTimes(1);
  });
});
