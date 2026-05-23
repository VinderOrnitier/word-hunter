import { CelebrationManager } from "../../src/content/celebration-manager";

const PROPS = {
  word: "eagle",
  durationS: 30,
  hintUsed: false,
  art: undefined,
};

describe("CelebrationManager", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("show() renders the CelebrationPopup into document.body", () => {
    CelebrationManager(document).show(PROPS);
    expect(document.querySelector(".hw-celebration")).not.toBeNull();
    expect(document.querySelector(".hw-celebration__word")?.textContent).toBe("eagle");
  });

  it("show() replaces a previous popup if called twice", () => {
    const mgr = CelebrationManager(document);
    mgr.show(PROPS);
    mgr.show({ ...PROPS, word: "fox" });
    expect(document.querySelectorAll(".hw-celebration").length).toBe(1);
    expect(document.querySelector(".hw-celebration__word")?.textContent).toBe("fox");
  });

  it("dismiss() removes the popup from DOM", () => {
    const mgr = CelebrationManager(document);
    mgr.show(PROPS);
    expect(document.querySelector(".hw-celebration")).not.toBeNull();
    mgr.dismiss();
    expect(document.querySelector(".hw-celebration")).toBeNull();
  });

  it("clicking the backdrop dismisses the popup", () => {
    CelebrationManager(document).show(PROPS);
    const backdrop = document.querySelector(".hw-celebration__dismiss") as HTMLElement;
    backdrop.click();
    expect(document.querySelector(".hw-celebration")).toBeNull();
  });

  it("dismiss() is a no-op when nothing is shown", () => {
    expect(() => CelebrationManager(document).dismiss()).not.toThrow();
  });

  it("calls afterDismiss when the user clicks the backdrop", () => {
    const afterDismiss = jest.fn();
    CelebrationManager(document).show(PROPS, afterDismiss);
    const backdrop = document.querySelector(".hw-celebration__dismiss") as HTMLElement;
    backdrop.click();
    expect(afterDismiss).toHaveBeenCalledTimes(1);
  });

  it("does NOT call afterDismiss when dismiss() is called programmatically", () => {
    const afterDismiss = jest.fn();
    const mgr = CelebrationManager(document);
    mgr.show(PROPS, afterDismiss);
    mgr.dismiss();
    expect(afterDismiss).not.toHaveBeenCalled();
  });

  it("clicking the clear button removes the popup", () => {
    CelebrationManager(document).show(PROPS, undefined, () => {});
    (document.querySelector(".hw-celebration__clear-btn") as HTMLElement).click();
    expect(document.querySelector(".hw-celebration")).toBeNull();
  });

  it("clicking the clear button calls the onClear callback", () => {
    const onClear = jest.fn();
    CelebrationManager(document).show(PROPS, undefined, onClear);
    (document.querySelector(".hw-celebration__clear-btn") as HTMLElement).click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not show a clear button when onClear is not passed to show()", () => {
    CelebrationManager(document).show(PROPS);
    expect(document.querySelector(".hw-celebration__clear-btn")).toBeNull();
  });
});
