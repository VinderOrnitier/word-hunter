import type { ActiveWord } from "../shared/types";

const HW_WORD_CLASS = "hw-word";
const HW_CHAR_CLASS = "hw-char";

export function WordRenderer(activeWord: ActiveWord, paragraphs: Element[]): void {
  if (paragraphs.length === 0) return;

  const doc = paragraphs[0].ownerDocument;

  doc.querySelectorAll(`.${HW_WORD_CLASS}`).forEach((el) => el.remove());

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

  // Collect word-boundary offsets (positions between words)
  const boundaries: number[] = [];
  const wordBoundary = /\s+/g;
  let match: RegExpExecArray | null;
  while ((match = wordBoundary.exec(text)) !== null) {
    boundaries.push(match.index + match[0].length);
  }
  if (boundaries.length === 0) boundaries.push(0);

  const insertAt = boundaries[Math.floor(Math.random() * boundaries.length)];

  // Build .hw-word container with inherited styles
  const computed = window.getComputedStyle(para);
  const wordSpan = doc.createElement("span");
  wordSpan.className = HW_WORD_CLASS;
  wordSpan.style.fontFamily = computed.fontFamily;
  wordSpan.style.fontSize = computed.fontSize;
  wordSpan.style.color = computed.color;
  wordSpan.style.lineHeight = computed.lineHeight;

  for (const char of activeWord.word) {
    const charSpan = doc.createElement("span");
    charSpan.className = HW_CHAR_CLASS;
    charSpan.setAttribute("data-char", char);
    charSpan.appendChild(doc.createTextNode(""));
    wordSpan.appendChild(charSpan);
  }

  // Split the text node and insert the word span between the two halves
  const parent = textNode.parentNode!;
  parent.insertBefore(doc.createTextNode(text.slice(0, insertAt)), textNode);
  parent.insertBefore(wordSpan, textNode);
  parent.insertBefore(doc.createTextNode(text.slice(insertAt)), textNode);
  parent.removeChild(textNode);
}
