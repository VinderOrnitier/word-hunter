const BREAK = new Set(["H1","H2","H3","H4","H5","H6","HR","FIGURE","TABLE","UL","OL","BLOCKQUOTE","NAV","ASIDE"]);
const EXCLUDED = new Set(["H1","H2","H3","H4","H5","H6","NAV","HEADER","FOOTER","ASIDE","MENU","BUTTON","SELECT","TEXTAREA","INPUT","LABEL","TABLE","THEAD","TBODY","TR","TD","TH","UL","OL","FIGURE","FIGCAPTION","IFRAME","SCRIPT","STYLE","NOSCRIPT"]);
const BLOCK_CHILDREN = new Set(["DIV","P","UL","OL","LI","BLOCKQUOTE","PRE","ARTICLE","SECTION","MAIN","ASIDE","NAV","HEADER","FOOTER","TABLE","FIGURE","H1","H2","H3","H4","H5","H6","HR"]);

function countWords(el: Element): number {
  const text = (el as HTMLElement).innerText || el.textContent || "";
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isHidden(el: Element): boolean {
  const s = getComputedStyle(el as HTMLElement);
  if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return true;
  const rect = (el as HTMLElement).getBoundingClientRect();
  if (rect.width < 4 && rect.height < 4) return true;
  return false;
}

function hasBlockChildren(el: Element): boolean {
  return Array.from(el.children).some((c) => {
    if (BLOCK_CHILDREN.has(c.tagName)) return true;
    if (c.tagName.includes("-")) return true;
    const display = getComputedStyle(c as HTMLElement).display;
    return display === "block" || display === "flex" || display === "grid";
  });
}

function scanLevel(parent: Element, threshold: number, out: Element[][]): void {
  let group: Element[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const w = group.reduce((n, e) => n + countWords(e), 0);
    if (w >= threshold) out.push([...group]);
    group = [];
  };

  for (const child of Array.from(parent.children)) {
    const tag = child.tagName;
    if (tag === "IMG") continue;
    if (!child.textContent?.trim()) continue;
    if (EXCLUDED.has(tag) || BREAK.has(tag)) { flush(); continue; }
    if (isHidden(child)) { continue; }
    if (hasBlockChildren(child)) {
      flush();
      scanLevel(child as Element, threshold, out);
    } else {
      group.push(child);
    }
  }
  flush();
}

export function ParagraphSelector(doc: Document, threshold = 30): Element[][] {
  const result: Element[][] = [];
  scanLevel(doc.body, threshold, result);
  return result;
}
