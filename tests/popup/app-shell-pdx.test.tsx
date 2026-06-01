import { act, render, waitFor } from "@testing-library/preact";
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
  };
}

describe("App Pokédex shell", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the device chrome (header, tabs, ridge, LCD body) under pokedex", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    expect(container.querySelector(".pdx-popup__header")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__tabs")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__ridge")).not.toBeNull();
    expect(container.querySelector(".pdx-popup__body-inner")).not.toBeNull();
  });

  it("keeps Slate chrome (.wh-header) by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    expect(container.querySelector(".wh-header")).not.toBeNull();
    expect(container.querySelector(".pdx-popup")).toBeNull();
  });
});
