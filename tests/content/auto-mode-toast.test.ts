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
    expect(document.querySelector(".hw-auto-toast")).toBeNull();
  });

  it("show(word) appends a toast containing the word", () => {
    AutoModeToast(document).show("capybara");
    const toast = document.querySelector(".hw-auto-toast");
    expect(toast).not.toBeNull();
    expect(toast!.textContent).toContain("capybara");
    expect(toast!.textContent?.toLowerCase()).toContain("auto-hunter");
  });

  it("calling show() twice replaces the previous toast (no duplicates)", () => {
    const toast = AutoModeToast(document);
    toast.show("fox");
    toast.show("eagle");
    const all = document.querySelectorAll(".hw-auto-toast");
    expect(all.length).toBe(1);
    expect(all[0].textContent).toContain("eagle");
    expect(all[0].textContent).not.toContain("fox");
  });

  it("auto-dismisses after 4 seconds", () => {
    AutoModeToast(document).show("wolf");
    expect(document.querySelector(".hw-auto-toast")).not.toBeNull();
    jest.advanceTimersByTime(4000);
    expect(document.querySelector(".hw-auto-toast")).toBeNull();
  });

  it("clicking the toast dismisses it immediately", () => {
    AutoModeToast(document).show("otter");
    const el = document.querySelector(".hw-auto-toast") as HTMLElement;
    el.click();
    expect(document.querySelector(".hw-auto-toast")).toBeNull();
  });

  it("dismiss() removes the toast and cancels the auto-dismiss timer", () => {
    const toast = AutoModeToast(document);
    toast.show("bear");
    toast.dismiss();
    expect(document.querySelector(".hw-auto-toast")).toBeNull();
    // advancing time after dismiss should not throw or re-show anything
    jest.advanceTimersByTime(5000);
    expect(document.querySelector(".hw-auto-toast")).toBeNull();
  });
});
