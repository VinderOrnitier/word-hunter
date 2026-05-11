import { h, render } from "preact";
import { NoParagraphBanner } from "./components/NoParagraphBanner";

const HOST_CLASS = "hw-no-paragraph-host";

export function NoParagraphNotification(doc: Document) {
  return {
    show() {
      const host = doc.createElement("div");
      host.className = HOST_CLASS;
      doc.body.appendChild(host);
      render(h(NoParagraphBanner, { visible: true }), host);
      setTimeout(() => {
        render(null, host);
        host.remove();
      }, 3000);
    },
  };
}
