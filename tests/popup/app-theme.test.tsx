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

describe("App theme scope class", () => {
  beforeEach(() => jest.clearAllMocks());

  it("uses the Slate shell (.wh-popup.wh) by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    const root = container.querySelector(".wh-popup");
    expect(root).toHaveClass("wh");
    expect(root).not.toHaveClass("pdx");
    expect(container.querySelector(".pdx-popup")).toBeNull();
  });

  it("uses the Pokédex device shell (.pdx > .pdx-popup) when theme is 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".pdx-popup")).not.toBeNull());
    const scope = container.querySelector(".pdx");
    expect(scope).not.toBeNull();
    expect(container.querySelector(".wh-popup")).toBeNull();
  });
});
