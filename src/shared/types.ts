export interface HuntRecord {
  word: string;
  foundAt: number;
  pageUrl: string;
  pageTitle: string;
  searchDurationSeconds: number;
  hintUsed: boolean;
}

export interface GameSettings {
  hintDelayMinutes: number;
  celebrationHoverSeconds: number;
  minWordThreshold?: number;
}

export type WordSource = "animals" | "pokemon" | "custom";

export interface ActiveWord {
  word: string;
  insertedAt: number;
  list?: WordSource;
}
