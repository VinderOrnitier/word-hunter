import { HintTimer } from "../../src/content/hint-timer";
import type { Locale } from "../../src/i18n";

const HINT_USED_KEY = "hw-hint-used";

describe("HintTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("hintUsed() is false before the timer fires", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    expect(timer.hintUsed()).toBe(false);
  });

  it("hintUsed() is true after the timer fires", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    expect(timer.hintUsed()).toBe(true);
  });

  it("toast appears after the timer fires with hint message", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    expect(document.querySelector(".hw-toast--hint")).toBeNull();
    jest.advanceTimersByTime(60_000);
    expect(document.querySelector(".hw-toast--hint")).not.toBeNull();
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe(
      "The word is hidden on this page."
    );
  });

  it("toast uses the locale current at fire time, not at start() time", () => {
    let locale: Locale = "en";
    const timer = HintTimer(
      document,
      () => locale,
      () => "slate"
    );
    timer.start(1);
    locale = "uk";
    jest.advanceTimersByTime(60_000);
    expect(document.querySelector(".hw-toast__message")?.textContent).toBe(
      "Слово сховане на цій сторінці."
    );
  });

  it("cancel() before firing prevents toast and keeps hintUsed false", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    timer.cancel();
    jest.advanceTimersByTime(60_000);
    expect(timer.hintUsed()).toBe(false);
    expect(document.querySelector(".hw-toast--hint")).toBeNull();
  });

  it("hintUsed state persists in sessionStorage", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    expect(sessionStorage.getItem(HINT_USED_KEY)).toBe("true");
  });

  it("hintUsed() reads from sessionStorage (survives re-instantiation)", () => {
    sessionStorage.setItem(HINT_USED_KEY, "true");
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    expect(timer.hintUsed()).toBe(true);
  });

  it("start() resets hintUsed to false — stale flag from previous hunt is cleared", () => {
    sessionStorage.setItem(HINT_USED_KEY, "true");
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    expect(timer.hintUsed()).toBe(false);
  });

  it("cancel() clears a stale hint-used flag — no false hintUsed when hints are disabled", () => {
    // Scenario: previous page had hints enabled and timer fired (key = "true").
    // User disables hint toast in settings. On new page inject(), cancel() is
    // called but start() is never called. The stale key must not pollute the record.
    sessionStorage.setItem(HINT_USED_KEY, "true");
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.cancel(); // called at inject() start; start() won't follow (hints disabled)
    expect(timer.hintUsed()).toBe(false);
  });

  it("cancel() after toast is shown removes it from DOM", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    expect(document.querySelector(".hw-toast--hint")).not.toBeNull();
    timer.cancel();
    expect(document.querySelector(".hw-toast--hint")).toBeNull();
  });

  it("clicking close button removes the toast from DOM", () => {
    const timer = HintTimer(
      document,
      () => "en",
      () => "slate"
    );
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    const closeBtn = document.querySelector(".hw-toast__close") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(document.querySelector(".hw-toast--hint")).toBeNull();
  });

  describe("find button wiring", () => {
    it("toast has no find button when start() is called without onFind", () => {
      const timer = HintTimer(
        document,
        () => "en",
        () => "slate"
      );
      timer.start(1);
      jest.advanceTimersByTime(60_000);
      expect(document.querySelector(".hw-toast__find")).toBeNull();
    });

    it("toast has a find button when start() is called with onFind", () => {
      const timer = HintTimer(
        document,
        () => "en",
        () => "slate"
      );
      timer.start(1, jest.fn());
      jest.advanceTimersByTime(60_000);
      expect(document.querySelector(".hw-toast__find")).not.toBeNull();
    });

    it("clicking the find button calls the onFind callback", () => {
      const onFind = jest.fn();
      const timer = HintTimer(
        document,
        () => "en",
        () => "slate"
      );
      timer.start(1, onFind);
      jest.advanceTimersByTime(60_000);
      (document.querySelector(".hw-toast__find") as HTMLElement).click();
      expect(onFind).toHaveBeenCalledTimes(1);
    });
  });
});
