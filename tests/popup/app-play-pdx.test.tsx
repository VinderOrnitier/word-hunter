import { render, waitFor } from "@testing-library/preact";
import { App } from "../../src/popup/App";

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

describe("App Pokédex Play routing", () => {
  beforeEach(() => jest.clearAllMocks());

  it("routes the Play tab to the Pokédex play surface", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    expect(container.querySelector(".pdx-active")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
  });
});
