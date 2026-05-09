import { ParagraphSelector } from "../../src/content/paragraph-selector";

function makeDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = html;
  return doc;
}

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

describe("ParagraphSelector", () => {
  it("returns empty array for a document with no text elements", () => {
    const doc = makeDoc("");
    expect(ParagraphSelector(doc)).toEqual([]);
  });

  it("ignores elements with fewer than 50 words", () => {
    const doc = makeDoc(`<p>${words(49)}</p>`);
    expect(ParagraphSelector(doc)).toEqual([]);
  });

  it("returns a <p> element that contains exactly 50 words", () => {
    const doc = makeDoc(`<p>${words(50)}</p>`);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(1);
    expect(result[0].tagName).toBe("P");
  });

  it("returns elements regardless of tag — div, article, li", () => {
    const doc = makeDoc(`
      <div>${words(50)}</div>
      <article>${words(60)}</article>
      <li>${words(55)}</li>
    `);
    const result = ParagraphSelector(doc);
    expect(result).toHaveLength(3);
    const tags = result.map((el) => el.tagName);
    expect(tags).toContain("DIV");
    expect(tags).toContain("ARTICLE");
    expect(tags).toContain("LI");
  });
});
