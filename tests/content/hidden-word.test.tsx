import { render, fireEvent } from "@testing-library/preact";
import { HiddenWord } from "../../src/content/components/HiddenWord";

describe("HiddenWord", () => {
  it("renders one .hw-char per character with the matching data-char", () => {
    render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
    const chars = document.querySelectorAll(".hw-char");
    expect(chars).toHaveLength(3);
    expect([...chars].map((el) => el.getAttribute("data-char"))).toEqual([
      "f",
      "o",
      "x",
    ]);
  });

  it("emits no DOM text matching the word — Ctrl+F bypass survives", () => {
    render(<HiddenWord word="eagle" found={false} onFind={() => {}} />);
    expect(document.body.textContent ?? "").not.toContain("eagle");
  });

  it("applies the .hw-word--found modifier when found=true", () => {
    render(<HiddenWord word="fox" found={true} onFind={() => {}} />);
    const word = document.querySelector(".hw-word");
    expect(word?.classList.contains("hw-word--found")).toBe(true);
  });

  it("omits the .hw-word--found modifier when found=false", () => {
    render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
    const word = document.querySelector(".hw-word");
    expect(word?.classList.contains("hw-word--found")).toBe(false);
  });

  it("calls onFind when the word is clicked", () => {
    const handler = jest.fn();
    render(<HiddenWord word="fox" found={false} onFind={handler} />);
    fireEvent.click(document.querySelector(".hw-word")!);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not expose the word via data-word attribute", () => {
    render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
    expect(document.querySelector(".hw-word")?.getAttribute("data-word")).toBeNull();
  });
});
