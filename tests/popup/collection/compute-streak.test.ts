import { computeStreak } from "../../../src/popup/collection/computeStreak";
import type { HuntRecord } from "../../../src/shared/types";

function ts(year: number, month: number, day: number, hour = 12): number {
  return new Date(year, month - 1, day, hour).getTime();
}

function record(foundAt: number): HuntRecord {
  return {
    word: "Cat",
    foundAt,
    pageUrl: "https://example.com",
    pageTitle: "Example",
    searchDurationSeconds: 10,
    hintUsed: false,
    list: "animals",
  };
}

describe("computeStreak", () => {
  it("returns zeroes for an empty find list", () => {
    expect(computeStreak([], ts(2026, 5, 18))).toEqual({ current: 0, longest: 0 });
  });

  it("counts contiguous days ending today", () => {
    const now = ts(2026, 5, 18);
    const finds = [
      record(ts(2026, 5, 16, 9)),
      record(ts(2026, 5, 17, 14)),
      record(ts(2026, 5, 18, 11)),
    ];
    expect(computeStreak(finds, now)).toEqual({ current: 3, longest: 3 });
  });

  it("survives the gap of 'no find yet today' if yesterday was active (grace period)", () => {
    const now = ts(2026, 5, 18, 8);
    const finds = [record(ts(2026, 5, 17, 22))];
    expect(computeStreak(finds, now)).toEqual({ current: 1, longest: 1 });
  });

  it("breaks the current streak when the last find is older than yesterday", () => {
    const now = ts(2026, 5, 18);
    const finds = [record(ts(2026, 5, 14, 9)), record(ts(2026, 5, 15, 9))];
    expect(computeStreak(finds, now)).toEqual({ current: 0, longest: 2 });
  });

  it("treats today and 2-days-ago as two separate runs of length 1 when yesterday is missing", () => {
    const now = ts(2026, 5, 18);
    const finds = [record(ts(2026, 5, 16, 9)), record(ts(2026, 5, 18, 11))];
    expect(computeStreak(finds, now)).toEqual({ current: 1, longest: 1 });
  });

  it("tracks longest across history: 10-run + gap + current 5-run", () => {
    const now = ts(2026, 5, 18);
    const finds: HuntRecord[] = [];
    for (let d = 1; d <= 10; d++) finds.push(record(ts(2026, 4, d)));
    for (let d = 14; d <= 18; d++) finds.push(record(ts(2026, 5, d)));
    expect(computeStreak(finds, now)).toEqual({ current: 5, longest: 10 });
  });

  it("multiple finds on the same day count as one day", () => {
    const now = ts(2026, 5, 18);
    const finds = [
      record(ts(2026, 5, 18, 8)),
      record(ts(2026, 5, 18, 14)),
      record(ts(2026, 5, 18, 20)),
    ];
    expect(computeStreak(finds, now)).toEqual({ current: 1, longest: 1 });
  });
});
