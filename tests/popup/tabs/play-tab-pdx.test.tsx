import { act, render } from "@testing-library/preact";
import { PlayTabPdx } from "../../../src/popup/tabs/PlayTab.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function setupChromeMock(initial: Record<string, unknown> = {}): void {
  const store: Record<string, unknown> = { ...initial };
  (globalThis as unknown as { chrome: unknown }).chrome = {
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
      onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
    },
    tabs: { query: jest.fn() },
    scripting: { executeScript: jest.fn() },
  };
}

describe("PlayTabPdx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders LCD body well, list selector, progress, filter, grid; action bar is a sibling of the body", async () => {
    setupChromeMock();
    const { container } = render(
      <ThemeContext.Provider value="pokedex">
        <PlayTabPdx />
      </ThemeContext.Provider>
    );
    await act(async () => {});
    expect(container.querySelector(".pdx-popup__body")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__body-inner")).not.toBeNull();
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-list-selector")).not.toBeNull();
    expect(container.querySelector(".pdx-progress")).not.toBeNull();
    expect(container.querySelector(".pdx-filter")).not.toBeNull();
    expect(container.querySelector(".pdx-grid")).not.toBeNull();
    const body = container.querySelector(".pdx-popup__body");
    expect(body?.querySelector(".pdx-popup__action-bar")).toBeNull();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
  });
});
