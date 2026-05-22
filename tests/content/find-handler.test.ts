import { type FindHandlerDeps, handleFind } from "../../src/content/find-handler";
import { DEFAULT_SETTINGS } from "../../src/shared/constants";
import type { ActiveWord, GameSettings, HuntRecord } from "../../src/shared/types";

function makeRecord(overrides: Partial<HuntRecord> = {}): HuntRecord {
  return {
    word: "eagle",
    foundAt: 1000,
    pageUrl: "https://example.com",
    pageTitle: "Example",
    searchDurationSeconds: 12,
    hintUsed: false,
    list: "animals",
    ...overrides,
  };
}

function makeDeps(overrides: Partial<FindHandlerDeps> = {}): {
  deps: FindHandlerDeps;
  calls: {
    saveFind: jest.Mock;
    setActiveWord: jest.Mock;
    clearActiveWord: jest.Mock;
    pickNextWord: jest.Mock;
    resolveArt: jest.Mock;
  };
} {
  const saveFind = jest.fn(async () => {});
  const setActiveWord = jest.fn(async () => {});
  const clearActiveWord = jest.fn(async () => {});
  const pickNextWord = jest.fn(() => "tiger");
  const resolveArt = jest.fn(() => "🐯");

  const deps: FindHandlerDeps = {
    getActiveWord: async () => ({ word: "eagle", insertedAt: 500, list: "animals" }),
    setActiveWord,
    clearActiveWord,
    saveFind,
    getSettings: async (): Promise<GameSettings> => DEFAULT_SETTINGS,
    getFinds: async () => [],
    pickNextWord,
    resolveArt,
    now: () => 9999,
    ...overrides,
  };

  return { deps, calls: { saveFind, setActiveWord, clearActiveWord, pickNextWord, resolveArt } };
}

describe("handleFind", () => {
  it("returns {proceeded:false} when activeWord is null (stale tab)", async () => {
    const { deps, calls } = makeDeps({ getActiveWord: async () => null });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(result.proceeded).toBe(false);
    expect(calls.saveFind).not.toHaveBeenCalled();
    expect(calls.clearActiveWord).not.toHaveBeenCalled();
    expect(calls.setActiveWord).not.toHaveBeenCalled();
  });

  it("returns {proceeded:false} when insertedAt does not match (word changed since injection)", async () => {
    const { deps, calls } = makeDeps({
      getActiveWord: async () => ({ word: "eagle", insertedAt: 999, list: "animals" }),
    });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(result.proceeded).toBe(false);
    expect(calls.saveFind).not.toHaveBeenCalled();
  });

  it("saves the find record before clearing or setting next word", async () => {
    const calls: string[] = [];
    const { deps } = makeDeps({
      saveFind: jest.fn(async () => {
        calls.push("save");
      }),
      clearActiveWord: jest.fn(async () => {
        calls.push("clear");
      }),
      setActiveWord: jest.fn(async () => {
        calls.push("set");
      }),
    });
    await handleFind(makeRecord(), 500, deps);
    expect(calls[0]).toBe("save");
  });

  it("clears active word when autoContinue is false", async () => {
    const settings: GameSettings = { ...DEFAULT_SETTINGS, autoContinue: false };
    const { deps, calls } = makeDeps({ getSettings: async () => settings });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(result.proceeded).toBe(true);
    expect(calls.clearActiveWord).toHaveBeenCalledTimes(1);
    expect(calls.setActiveWord).not.toHaveBeenCalled();
    expect(result.next).toBeUndefined();
  });

  it("sets next active word when autoContinue is true and list is animals", async () => {
    const settings: GameSettings = { ...DEFAULT_SETTINGS, autoContinue: true };
    const { deps, calls } = makeDeps({ getSettings: async () => settings });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(result.proceeded).toBe(true);
    expect(calls.setActiveWord).toHaveBeenCalledTimes(1);
    expect(calls.setActiveWord).toHaveBeenCalledWith({
      word: "tiger",
      list: "animals",
      insertedAt: 9999,
    });
    expect(calls.clearActiveWord).not.toHaveBeenCalled();
  });

  it("includes next preview with art when autoContinue and showNextWordPreview are both true", async () => {
    const settings: GameSettings = {
      ...DEFAULT_SETTINGS,
      autoContinue: true,
      showNextWordPreview: true,
    };
    const { deps } = makeDeps({ getSettings: async () => settings });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(result.next).toEqual({ word: "tiger", art: "🐯" });
  });

  it("omits next preview when showNextWordPreview is false but still auto-selects", async () => {
    const settings: GameSettings = {
      ...DEFAULT_SETTINGS,
      autoContinue: true,
      showNextWordPreview: false,
    };
    const { deps, calls } = makeDeps({ getSettings: async () => settings });
    const result = await handleFind(makeRecord(), 500, deps);
    expect(calls.setActiveWord).toHaveBeenCalledTimes(1);
    expect(result.next).toBeUndefined();
  });

  it("clears active word (no auto-select) when autoContinue=true but list is 'custom'", async () => {
    const settings: GameSettings = { ...DEFAULT_SETTINGS, autoContinue: true };
    const activeWord: ActiveWord = { word: "secret", insertedAt: 500, list: "custom" };
    const { deps, calls } = makeDeps({
      getSettings: async () => settings,
      getActiveWord: async () => activeWord,
    });
    const result = await handleFind(makeRecord({ list: "custom" }), 500, deps);
    expect(result.proceeded).toBe(true);
    expect(calls.clearActiveWord).toHaveBeenCalledTimes(1);
    expect(calls.setActiveWord).not.toHaveBeenCalled();
    expect(calls.pickNextWord).not.toHaveBeenCalled();
  });

  it("clears active word (no auto-select) when activeWord.list is undefined", async () => {
    const settings: GameSettings = { ...DEFAULT_SETTINGS, autoContinue: true };
    const activeWord: ActiveWord = { word: "ghost", insertedAt: 500 };
    const { deps, calls } = makeDeps({
      getSettings: async () => settings,
      getActiveWord: async () => activeWord,
    });
    const _result = await handleFind(makeRecord(), 500, deps);
    expect(calls.clearActiveWord).toHaveBeenCalledTimes(1);
    expect(calls.setActiveWord).not.toHaveBeenCalled();
  });

  it("passes the activeWord list to pickNextWord (not the record list)", async () => {
    const settings: GameSettings = { ...DEFAULT_SETTINGS, autoContinue: true };
    const { deps, calls } = makeDeps({ getSettings: async () => settings });
    await handleFind(makeRecord(), 500, deps);
    expect(calls.pickNextWord).toHaveBeenCalledWith("animals", expect.any(Map));
  });
});
