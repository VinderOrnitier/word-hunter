import { h, render } from "preact";
import { InPageToast } from "./components/InPageToast";

const HOST_CLASS = "hw-no-paragraph-host";
let bannerHost: HTMLElement | null = null;

function removeBanner(): void {
  if (bannerHost !== null) {
    render(null, bannerHost);
    bannerHost.remove();
    bannerHost = null;
  }
}

export function NoParagraphNotification(doc: Document) {
  return {
    show() {
      removeBanner();
      bannerHost = doc.createElement("div");
      bannerHost.className = HOST_CLASS;
      doc.body.appendChild(bannerHost);
      render(
        h(InPageToast, {
          message: "Not enough text to hide the word.",
          variant: "info",
          onClose: removeBanner,
        }),
        bannerHost
      );
    },
  };
}
