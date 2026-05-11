import { renderHook, act, waitFor } from "@testing-library/preact";
import { useStorage } from "../../src/popup/hooks/useStorage";
import type { ActiveWord, HuntRecord } from "../../src/shared/types";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string
) => void;

type ChromeMock = {
  chrome: {
    storage: {
      local: {
        get: jest.Mock;
        set: jest.Mock;
        remove: jest.Mock;
      };
      onChanged: {
        addListener: jest.Mock;
        removeListener: jest.Mock;
      };
    };
  };
};

function setupChromeMock(initialStore: Record<string, unknown> = {}): {
  store: Record<string, unknown>;
  listeners: StorageChangeListener[];
  fireChange: (changes: Record<string, chrome.storage.StorageChange>) => void;
} {
  const store: Record<string, unknown> = { ...initialStore };
  const listeners: StorageChangeListener[] = [];

  (globalThis as unknown as ChromeMock).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
      onChanged: {
        addListener: jest.fn((listener: StorageChangeListener) => {
          listeners.push(listener);
        }),
        removeListener: jest.fn((listener: StorageChangeListener) => {
          const i = listeners.indexOf(listener);
          if (i >= 0) listeners.splice(i, 1);
        }),
      },
    },
  };

  return {
    store,
    listeners,
    fireChange: (changes) => {
      listeners.forEach((l) => l(changes, "local"));
    },
  };
}

describe("useStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the default value on initial render", () => {
    setupChromeMock();
    const { result } = renderHook(() =>
      useStorage<"finds">("finds", [] as HuntRecord[])
    );
    expect(result.current[0]).toEqual([]);
  });

  it("loads the stored value from chrome.storage.local after mount", async () => {
    const stored: ActiveWord = { word: "eagle", insertedAt: 1000 };
    setupChromeMock({ activeWord: stored });

    const { result } = renderHook(() =>
      useStorage<"activeWord">("activeWord", null)
    );

    await waitFor(() => expect(result.current[0]).toEqual(stored));
  });

  it("setter writes the new value via chrome.storage.local.set and updates state", async () => {
    const { store } = setupChromeMock();
    const { result } = renderHook(() =>
      useStorage<"activeWord">("activeWord", null)
    );

    const next: ActiveWord = { word: "wolf", insertedAt: 2000 };
    await act(async () => {
      result.current[1](next);
    });

    expect(store.activeWord).toEqual(next);
    await waitFor(() => expect(result.current[0]).toEqual(next));
  });

  it("re-renders with the new value when chrome.storage.onChanged fires", async () => {
    const mock = setupChromeMock();
    const { result } = renderHook(() =>
      useStorage<"activeWord">("activeWord", null)
    );

    const next: ActiveWord = { word: "fox", insertedAt: 3000 };
    await act(async () => {
      mock.fireChange({
        activeWord: { oldValue: null, newValue: next },
      });
    });

    await waitFor(() => expect(result.current[0]).toEqual(next));
  });
});
