import { NoParagraphNotification } from "../../src/content/no-paragraph-notification";

describe("NoParagraphNotification", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("no toast in DOM before show() is called", () => {
    NoParagraphNotification(document);
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });

  it("show() appends info toast to DOM", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    expect(document.querySelector(".hw-toast--info")).not.toBeNull();
  });

  it("toast has the correct message", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    expect(document.querySelector(".hw-toast__message")!.textContent).toBe(
      "Not enough text to hide the word."
    );
  });

  it("calling show() a second time replaces the existing toast — no duplicates", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    notification.show();
    expect(document.querySelectorAll(".hw-toast--info").length).toBe(1);
  });

  it("clicking close button removes the toast from DOM", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    const closeBtn = document.querySelector(".hw-toast__close") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });
});
