import { HintTimer } from "../../src/content/hint-timer";

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
    const timer = HintTimer(document);
    timer.start(1);
    expect(timer.hintUsed()).toBe(false);
  });

  it("hintUsed() is true after the timer fires", () => {
    const timer = HintTimer(document);
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    expect(timer.hintUsed()).toBe(true);
  });

  it("tooltip appears after the timer fires", () => {
    const timer = HintTimer(document);
    timer.start(1);
    expect(document.querySelector(".hw-hint-tooltip")).toBeNull();
    jest.advanceTimersByTime(60_000);
    expect(document.querySelector(".hw-hint-tooltip")).not.toBeNull();
    expect(document.querySelector(".hw-hint-tooltip")!.textContent).toBe(
      "The word is hidden on this page"
    );
  });

  it("cancel() before firing prevents tooltip and keeps hintUsed false", () => {
    const timer = HintTimer(document);
    timer.start(1);
    timer.cancel();
    jest.advanceTimersByTime(60_000);
    expect(timer.hintUsed()).toBe(false);
    expect(document.querySelector(".hw-hint-tooltip")).toBeNull();
  });

  it("hintUsed state persists in sessionStorage", () => {
    const timer = HintTimer(document);
    timer.start(1);
    jest.advanceTimersByTime(60_000);
    expect(sessionStorage.getItem(HINT_USED_KEY)).toBe("true");
  });

  it("hintUsed() reads from sessionStorage (survives re-instantiation)", () => {
    sessionStorage.setItem(HINT_USED_KEY, "true");
    const timer = HintTimer(document);
    expect(timer.hintUsed()).toBe(true);
  });
});
