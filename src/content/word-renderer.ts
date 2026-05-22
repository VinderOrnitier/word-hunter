import { h, render } from "preact";
import type { ActiveWord, HuntRecord } from "../shared/types";
import { HiddenWordHost } from "./components/HiddenWordHost";

const HW_HOST_CLASS = "hw-host";
const SKIP_SELECTOR = "a, button, code, kbd, samp, var, abbr, acronym, script, style, noscript";

export interface WordRendererOptions {
  onFind?: (record: HuntRecord) => void | Promise<void>;
  onReview?: (record: HuntRecord) => void;
  resolveArt?: (word: string, source: ActiveWord["list"]) => string | undefined;
  hoverRevealSeconds?: number;
}

export function WordRenderer(
  activeWord: ActiveWord,
  groups: Element[][],
  options: WordRendererOptions = {}
): void {
  const { onFind, onReview, hoverRevealSeconds } = options;
  if (groups.length === 0) return;

  const doc = groups[0][0].ownerDocument;

  doc.querySelectorAll(`.${HW_HOST_CLASS}`).forEach((el) => {
    render(null, el);
    el.remove();
  });

  const group = groups[Math.floor(Math.random() * groups.length)];
  const para = group[Math.floor(Math.random() * group.length)];

  const walker = doc.createTreeWalker(para, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    if ((node as Text).parentElement?.closest(SKIP_SELECTOR)) continue;
    textNodes.push(node as Text);
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

  const computed = window.getComputedStyle(textNode.parentElement ?? para);
  const host = doc.createElement("span");
  host.className = HW_HOST_CLASS;

  const tail = text.slice(insertAt);
  const parent = textNode.parentNode!;
  parent.insertBefore(doc.createTextNode(text.slice(0, insertAt)), textNode);
  parent.insertBefore(host, textNode);
  parent.insertBefore(doc.createTextNode(tail ? ` ${tail}` : tail), textNode);
  parent.removeChild(textNode);

  render(
    h(HiddenWordHost, {
      activeWord,
      onFind: onFind ?? (() => {}),
      onReview,
      hoverRevealSeconds,
      inheritedStyle: {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        color: computed.color,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        fontStyle: computed.fontStyle,
      },
    }),
    host
  );
}
