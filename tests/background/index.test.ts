import type { ActiveWordChangedMessage } from "../../src/background/index";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
) => void;

function setupChromeMock() {
  const storageListeners: StorageChangeListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      onChanged: {
        addListener: jest.fn((fn: StorageChangeListener) => storageListeners.push(fn)),
      },
    },
    tabs: {
      query: jest.fn((_filter: unknown, cb: (tabs: { id: number }[]) => void) =>
        cb([{ id: 10 }, { id: 20 }])
      ),
      sendMessage: jest.fn(),
    },
  };

  return {
    fireStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      storageListeners.forEach((fn) => fn(changes, "local"));
    },
  };
}

describe("background script", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("sends ACTIVE_WORD_CHANGED to all tabs when activeWord changes", async () => {
    const { fireStorageChange } = setupChromeMock();
    await import("../../src/background/index");

    const word = { word: "eagle", insertedAt: 9999 };
    fireStorageChange({ activeWord: { newValue: word } });

    const expected: ActiveWordChangedMessage = {
      type: "ACTIVE_WORD_CHANGED",
      activeWord: word,
    };

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(10, expected);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(20, expected);
  });

  it("sends null activeWord when activeWord is cleared", async () => {
    const { fireStorageChange } = setupChromeMock();
    await import("../../src/background/index");

    fireStorageChange({ activeWord: { oldValue: { word: "fox", insertedAt: 1 } } });

    const expected: ActiveWordChangedMessage = {
      type: "ACTIVE_WORD_CHANGED",
      activeWord: null,
    };

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(10, expected);
  });

  it("ignores storage changes for other keys", async () => {
    const { fireStorageChange } = setupChromeMock();
    await import("../../src/background/index");

    fireStorageChange({ settings: { newValue: { hintDelayMinutes: 10 } } });

    expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
  });
});
