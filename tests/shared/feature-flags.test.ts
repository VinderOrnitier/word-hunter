import { DEFAULT_FLAGS, FLAGS_URL } from "../../src/shared/constants";
import { refreshFlags } from "../../src/shared/feature-flags";

function setupChromeMock(): Record<string, unknown> {
  const store: Record<string, unknown> = {};

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
    },
  };

  return store;
}

describe("refreshFlags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("writes merged flags to storage on successful fetch", async () => {
    const store = setupChromeMock();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pokemon: false }),
    });

    await refreshFlags();

    expect(store.featureFlags).toEqual({ pokemon: false });
  });

  it("merges partial remote response with DEFAULT_FLAGS", async () => {
    const store = setupChromeMock();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await refreshFlags();

    expect(store.featureFlags).toEqual(DEFAULT_FLAGS);
  });

  it("does not write to storage when fetch returns non-ok status", async () => {
    const store = setupChromeMock();
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false });

    await refreshFlags();

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(store.featureFlags).toBeUndefined();
  });

  it("resolves without throwing when fetch rejects", async () => {
    const store = setupChromeMock();
    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    await expect(refreshFlags()).resolves.toBeUndefined();
    expect(store.featureFlags).toBeUndefined();
  });

  it("fetches from FLAGS_URL", async () => {
    setupChromeMock();
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await refreshFlags();

    expect(fetch).toHaveBeenCalledWith(FLAGS_URL);
  });
});
