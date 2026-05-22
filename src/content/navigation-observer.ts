export function NavigationObserver(
  win: Window & typeof globalThis,
  onNavigate: () => void,
  debounceMs = 300
): { disconnect: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function schedule() {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(onNavigate, debounceMs);
  }

  const originalPushState = win.history.pushState;
  const originalReplaceState = win.history.replaceState;

  win.history.pushState = (...args: Parameters<typeof history.pushState>) => {
    originalPushState.apply(win.history, args);
    schedule();
  };

  win.history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
    originalReplaceState.apply(win.history, args);
    schedule();
  };

  win.addEventListener("popstate", schedule);

  function disconnect() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    win.removeEventListener("popstate", schedule);
    win.history.pushState = originalPushState;
    win.history.replaceState = originalReplaceState;
  }

  return { disconnect };
}
