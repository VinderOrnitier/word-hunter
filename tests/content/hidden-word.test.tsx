import { act, fireEvent, render } from "@testing-library/preact";
import { HiddenWord } from "../../src/content/components/HiddenWord";

describe("HiddenWord", () => {
  it("renders one .hw-char per character with the matching data-char", () => {
    render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
    const chars = document.querySelectorAll(".hw-char");
    expect(chars).toHaveLength(3);
    expect([...chars].map((el) => el.getAttribute("data-char"))).toEqual(["f", "o", "x"]);
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

  describe("cursor reveal delay", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it("cursor is not pointer immediately after mouseenter when hoverRevealSeconds is set", () => {
      render(<HiddenWord word="fox" found={false} onFind={() => {}} hoverRevealSeconds={1.5} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      fireEvent.mouseEnter(word);
      expect(word.style.cursor).not.toBe("pointer");
    });

    it("cursor becomes pointer after the configured delay", () => {
      render(<HiddenWord word="fox" found={false} onFind={() => {}} hoverRevealSeconds={1.5} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      fireEvent.mouseEnter(word);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(word.style.cursor).toBe("pointer");
    });

    it("cursor does not become pointer if mouse leaves before the delay", () => {
      render(<HiddenWord word="fox" found={false} onFind={() => {}} hoverRevealSeconds={1.5} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      fireEvent.mouseEnter(word);
      fireEvent.mouseLeave(word);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(word.style.cursor).not.toBe("pointer");
    });

    it("cursor resets to default on mouseleave after the delay fired", () => {
      render(<HiddenWord word="fox" found={false} onFind={() => {}} hoverRevealSeconds={1.5} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      fireEvent.mouseEnter(word);
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      fireEvent.mouseLeave(word);
      expect(word.style.cursor).not.toBe("pointer");
    });
  });
});
