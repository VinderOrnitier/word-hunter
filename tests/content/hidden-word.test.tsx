import { act, fireEvent, render } from "@testing-library/preact";
import { HiddenWord } from "../../src/content/components/HiddenWord";

describe("HiddenWord", () => {
  it("renders the word reversed as direct text content for text-selection compatibility", () => {
    render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
    const word = document.querySelector(".hw-word");
    expect(word?.textContent).toBe("xof");
    expect(document.querySelectorAll(".hw-char")).toHaveLength(0);
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

  describe("hinted underline", () => {
    it("applies yellow backgroundImage when hinted=true and found=false", () => {
      render(<HiddenWord word="fox" found={false} hinted={true} onFind={() => {}} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      expect(word.style.backgroundImage).toContain("var(--wh-primary)");
    });

    it("applies green backgroundImage when found=true regardless of hinted", () => {
      render(<HiddenWord word="fox" found={true} hinted={true} onFind={() => {}} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      expect(word.style.backgroundImage).toContain("var(--wh-found)");
      expect(word.style.backgroundImage).not.toContain("var(--wh-primary)");
    });

    it("has no backgroundImage when neither hinted nor found", () => {
      render(<HiddenWord word="fox" found={false} onFind={() => {}} />);
      const word = document.querySelector(".hw-word") as HTMLElement;
      expect(word.style.backgroundImage).toBeFalsy();
    });
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
