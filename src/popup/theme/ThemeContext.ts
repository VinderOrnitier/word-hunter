import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";

/**
 * Carries the mounted popup theme down to leaf components (e.g. Icon) so they can
 * fork their rendering without prop-drilling. Provided by App from useTheme().
 */
export const ThemeContext = createContext<Theme>(DEFAULT_THEME);

/** Read the current popup theme from context. Falls back to slate outside a provider. */
export function useThemeContext(): Theme {
  return useContext(ThemeContext);
}
