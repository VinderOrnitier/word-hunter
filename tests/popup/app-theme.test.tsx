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

  it("applies the 'wh' scope class on the popup root by default (slate)", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    const root = container.querySelector(".wh-popup");
    expect(root).toHaveClass("wh");
    expect(root).not.toHaveClass("pdx");
  });

  it("applies the 'pdx' scope class on the popup root when theme is 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() => expect(container.querySelector(".wh-popup")).toHaveClass("pdx"));
  });
});
