export function ParagraphSelector(doc: Document): Element[] {
  return Array.from(doc.body.querySelectorAll("*")).filter((el) => {
    const text = (el as HTMLElement).innerText ?? el.textContent ?? "";
    return text.trim().split(/\s+/).filter(Boolean).length >= 50;
  });
}
