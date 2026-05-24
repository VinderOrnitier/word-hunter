import { h, render } from "preact";
import type { Locale } from "../i18n";
import { t } from "../i18n";
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

export function NoParagraphNotification(doc: Document, getLocale: () => Locale) {
  return {
    show() {
      const locale = getLocale();
      removeBanner();
      bannerHost = doc.createElement("div");
      bannerHost.className = HOST_CLASS;
      doc.body.appendChild(bannerHost);
      render(
        h(InPageToast, {
          message: t("content_no_paragraph_message", locale),
          locale,
          variant: "info",
          onClose: removeBanner,
        }),
        bannerHost
      );
    },
  };
}
