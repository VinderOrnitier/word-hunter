import { NoParagraphNotification } from "../../src/content/no-paragraph-notification";

describe("NoParagraphNotification", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("no notification in DOM before show() is called", () => {
    NoParagraphNotification(document);
    expect(document.querySelector(".hw-no-paragraph")).toBeNull();
  });

  it("show() appends notification to DOM", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    expect(document.querySelector(".hw-no-paragraph")).not.toBeNull();
  });

  it("notification has correct message", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    expect(document.querySelector(".hw-no-paragraph")!.textContent).toBe(
      "No long text found on this page — word not hidden"
    );
  });

  it("notification is removed automatically after 3 seconds", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    expect(document.querySelector(".hw-no-paragraph")).not.toBeNull();
    jest.advanceTimersByTime(3000);
    expect(document.querySelector(".hw-no-paragraph")).toBeNull();
  });

  it("notification is not removed before 3 seconds", () => {
    const notification = NoParagraphNotification(document);
    notification.show();
    jest.advanceTimersByTime(2999);
    expect(document.querySelector(".hw-no-paragraph")).not.toBeNull();
  });
});
