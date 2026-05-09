import { WordRenderer } from "../../src/content/word-renderer";
import type { ActiveWord } from "../../src/shared/types";

function makePara(wordCount: number): HTMLElement {
  const p = document.createElement("p");
  p.textContent = Array.from({ length: wordCount }, (_, i) => `word${i}`).join(" ");
  document.body.appendChild(p);
  return p;
}

describe("WordRenderer", () => {
  const eagle: ActiveWord = { word: "eagle", insertedAt: 1000 };

  beforeEach(() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  it("inserts one .hw-char span per letter with correct data-char", () => {
    const para = makePara(60);
    WordRenderer(eagle, [para]);

    const chars = document.querySelectorAll(".hw-char");
    expect(chars).toHaveLength(5);
    expect(Array.from(chars).map((el) => el.getAttribute("data-char"))).toEqual([
      "e", "a", "g", "l", "e",
    ]);
  });

  it("places no text matching the word in any text node (Ctrl+F bypass)", () => {
    const para = makePara(60);
    WordRenderer(eagle, [para]);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      expect(node.textContent).not.toContain("eagle");
    }
  });

  it("removes the previous .hw-word when called again", () => {
    const para = makePara(60);
    WordRenderer(eagle, [para]);
    WordRenderer({ word: "fox", insertedAt: 2000 }, [para]);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(1);
    expect(document.querySelectorAll(".hw-char")).toHaveLength(3); // "fox"
  });

  it("does nothing and does not throw when paragraphs list is empty", () => {
    expect(() => WordRenderer(eagle, [])).not.toThrow();
    expect(document.querySelectorAll(".hw-word")).toHaveLength(0);
  });

  it("copies font styles from the paragraph onto the .hw-word container", () => {
    const para = makePara(60);
    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "rgb(33, 33, 33)",
      lineHeight: "1.6",
    } as CSSStyleDeclaration);

    WordRenderer(eagle, [para]);

    const wordEl = document.querySelector(".hw-word") as HTMLElement;
    expect(wordEl.style.fontFamily).toBe("Georgia");
    expect(wordEl.style.fontSize).toBe("18px");
    expect(wordEl.style.color).toBe("rgb(33, 33, 33)");
    expect(wordEl.style.lineHeight).toBe("1.6");
  });
});
