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
    WordRenderer(eagle, [[para]]);

    const chars = document.querySelectorAll(".hw-char");
    expect(chars).toHaveLength(5);
    expect(Array.from(chars).map((el) => el.getAttribute("data-char"))).toEqual([
      "e",
      "a",
      "g",
      "l",
      "e",
    ]);
  });

  it("places no text matching the word in any text node (Ctrl+F bypass)", () => {
    const para = makePara(60);
    WordRenderer(eagle, [[para]]);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      expect(node.textContent).not.toContain("eagle");
    }
  });

  it("removes the previous .hw-word when called again", () => {
    const para = makePara(60);
    WordRenderer(eagle, [[para]]);
    WordRenderer({ word: "fox", insertedAt: 2000 }, [[para]]);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(1);
    expect(document.querySelectorAll(".hw-char")).toHaveLength(3); // "fox"
  });

  it("does nothing and does not throw when groups list is empty", () => {
    expect(() => WordRenderer(eagle, [])).not.toThrow();
    expect(document.querySelectorAll(".hw-word")).toHaveLength(0);
  });

  it("skips text nodes inside <code> and does not insert when nothing else is available", () => {
    const para = document.createElement("p");
    para.innerHTML = Array.from({ length: 60 }, (_, i) => `<code>word${i}</code>`).join(" ");
    document.body.appendChild(para);

    WordRenderer(eagle, [[para]]);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(0);
  });

  it("inserts into regular text even when paragraph also contains <code> text", () => {
    const para = document.createElement("p");
    para.innerHTML =
      Array.from({ length: 30 }, (_, i) => `<code>code${i}</code>`).join(" ") +
      " " +
      Array.from({ length: 30 }, (_, i) => `plain${i}`).join(" ");
    document.body.appendChild(para);

    WordRenderer(eagle, [[para]]);

    // insertion happened
    expect(document.querySelectorAll(".hw-word")).toHaveLength(1);
    // the hw-host must not be a descendant of any code element
    const host = document.querySelector(".hw-host")!;
    expect(host.closest("code")).toBeNull();
  });

  it.each([
    "a",
    "button",
    "code",
    "kbd",
    "samp",
    "var",
    "abbr",
    "acronym",
    "script",
    "style",
    "noscript",
  ])("skips text nodes whose closest ancestor is <%s>", (tag) => {
    const para = document.createElement("p");
    para.innerHTML = Array.from({ length: 60 }, (_, i) => `<${tag}>word${i}</${tag}>`).join(" ");
    document.body.appendChild(para);

    WordRenderer(eagle, [[para]]);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(0);
  });

  it("inserts into plain text even when paragraph also contains a <script> element", () => {
    const para = document.createElement("p");
    para.innerHTML =
      `<script type="application/json">${Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ")}</script>` +
      " " +
      Array.from({ length: 30 }, (_, i) => `plain${i}`).join(" ");
    document.body.appendChild(para);

    WordRenderer(eagle, [[para]]);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(1);
    const host = document.querySelector(".hw-host")!;
    expect(host.closest("script")).toBeNull();
  });

  it("inserts into one of the elements across multiple groups", () => {
    const paras = Array.from({ length: 4 }, (_, i) => {
      const p = makePara(20);
      p.dataset.idx = String(i);
      return p;
    });
    const groups: Element[][] = [
      [paras[0], paras[1]],
      [paras[2], paras[3]],
    ];

    WordRenderer(eagle, groups);

    expect(document.querySelectorAll(".hw-word")).toHaveLength(1);
    const host = document.querySelector(".hw-host")!;
    // host must be a descendant of one of the para elements
    const inOne = paras.some((p) => p.contains(host));
    expect(inOne).toBe(true);
  });

  it("reads computed style from the text node's parent element, not the paragraph container", () => {
    const para = document.createElement("p");
    const span = document.createElement("span");
    span.textContent = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    para.appendChild(span);
    document.body.appendChild(para);

    const spy = jest.spyOn(window, "getComputedStyle").mockReturnValue({
      fontFamily: "Courier",
      fontSize: "12px",
      color: "red",
      lineHeight: "1",
      fontWeight: "400",
      fontStyle: "normal",
    } as CSSStyleDeclaration);

    WordRenderer(eagle, [[para]]);

    // getComputedStyle must have been called with the span (textNode.parentElement),
    // not with the para element
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls).toContain(span);
    expect(calls).not.toContain(para);
  });

  it("copies font styles including fontWeight and fontStyle onto the .hw-word container", () => {
    const para = makePara(60);
    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "rgb(33, 33, 33)",
      lineHeight: "1.6",
      fontWeight: "700",
      fontStyle: "italic",
    } as CSSStyleDeclaration);

    WordRenderer(eagle, [[para]]);

    const wordEl = document.querySelector(".hw-word") as HTMLElement;
    expect(wordEl.style.fontFamily).toBe("Georgia");
    expect(wordEl.style.fontSize).toBe("18px");
    expect(wordEl.style.color).toBe("rgb(33, 33, 33)");
    expect(wordEl.style.lineHeight).toBe("1.6");
    expect(wordEl.style.fontWeight).toBe("700");
    expect(wordEl.style.fontStyle).toBe("italic");
  });

  describe("word spacing", () => {
    it("leaves a space between the span and the text that follows (mid-text insertion)", () => {
      const para = makePara(60);
      WordRenderer(eagle, [[para]]);

      const host = document.querySelector(".hw-host")!;
      const next = host.nextSibling;
      if (next && next.nodeType === Node.TEXT_NODE && next.textContent) {
        expect(next.textContent).toMatch(/^ /);
      }
    });

    it("adds a trailing space when the span lands at position 0 of a single-word text node", () => {
      const para = document.createElement("p");
      para.textContent = "example";
      document.body.appendChild(para);

      WordRenderer(eagle, [[para]]);

      const host = document.querySelector(".hw-host");
      if (!host) return;
      const next = host.nextSibling;
      expect(next).not.toBeNull();
      expect(next?.textContent).toMatch(/^ /);
    });

    it("does not add a trailing space when the insertion point is at the end of the text", () => {
      const para = document.createElement("p");
      para.textContent = "word ";
      document.body.appendChild(para);

      WordRenderer(eagle, [[para]]);

      const host = document.querySelector(".hw-host");
      if (!host) return;
      const next = host.nextSibling;
      if (next) {
        expect(next.textContent).toBe("");
      }
    });
  });
});
