import { NoParagraphNotification } from "../../src/content/no-paragraph-notification";
import type { Locale } from "../../src/i18n";

describe("NoParagraphNotification", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("no toast in DOM before show() is called", () => {
    NoParagraphNotification(document, () => "en");
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });

  it("show() appends info toast to DOM", () => {
    const notification = NoParagraphNotification(document, () => "en");
    notification.show();
    expect(document.querySelector(".hw-toast--info")).not.toBeNull();
  });

  it("toast has the correct message", () => {
    const notification = NoParagraphNotification(document, () => "en");
    notification.show();
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe(
      "Not enough text to hide the word."
    );
  });

  it("show() uses the locale returned by the getter at call time", () => {
    let locale: Locale = "en";
    const notification = NoParagraphNotification(document, () => locale);
    locale = "uk";
    notification.show();
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe(
      "Недостатньо тексту для приховування слова."
    );
  });

  it("calling show() a second time replaces the existing toast — no duplicates", () => {
    const notification = NoParagraphNotification(document, () => "en");
    notification.show();
    notification.show();
    expect(document.querySelectorAll(".hw-toast--info").length).toBe(1);
  });

  it("clicking close button removes the toast from DOM", () => {
    const notification = NoParagraphNotification(document, () => "en");
    notification.show();
    const closeBtn = document.querySelector(".hw-toast__close") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });
});
