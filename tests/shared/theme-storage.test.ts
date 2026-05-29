import { getTheme } from "../../src/shared/storage";

function setupChromeMock(initial: Record<string, unknown> = {}): Record<string, unknown> {
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
      onChanged: { addListener: jest.fn() },
    },
  };
  return store;
}

describe("Theme storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChromeMock();
  });

  it("defaults to 'slate' when no theme is stored", async () => {
    expect(await getTheme()).toBe("slate");
  });

  it("returns the stored theme when set to 'pokedex'", async () => {
    setupChromeMock({ theme: "pokedex" });
    expect(await getTheme()).toBe("pokedex");
  });

  it("treats a legacy record (theme undefined) as 'slate'", async () => {
    setupChromeMock({ settings: { hintDelayMinutes: 5 } });
    expect(await getTheme()).toBe("slate");
  });
});
