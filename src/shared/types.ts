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
}

export interface ActiveWord {
  word: string;
  insertedAt: number;
}
