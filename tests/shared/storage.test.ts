import { DEFAULT_SETTINGS } from "../../src/shared/constants";
import {
  clearActiveWord,
  getActiveWord,
  getSettings,
  saveSettings,
  setActiveWord,
} from "../../src/shared/storage";

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

describe("GameSettings storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChromeMock();
  });

  it("returns DEFAULT_SETTINGS with autoContinue=false when no settings stored", async () => {
    const settings = await getSettings();
    expect(settings.autoContinue).toBe(false);
  });

  it("returns DEFAULT_SETTINGS with showNextWordPreview=true when no settings stored", async () => {
    const settings = await getSettings();
    expect(settings.showNextWordPreview).toBe(true);
  });

  it("round-trips autoContinue=true through saveSettings", async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, autoContinue: true });
    const settings = await getSettings();
    expect(settings.autoContinue).toBe(true);
  });

  it("round-trips showNextWordPreview=false through saveSettings", async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, showNextWordPreview: false });
    const settings = await getSettings();
    expect(settings.showNextWordPreview).toBe(false);
  });

  it("fills in new notification fields with defaults when stored settings predate them", async () => {
    const _store = makeStorage();
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: {
        local: {
          get: jest.fn(async (key: string) => ({
            [key]: {
              hintDelayMinutes: 5,
              celebrationHoverSeconds: 2,
              minWordThreshold: 40,
              autoContinue: false,
              showNextWordPreview: true,
              showReloadHint: true,
            },
          })),
          set: jest.fn(),
          remove: jest.fn(),
        },
        onChanged: { addListener: jest.fn() },
      },
    };
    const settings = await getSettings();
    expect(settings.notificationsEnabled).toBe(true);
    expect(settings.showAutoModeToast).toBe(true);
    expect(settings.showHintToast).toBe(true);
    expect(settings.showNoParagraphToast).toBe(true);
    expect(settings.hintDelayMinutes).toBe(5);
  });
});
