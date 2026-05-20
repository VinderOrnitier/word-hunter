import { AutoModeToast } from "../../src/content/auto-mode-toast";

describe("AutoModeToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not render anything before show() is called", () => {
    AutoModeToast(document);
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });

  it("show() appends an info toast with 'Auto-Hunter active'", () => {
    AutoModeToast(document).show();
    const toast = document.querySelector(".hw-toast--info");
    expect(toast).not.toBeNull();
    expect(toast!.textContent).toContain("Auto-Hunter active");
  });

  it("calling show() twice replaces the previous toast (no duplicates)", () => {
    const toast = AutoModeToast(document);
    toast.show();
    toast.show();
    expect(document.querySelectorAll(".hw-toast--info").length).toBe(1);
  });

  it("auto-dismisses after 4 seconds", () => {
    AutoModeToast(document).show();
    expect(document.querySelector(".hw-toast--info")).not.toBeNull();
    jest.advanceTimersByTime(4000);
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });

  it("clicking the × button dismisses the toast immediately", () => {
    AutoModeToast(document).show();
    const btn = document.querySelector(".hw-toast__close") as HTMLElement;
    btn.click();
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });

  it("dismiss() removes the toast and cancels the auto-dismiss timer", () => {
    const toast = AutoModeToast(document);
    toast.show();
    toast.dismiss();
    expect(document.querySelector(".hw-toast--info")).toBeNull();
    jest.advanceTimersByTime(5000);
    expect(document.querySelector(".hw-toast--info")).toBeNull();
  });
});
