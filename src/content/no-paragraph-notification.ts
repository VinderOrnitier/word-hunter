export function NoParagraphNotification(doc: Document) {
  return {
    show() {
      const el = doc.createElement("div");
      el.className = "hw-no-paragraph";
      el.textContent = "No long text found on this page — word not hidden";
      doc.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    },
  };
}
