import { AutoModeToast } from "../../src/content/auto-mode-toast";
import type { Locale } from "../../src/i18n";

describe("AutoModeToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not render anything before show() is called", () => {
    AutoModeToast(document, () => "en");
    expect(document.querySelector(".hw-toast--auto")).toBeNull();
  });

  it("show() appends an info toast with the localized message", () => {
    AutoModeToast(document, () => "en").show();
    const toast = document.querySelector(".hw-toast--auto");
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toContain("Auto-Hunter active");
  });

  it("show() uses the locale returned by the getter at call time", () => {
    let locale: Locale = "en";
    const toast = AutoModeToast(document, () => locale);
    locale = "uk";
    toast.show();
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe(
      "Авто-полювання активне"
    );
  });

  it("calling show() twice replaces the previous toast (no duplicates)", () => {
    const toast = AutoModeToast(document, () => "en");
    toast.show();
    toast.show();
    expect(document.querySelectorAll(".hw-toast--auto").length).toBe(1);
  });

  it("auto-dismisses after 4 seconds", () => {
    AutoModeToast(document, () => "en").show();
    expect(document.querySelector(".hw-toast--auto")).not.toBeNull();
    jest.advanceTimersByTime(4000);
    expect(document.querySelector(".hw-toast--auto")).toBeNull();
  });

  it("clicking the × button dismisses the toast immediately", () => {
    AutoModeToast(document, () => "en").show();
    const btn = document.querySelector(".hw-toast__close") as HTMLElement;
    btn.click();
    expect(document.querySelector(".hw-toast--auto")).toBeNull();
  });

  it("dismiss() removes the toast and cancels the auto-dismiss timer", () => {
    const toast = AutoModeToast(document, () => "en");
    toast.show();
    toast.dismiss();
    expect(document.querySelector(".hw-toast--auto")).toBeNull();
    jest.advanceTimersByTime(5000);
    expect(document.querySelector(".hw-toast--auto")).toBeNull();
  });
});
