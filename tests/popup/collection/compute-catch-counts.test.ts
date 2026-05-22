import { computeCatchCounts } from "../../../src/popup/collection/computeCatchCounts";
import type { HuntRecord } from "../../../src/shared/types";

function record(overrides: Partial<HuntRecord> = {}): HuntRecord {
  return {
    word: "Cat",
    foundAt: 1_700_000_000_000,
    pageUrl: "https://example.com",
    pageTitle: "Example",
    searchDurationSeconds: 12,
    hintUsed: false,
    list: "animals",
    ...overrides,
  };
}

describe("computeCatchCounts", () => {
  it("returns an empty Map when there are no finds", () => {
    const result = computeCatchCounts([], "animals");
    expect(result.size).toBe(0);
  });

  it("counts repeated catches of the same word", () => {
    const result = computeCatchCounts(
      [record({ word: "Cat" }), record({ word: "Cat" }), record({ word: "Cat" })],
      "animals"
    );
    expect(result.get("Cat")).toBe(3);
    expect(result.size).toBe(1);
  });

  it("counts distinct words independently", () => {
    const result = computeCatchCounts(
      [record({ word: "Cat" }), record({ word: "Fox" }), record({ word: "Cat" })],
      "animals"
    );
    expect(result.get("Cat")).toBe(2);
    expect(result.get("Fox")).toBe(1);
  });

  it("filters out records from other lists", () => {
    const result = computeCatchCounts(
      [record({ word: "Cat", list: "animals" }), record({ word: "Pikachu", list: "pokemon" })],
      "animals"
    );
    expect(result.size).toBe(1);
    expect(result.get("Cat")).toBe(1);
    expect(result.has("Pikachu")).toBe(false);
  });

  it("ignores custom records", () => {
    const result = computeCatchCounts(
      [record({ word: "dragon", list: "custom" }), record({ word: "Cat", list: "animals" })],
      "animals"
    );
    expect(result.size).toBe(1);
    expect(result.get("Cat")).toBe(1);
  });

  it("ignores records with undefined list (legacy safety)", () => {
    const result = computeCatchCounts([record({ word: "Cat", list: undefined })], "animals");
    expect(result.size).toBe(0);
  });

  it("normalizes case so legacy lowercase records still match the Title-Case list entry", () => {
    const result = computeCatchCounts(
      [record({ word: "cat", list: "animals" }), record({ word: "Cat", list: "animals" })],
      "animals"
    );
    expect(result.get("Cat")).toBe(2);
  });

  it("handles 100k records in under 50ms (O(N) sanity)", () => {
    const finds: HuntRecord[] = [];
    for (let i = 0; i < 100_000; i++) {
      finds.push(record({ word: i % 2 === 0 ? "Cat" : "Fox" }));
    }
    const start = performance.now();
    const result = computeCatchCounts(finds, "animals");
    const elapsed = performance.now() - start;
    expect(result.get("Cat")).toBe(50_000);
    expect(result.get("Fox")).toBe(50_000);
    expect(elapsed).toBeLessThan(50);
  });
});
