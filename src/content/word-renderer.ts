import { h, render } from "preact";
import type { ActiveWord, HuntRecord } from "../shared/types";
import { HiddenWordHost } from "./components/HiddenWordHost";

const HW_HOST_CLASS = "hw-host";

export interface WordRendererOptions {
  onFind?: (record: HuntRecord) => void | Promise<void>;
  onReview?: (record: HuntRecord) => void;
  resolveArt?: (word: string, source: ActiveWord["list"]) => string | undefined;
}

export function WordRenderer(
  activeWord: ActiveWord,
  paragraphs: Element[],
  options: WordRendererOptions = {}
): void {
  const { onFind, onReview, resolveArt } = options;
  if (paragraphs.length === 0) return;

  const doc = paragraphs[0].ownerDocument;

  doc.querySelectorAll(`.${HW_HOST_CLASS}`).forEach((el) => {
    render(null, el);
    el.remove();
  });

  const para = paragraphs[Math.floor(Math.random() * paragraphs.length)];

  const walker = doc.createTreeWalker(para, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim()) textNodes.push(node as Text);
  }
  if (textNodes.length === 0) return;

  const textNode = textNodes[Math.floor(Math.random() * textNodes.length)];
  const text = textNode.textContent ?? "";

  const boundaries: number[] = [];
  const wordBoundary = /\s+/g;
  let match: RegExpExecArray | null;
  while ((match = wordBoundary.exec(text)) !== null) {
    boundaries.push(match.index + match[0].length);
  }
  if (boundaries.length === 0) boundaries.push(0);

  const insertAt = boundaries[Math.floor(Math.random() * boundaries.length)];

  const computed = window.getComputedStyle(para);
  const host = doc.createElement("span");
  host.className = HW_HOST_CLASS;

  const parent = textNode.parentNode!;
  parent.insertBefore(doc.createTextNode(text.slice(0, insertAt)), textNode);
  parent.insertBefore(host, textNode);
  parent.insertBefore(doc.createTextNode(text.slice(insertAt)), textNode);
  parent.removeChild(textNode);

  render(
    h(HiddenWordHost, {
      activeWord,
      onFind: onFind ?? (() => {}),
      onReview,
      inheritedStyle: {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        color: computed.color,
        lineHeight: computed.lineHeight,
      },
    }),
    host
  );
}
