import { useEffect, useState } from "preact/hooks";
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";

/**
 * Reads the stored theme ONCE on mount. Deliberately does not subscribe to
 * chrome.storage.onChanged: switching themes prompts a popup re-open, so the
 * mounted tree keeps its theme for the life of the popup.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;
    chrome.storage.local.get("theme").then((result) => {
      if (cancelled) return;
      const stored = result.theme as Theme | undefined;
      if (stored) setTheme(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return theme;
}
