import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
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

  it("routes the Settings tab to the Pokédex settings surface", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());

    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));

    await waitFor(() => expect(container.querySelector(".pdx-range-mini")).not.toBeNull());
    // Pokédex settings surface, not the Slate one
    expect(container.querySelector(".wh-settings")).toBeNull();
  });

  it("routes the Rules view to the Pokédex rules surface via the header info key", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: /rules/i }));

    await waitFor(() => expect(container.querySelector(".rules-content")).not.toBeNull());
    // Slate rules surface must NOT be present
    expect(container.querySelector(".wh-rules")).toBeNull();
  });
});
