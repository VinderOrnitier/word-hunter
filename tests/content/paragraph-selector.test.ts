import { ParagraphSelector } from "../../src/content/paragraph-selector";

// Use the main jsdom document so that getComputedStyle resolves CSS class rules
// from <style> tags (detached documents have no defaultView for CSSOM cascade).
function makeDoc(html: string): Document {
  document.body.innerHTML = html;
  return document;
}

const VISIBLE_RECT: DOMRect = {
  width: 200, height: 20, top: 100, left: 0,
  bottom: 120, right: 200, x: 0, y: 100,
  toJSON: () => ({}),
};

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

// Per-element bounding-box overrides. Populated in individual tests; cleared by afterEach.
// Using a Map (not jest.spyOn on instances) avoids interference with the prototype spy.
let rectOverrides: Map<HTMLElement, DOMRect>;

describe("ParagraphSelector", () => {
  beforeEach(() => {
    rectOverrides = new Map();
    // jsdom always returns a zero rect; mock to simulate visible elements so
    // the bounding-box guard in isHidden does not incorrectly hide every element.
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return rectOverrides.get(this) ?? VISIBLE_RECT;
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    rectOverrides.clear();
  });

  it("groups two adjacent <p> siblings whose combined word count meets threshold", () => {
    const doc = makeDoc(`<p>${words(15)}</p><p>${words(20)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].tagName).toBe("P");
    expect(result[0][1].tagName).toBe("P");
  });

  it("returns a single-element group for a <p> that meets threshold on its own", () => {
    const doc = makeDoc(`<p>${words(30)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].tagName).toBe("P");
  });

  it("splits adjacent <p> elements into separate groups when a break element lies between them", () => {
    const doc = makeDoc(
      `<p>${words(20)}</p><p>${words(20)}</p><h2>Title</h2><p>${words(20)}</p><p>${words(15)}</p>`
    );
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(2);
  });

  it("excludes a group whose combined word count is below the threshold", () => {
    const doc = makeDoc(`<p>${words(14)}</p><p>${words(15)}</p>`);
    expect(ParagraphSelector(doc)).toHaveLength(0);
  });

  it("accepts a group whose combined word count equals the threshold exactly", () => {
    const doc = makeDoc(`<p>${words(15)}</p><p>${words(15)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
  });

  it("respects a custom threshold passed as second argument", () => {
    const doc = makeDoc(`<p>${words(25)}</p><p>${words(25)}</p>`);
    expect(ParagraphSelector(doc, 60)).toHaveLength(0);
    expect(ParagraphSelector(doc, 50)).toHaveLength(1);
  });

  it("excluded tags break the current group and never appear in any group", () => {
    const doc = makeDoc(
      `<p>${words(20)}</p><p>${words(20)}</p><nav>${words(50)}</nav><p>${words(20)}</p><p>${words(20)}</p>`
    );
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(2);
    result.flat().forEach((el) => expect(el.tagName).not.toBe("NAV"));
  });

  it("a <header> between prose paragraphs is excluded and its words do not count toward any group", () => {
    const doc = makeDoc(
      `<p>${words(20)}</p><header>${words(50)}</header><p>${words(20)}</p>`
    );
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(0);
  });

  it("<img> between <p> siblings does not break the group", () => {
    const doc = makeDoc(`<p>${words(20)}</p><img src="x.png"><p>${words(15)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  it("finds groups inside a nested container (e.g. <article>)", () => {
    const doc = makeDoc(
      `<article><p>${words(20)}</p><p>${words(20)}</p></article>`
    );
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].tagName).toBe("P");
  });

  it("whitespace-only element between <p> siblings does not break the group", () => {
    const doc = makeDoc(`<p>${words(20)}</p><span>   </span><p>${words(15)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  describe("custom element containers", () => {
    it("recurses into a <div> whose only child is a hyphenated custom element wrapping prose <p> elements", () => {
      const doc = makeDoc(
        `<div><turbo-frame><p>${words(20)}</p><p>${words(20)}</p></turbo-frame></div>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      result[0].forEach((el) => expect(el.tagName).toBe("P"));
    });

    it("recurses through nested custom elements to reach inner prose", () => {
      const doc = makeDoc(
        `<div><turbo-frame><include-fragment><p>${words(20)}</p><p>${words(20)}</p></include-fragment></turbo-frame></div>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      result[0].forEach((el) => expect(el.tagName).toBe("P"));
    });

    it("recurses into a container whose child is a non-hyphenated unknown element with display:block", () => {
      const doc = makeDoc(
        `<div><turboframe style="display:block"><p>${words(20)}</p><p>${words(20)}</p></turboframe></div>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      result[0].forEach((el) => expect(el.tagName).toBe("P"));
    });
  });

  describe("visibility filtering", () => {
    it("excludes a <p> with display:none", () => {
      const doc = makeDoc(
        `<p>${words(20)}</p><p style="display:none">${words(20)}</p><p>${words(15)}</p>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("excludes a <p> with visibility:hidden", () => {
      const doc = makeDoc(
        `<p>${words(20)}</p><p style="visibility:hidden">${words(20)}</p><p>${words(15)}</p>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("excludes a <p> with opacity:0", () => {
      const doc = makeDoc(
        `<p>${words(20)}</p><p style="opacity:0">${words(20)}</p><p>${words(15)}</p>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("excludes an element hidden via CSS class (computed display:none)", () => {
      const doc = makeDoc(
        `<style>.hidden { display: none; }</style>` +
        `<p>${words(20)}</p><p class="hidden">${words(20)}</p><p>${words(15)}</p>`
      );
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("excludes a sr-only element with 1×1 px bounding box", () => {
      const doc = makeDoc(
        `<p>${words(20)}</p>` +
        `<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">${words(20)}</span>` +
        `<p>${words(15)}</p>`
      );
      rectOverrides.set(doc.querySelector("span") as HTMLElement, {
        width: 1, height: 1, top: 0, left: 0,
        bottom: 1, right: 1, x: 0, y: 0, toJSON: () => ({}),
      } as DOMRect);
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it("excludes an off-screen element with zero visible area (left: -9999px, 1×1 px)", () => {
      const doc = makeDoc(
        `<p>${words(20)}</p>` +
        `<span style="position:absolute;left:-9999px;width:1px;height:1px">${words(20)}</span>` +
        `<p>${words(15)}</p>`
      );
      rectOverrides.set(doc.querySelector("span") as HTMLElement, {
        width: 1, height: 1, top: 0, left: -9999,
        bottom: 1, right: -9998, x: -9999, y: 0, toJSON: () => ({}),
      } as DOMRect);
      const result = ParagraphSelector(doc);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });
  });
});
