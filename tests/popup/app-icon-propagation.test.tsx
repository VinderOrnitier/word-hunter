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

describe("App propagates theme to icons via context", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders pokedex (fill, no stroke) icons when theme is pokedex", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<App />);
    await waitFor(() =>
      expect(container.querySelector("svg[fill='currentColor']:not([stroke])")).not.toBeNull()
    );
  });

  it("renders slate (stroke) icons by default", async () => {
    setupChromeMock();
    const { container } = render(<App />);
    await act(async () => {});
    expect(container.querySelector("svg[stroke='currentColor']")).not.toBeNull();
    expect(container.querySelector("svg[fill='currentColor']:not([stroke])")).toBeNull();
  });
});
