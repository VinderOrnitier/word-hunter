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
  });
});
