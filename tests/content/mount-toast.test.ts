import { mountToast } from "../../src/content/mount-toast";

describe("mountToast", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("appends a host element with the given class to the document body", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "Hello",
      locale: "en",
      variant: "info",
    });
    expect(document.querySelector(".hw-test-host")).not.toBeNull();
  });

  it("renders a toast with the given message", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "Test message",
      locale: "en",
      variant: "info",
    });
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe("Test message");
  });

  it("applies the variant class to the toast element", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "msg",
      locale: "en",
      variant: "auto",
    });
    expect(document.querySelector(".hw-toast--auto")).not.toBeNull();
  });

  it("dismiss() removes the host from the DOM", () => {
    const { dismiss } = mountToast(document, {
      hostClass: "hw-test-host",
      message: "msg",
      locale: "en",
      variant: "info",
    });
    expect(document.querySelector(".hw-test-host")).not.toBeNull();
    dismiss();
    expect(document.querySelector(".hw-test-host")).toBeNull();
  });

  it("clicking the close button also removes the host from the DOM", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "msg",
      locale: "en",
      variant: "info",
    });
    (document.querySelector(".hw-toast__close") as HTMLElement).click();
    expect(document.querySelector(".hw-test-host")).toBeNull();
  });

  it("renders a find button when onFind is provided", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "msg",
      locale: "en",
      variant: "hint",
      onFind: jest.fn(),
    });
    expect(document.querySelector(".hw-toast__find")).not.toBeNull();
  });

  it("does not render a find button when onFind is omitted", () => {
    mountToast(document, {
      hostClass: "hw-test-host",
      message: "msg",
      locale: "en",
      variant: "hint",
    });
    expect(document.querySelector(".hw-toast__find")).toBeNull();
  });
});
