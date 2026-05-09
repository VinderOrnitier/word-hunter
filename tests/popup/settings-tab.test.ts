import { SettingsTab } from "../../src/popup/settings-tab";
import type { GameSettings } from "../../src/shared/types";

type ChromeMock = {
  chrome: {
    storage: {
      local: {
        get: jest.Mock;
        set: jest.Mock;
      };
    };
  };
};

function setupChromeMock(): Record<string, unknown> {
  const store: Record<string, unknown> = {};

  (globalThis as unknown as ChromeMock).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
    },
  };

  return store;
}

describe("SettingsTab", () => {
  let container: HTMLElement;
  let store: Record<string, unknown>;

  beforeEach(() => {
    container = document.createElement("div");
    store = setupChromeMock();
    jest.clearAllMocks();
  });

  it("shows default hint delay when no settings saved", async () => {
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='hint-delay-input']") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("shows default celebration hover duration when no settings saved", async () => {
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='celebration-hover-input']") as HTMLInputElement;
    expect(input.value).toBe("1.5");
  });

  it("shows saved hint delay from storage", async () => {
    store.settings = { hintDelayMinutes: 10, celebrationHoverSeconds: 2 } satisfies GameSettings;
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='hint-delay-input']") as HTMLInputElement;
    expect(input.value).toBe("10");
  });

  it("shows saved celebration hover duration from storage", async () => {
    store.settings = { hintDelayMinutes: 10, celebrationHoverSeconds: 3 } satisfies GameSettings;
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='celebration-hover-input']") as HTMLInputElement;
    expect(input.value).toBe("3");
  });

  it("saves settings when hint delay input changes", async () => {
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='hint-delay-input']") as HTMLInputElement;
    input.value = "15";
    input.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect((globalThis as unknown as ChromeMock).chrome.storage.local.set)
      .toHaveBeenCalledWith({ settings: { hintDelayMinutes: 15, celebrationHoverSeconds: 1.5 } });
  });

  it("saves settings when celebration hover duration changes", async () => {
    const tab = new SettingsTab(container);
    await tab.init();
    const input = container.querySelector("[data-testid='celebration-hover-input']") as HTMLInputElement;
    input.value = "2.5";
    input.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect((globalThis as unknown as ChromeMock).chrome.storage.local.set)
      .toHaveBeenCalledWith({ settings: { hintDelayMinutes: 5, celebrationHoverSeconds: 2.5 } });
  });
});
