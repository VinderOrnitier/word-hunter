import { computeCollectionStats } from "../../../src/popup/collection/computeCollectionStats";

describe("computeCollectionStats", () => {
  it("returns zeroes when no words have been caught", () => {
    const stats = computeCollectionStats(new Map(), 55);
    expect(stats).toEqual({
      caught: 0,
      total: 55,
      totalCatches: 0,
      ratio: 0,
    });
  });

  it("counts distinct caught words, sums catches, derives ratio", () => {
    const counts = new Map<string, number>([
      ["Cat", 3],
      ["Fox", 2],
      ["Wolf", 1],
    ]);
    const stats = computeCollectionStats(counts, 55);
    expect(stats.caught).toBe(3);
    expect(stats.total).toBe(55);
    expect(stats.totalCatches).toBe(6);
    expect(stats.ratio).toBeCloseTo(3 / 55, 5);
  });

  it("returns ratio === 1 when every word has been caught", () => {
    const counts = new Map<string, number>([
      ["A", 1],
      ["B", 1],
      ["C", 1],
    ]);
    const stats = computeCollectionStats(counts, 3);
    expect(stats.ratio).toBe(1);
  });

  it("clamps ratio to 0 when listLength is 0 (avoid divide-by-zero)", () => {
    const stats = computeCollectionStats(new Map(), 0);
    expect(stats.ratio).toBe(0);
  });
});
