import { NavigationObserver } from "../../src/content/navigation-observer";

describe("NavigationObserver", () => {
  let disconnect: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    disconnect?.();
    jest.useRealTimers();
  });

  it("calls callback on popstate event", () => {
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 0));
    window.dispatchEvent(new PopStateEvent("popstate"));
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("calls callback when pushState is called", () => {
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 0));
    window.history.pushState(null, "", "/test");
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("calls callback when replaceState is called", () => {
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 0));
    window.history.replaceState(null, "", "/test2");
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("debounces rapid navigation events into one callback", () => {
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 300));
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    jest.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not call callback after disconnect", () => {
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 0));
    disconnect();
    window.dispatchEvent(new PopStateEvent("popstate"));
    jest.runAllTimers();
    expect(cb).not.toHaveBeenCalled();
  });

  it("restores original pushState after disconnect", () => {
    const original = window.history.pushState;
    const cb = jest.fn();
    ({ disconnect } = NavigationObserver(window, cb, 0));
    disconnect();
    expect(window.history.pushState).toBe(original);
  });
});
