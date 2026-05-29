import { act, renderHook, waitFor } from "@testing-library/preact";
import { useTheme } from "../../../src/popup/hooks/useTheme";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
) => void;

function setupChromeMock(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
  const listeners: StorageChangeListener[] = [];
  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
      onChanged: {
        addListener: jest.fn((fn: StorageChangeListener) => listeners.push(fn)),
        removeListener: jest.fn((fn: StorageChangeListener) => {
          const i = listeners.indexOf(fn);
          if (i !== -1) listeners.splice(i, 1);
        }),
      },
    },
  };
  return {
    fireStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      listeners.forEach((fn) => fn(changes, "local"));
    },
  };
}

describe("useTheme", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 'slate' before storage resolves", () => {
    setupChromeMock({ theme: "pokedex" });
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBe("slate");
  });

  it("returns the stored theme after mount", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current).toBe("pokedex"));
  });

  it("does NOT react to later storage changes (read once on mount)", async () => {
    const { fireStorageChange } = setupChromeMock({ theme: "slate" });
    const { result } = renderHook(() => useTheme());
    await act(async () => {});
    expect(result.current).toBe("slate");

    await act(async () => {
      fireStorageChange({ theme: { oldValue: "slate", newValue: "pokedex" } });
    });

    expect(result.current).toBe("slate");
  });
});
