import { PlayTab } from "../../src/popup/play-tab";
import { ANIMALS, POKEMON } from "../../src/popup/word-lists";

type ChromeMock = {
  chrome: {
    storage: {
      local: {
        get: jest.Mock;
        set: jest.Mock;
        remove: jest.Mock;
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
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
    },
  };

  return store;
}

describe("PlayTab", () => {
  let container: HTMLElement;
  let store: Record<string, unknown>;

  beforeEach(() => {
    container = document.createElement("div");
    store = setupChromeMock();
    jest.clearAllMocks();
  });

  it("shows placeholder when no ActiveWord is set", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    expect(container.textContent).toContain("No word selected");
  });

  it("shows current ActiveWord when one is set", async () => {
    store.activeWord = { word: "eagle", insertedAt: 1000 };
    const tab = new PlayTab(container);
    await tab.init();
    expect(container.textContent).toContain("eagle");
  });

  it("renders WordList selector with Animals and Pokémon options", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    const select = container.querySelector("[data-testid='word-list-selector']") as HTMLSelectElement;
    const values = Array.from(select.options).map((o) => o.value);
    expect(values).toContain("animals");
    expect(values).toContain("pokemon");
  });

  it("populates word dropdown with Animals words by default", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    const dropdown = container.querySelector("[data-testid='word-dropdown']") as HTMLSelectElement;
    const values = Array.from(dropdown.options).map((o) => o.value);
    expect(values).toEqual(ANIMALS);
  });

  it("updates word dropdown when Pokémon list is selected", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    const listSelector = container.querySelector("[data-testid='word-list-selector']") as HTMLSelectElement;
    listSelector.value = "pokemon";
    listSelector.dispatchEvent(new Event("change"));
    const dropdown = container.querySelector("[data-testid='word-dropdown']") as HTMLSelectElement;
    const values = Array.from(dropdown.options).map((o) => o.value);
    expect(values).toEqual(POKEMON);
  });

  it("sets ActiveWord from dropdown when 'New word' is clicked", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    const dropdown = container.querySelector("[data-testid='word-dropdown']") as HTMLSelectElement;
    dropdown.value = "fox";
    const button = container.querySelector("[data-testid='new-word-btn']") as HTMLButtonElement;
    button.click();
    await Promise.resolve();
    expect((globalThis as unknown as ChromeMock).chrome.storage.local.set)
      .toHaveBeenCalledWith(expect.objectContaining({
        activeWord: expect.objectContaining({ word: "fox" }),
      }));
  });

  it("sets ActiveWord from custom input when 'New word' is clicked", async () => {
    const tab = new PlayTab(container);
    await tab.init();
    const customInput = container.querySelector("[data-testid='custom-word-input']") as HTMLInputElement;
    customInput.value = "unicorn";
    const button = container.querySelector("[data-testid='new-word-btn']") as HTMLButtonElement;
    button.click();
    await Promise.resolve();
    expect((globalThis as unknown as ChromeMock).chrome.storage.local.set)
      .toHaveBeenCalledWith(expect.objectContaining({
        activeWord: expect.objectContaining({ word: "unicorn" }),
      }));
  });
});
