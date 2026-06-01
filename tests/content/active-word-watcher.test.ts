import { ActiveWordWatcher } from "../../src/content/active-word-watcher";

type StorageListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
) => void;

function setupChromeMock(): { fireChange: StorageListener } {
  const listeners: StorageListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      onChanged: {
        addListener: jest.fn((fn: StorageListener) => listeners.push(fn)),
      },
    },
  };

  return {
    fireChange: (changes, area) => listeners.forEach((fn) => fn(changes, area)),
  };
}

describe("ActiveWordWatcher", () => {
  let fireChange: StorageListener;

  beforeEach(() => {
    ({ fireChange } = setupChromeMock());
    document.body.innerHTML = "";
  });

  const _noop = { cancel: jest.fn(), dismiss: jest.fn() };

  it("calls timer.cancel() when activeWord is removed from storage", () => {
    const cancel = jest.fn();
    ActiveWordWatcher({ cancel }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" } } }, "local");
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("calls celebration.dismiss() when activeWord is removed from storage", () => {
    const dismiss = jest.fn();
    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" } } }, "local");
    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("does NOT call celebration.dismiss() when the found word is on this tab", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word hw-word--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    const dismiss = jest.fn();
    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss }, document).start();
    fireChange({ activeWord: { oldValue: { word: "eagle" } } }, "local");
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("removes .hw-host elements from DOM when activeWord is removed", () => {
    const host = document.createElement("span");
    host.className = "hw-host";
    document.body.appendChild(host);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" } } }, "local");

    expect(document.querySelector(".hw-host")).toBeNull();
  });

  it("calls timer.cancel() when activeWord changes to a new value", () => {
    const cancel = jest.fn();
    ActiveWordWatcher({ cancel }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" }, newValue: { word: "fox" } } }, "local");
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("calls celebration.dismiss() when activeWord changes to a new value (no found word)", () => {
    const dismiss = jest.fn();
    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" }, newValue: { word: "fox" } } }, "local");
    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("removes .hw-host from DOM when activeWord changes to a new value", () => {
    const host = document.createElement("span");
    host.className = "hw-host";
    document.body.appendChild(host);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" }, newValue: { word: "fox" } } }, "local");

    expect(document.querySelector(".hw-host")).toBeNull();
  });

  it("preserves found .hw-word--found when activeWord changes to a new value", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word hw-word--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" }, newValue: { word: "fox" } } }, "local");

    expect(document.querySelector(".hw-word--found")).not.toBeNull();
  });

  it("does nothing when an unrelated key changes", () => {
    const cancel = jest.fn();
    ActiveWordWatcher({ cancel }, { dismiss: jest.fn() }, document).start();
    fireChange({ settings: { newValue: { hintDelayMinutes: 2 } } }, "local");
    expect(cancel).not.toHaveBeenCalled();
  });

  it("does NOT remove .hw-host that contains a found word (.hw-word--found)", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word hw-word--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    const otherHost = document.createElement("span");
    otherHost.className = "hw-host";
    document.body.appendChild(otherHost);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "eagle" } } }, "local");

    expect(document.querySelectorAll(".hw-host").length).toBe(1);
    expect(document.querySelector(".hw-word--found")).not.toBeNull();
  });

  it("does nothing for non-local storage areas", () => {
    const cancel = jest.fn();
    ActiveWordWatcher({ cancel }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "cat" } } }, "sync");
    expect(cancel).not.toHaveBeenCalled();
  });

  // Pokédex theme: found word uses .pdx-highlight--found instead of .hw-word--found

  it("does NOT call celebration.dismiss() when a pdx found word is on this tab", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word pdx-highlight--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    const dismiss = jest.fn();
    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss }, document).start();
    fireChange({ activeWord: { oldValue: { word: "pikachu" } } }, "local");
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("does NOT remove .hw-host that contains a pdx found word (.pdx-highlight--found)", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word pdx-highlight--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    const otherHost = document.createElement("span");
    otherHost.className = "hw-host";
    document.body.appendChild(otherHost);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange({ activeWord: { oldValue: { word: "pikachu" } } }, "local");

    expect(document.querySelectorAll(".hw-host").length).toBe(1);
    expect(document.querySelector(".pdx-highlight--found")).not.toBeNull();
  });

  it("preserves pdx found word when activeWord changes to a new value", () => {
    const foundHost = document.createElement("span");
    foundHost.className = "hw-host";
    const foundWord = document.createElement("span");
    foundWord.className = "hw-word pdx-highlight--found";
    foundHost.appendChild(foundWord);
    document.body.appendChild(foundHost);

    ActiveWordWatcher({ cancel: jest.fn() }, { dismiss: jest.fn() }, document).start();
    fireChange(
      { activeWord: { oldValue: { word: "pikachu" }, newValue: { word: "eevee" } } },
      "local"
    );

    expect(document.querySelector(".pdx-highlight--found")).not.toBeNull();
  });
});
