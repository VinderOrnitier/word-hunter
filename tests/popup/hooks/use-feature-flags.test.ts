import { act, renderHook } from "@testing-library/preact";
import { useFeatureFlags } from "../../../src/popup/hooks/useFeatureFlags";
import { DEFAULT_FLAGS } from "../../../src/shared/constants";

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
          const changes = Object.fromEntries(
            Object.entries(items).map(([k, v]) => [k, { newValue: v }])
          );
          listeners.forEach((fn) => fn(changes, "local"));
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

describe("useFeatureFlags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns DEFAULT_FLAGS when storage is empty", async () => {
    setupChromeMock();
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current).toEqual(DEFAULT_FLAGS);
  });

  it("returns stored flags when featureFlags is in storage", async () => {
    setupChromeMock({ featureFlags: { pokemon: false } });
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current).toEqual({ pokemon: false });
  });

  it("updates reactively when featureFlags changes in storage", async () => {
    const { fireStorageChange } = setupChromeMock({ featureFlags: { pokemon: true } });
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current.pokemon).toBe(true);

    await act(async () => {
      fireStorageChange({ featureFlags: { newValue: { pokemon: false } } });
    });

    expect(result.current.pokemon).toBe(false);
  });
});
