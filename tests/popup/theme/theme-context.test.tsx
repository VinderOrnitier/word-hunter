import { renderHook } from "@testing-library/preact";
import type { ComponentChildren } from "preact";
import { ThemeContext, useThemeContext } from "../../../src/popup/theme/ThemeContext";

describe("useThemeContext", () => {
  it("defaults to slate when no provider is present", () => {
    const { result } = renderHook(() => useThemeContext());
    expect(result.current).toBe("slate");
  });

  it("returns the theme supplied by the provider", () => {
    function wrapper({ children }: { children: ComponentChildren }) {
      return <ThemeContext.Provider value="pokedex">{children}</ThemeContext.Provider>;
    }
    const { result } = renderHook(() => useThemeContext(), { wrapper });
    expect(result.current).toBe("pokedex");
  });
});
