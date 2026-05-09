import { getActiveWord, setActiveWord, clearActiveWord } from "../../src/shared/storage";

function makeStorage(): Record<string, unknown> {
  return {};
}

function setupChromeMock(): Record<string, unknown> {
  const store = makeStorage();
  const listeners: Array<(changes: Record<string, chrome.storage.StorageChange>) => void> = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
          const changes = Object.fromEntries(
            Object.entries(items).map(([k, v]) => [k, { newValue: v }])
          );
          listeners.forEach((fn) => fn(changes));
        }),
        remove: jest.fn(async (key: string) => {
          const oldValue = store[key];
          delete store[key];
          listeners.forEach((fn) => fn({ [key]: { oldValue } }));
        }),
      },
      onChanged: {
        addListener: jest.fn((fn) => listeners.push(fn)),
      },
    },
    tabs: {
      query: jest.fn(async () => [{ id: 1 }, { id: 2 }]),
      sendMessage: jest.fn(),
    },
  };

  return store;
}

describe("ActiveWord storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChromeMock();
  });

  it("returns null when no ActiveWord is stored", async () => {
    expect(await getActiveWord()).toBeNull();
  });

  it("returns the stored ActiveWord after setActiveWord", async () => {
    const word = { word: "eagle", insertedAt: 1000 };
    await setActiveWord(word);
    expect(await getActiveWord()).toEqual(word);
  });

  it("overwrites the previous ActiveWord when a new one is set", async () => {
    await setActiveWord({ word: "fox", insertedAt: 1000 });
    await setActiveWord({ word: "bear", insertedAt: 2000 });
    expect(await getActiveWord()).toEqual({ word: "bear", insertedAt: 2000 });
  });

  it("returns null after clearActiveWord", async () => {
    await setActiveWord({ word: "wolf", insertedAt: 1000 });
    await clearActiveWord();
    expect(await getActiveWord()).toBeNull();
  });
});
