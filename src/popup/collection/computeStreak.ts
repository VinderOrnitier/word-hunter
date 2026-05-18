import type { HuntRecord } from "../../shared/types";
import type { StreakStats } from "./types";

function localDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(timestamp: number, delta: number): number {
  const d = new Date(timestamp);
  d.setDate(d.getDate() + delta);
  return d.getTime();
}

export function computeStreak(
  finds: ReadonlyArray<HuntRecord>,
  now: number,
): StreakStats {
  if (finds.length === 0) return { current: 0, longest: 0 };

  const dayHits = new Set<string>();
  for (const find of finds) {
    dayHits.add(localDateKey(find.foundAt));
  }

  let current = 0;
  const todayKey = localDateKey(now);
  const yesterdayKey = localDateKey(addDays(now, -1));
  let cursor: number;
  if (dayHits.has(todayKey)) {
    cursor = now;
  } else if (dayHits.has(yesterdayKey)) {
    cursor = addDays(now, -1);
  } else {
    cursor = NaN;
  }
  while (!Number.isNaN(cursor) && dayHits.has(localDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  const sortedKeys = Array.from(dayHits).sort();
  for (const key of sortedKeys) {
    if (prev === null) {
      run = 1;
    } else {
      const expected = localDateKey(addDays(new Date(prev + "T12:00:00").getTime(), 1));
      run = key === expected ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    prev = key;
  }

  return { current, longest };
}
