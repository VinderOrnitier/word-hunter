import type { Locale } from "../i18n";
import { t } from "../i18n";
import { mountToast } from "./mount-toast";

const HOST_CLASS = "hw-no-paragraph-host";

export function NoParagraphNotification(doc: Document, getLocale: () => Locale) {
  let dismiss: (() => void) | null = null;

  return {
    show() {
      const locale = getLocale();
      dismiss?.();
      ({ dismiss } = mountToast(doc, {
        hostClass: HOST_CLASS,
        message: t("content_no_paragraph_message", locale),
        locale,
        variant: "info",
      }));
    },
  };
}
