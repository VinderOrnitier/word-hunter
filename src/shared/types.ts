export interface HuntRecord {
  word: string;
  foundAt: number;
  pageUrl: string;
  pageTitle: string;
  searchDurationSeconds: number;
  hintUsed: boolean;
  list?: WordSource;
}

export interface GameSettings {
  hintDelayMinutes: number;
  celebrationHoverSeconds: number;
  minWordThreshold: number;
  autoContinue: boolean;
  showNextWordPreview: boolean;
  showReloadHint: boolean;
  notificationsEnabled: boolean;
  showAutoModeToast: boolean;
  showHintToast: boolean;
  showNoParagraphToast: boolean;
}

export type WordListName = "animals" | "pokemon";

export type WordSource = "animals" | "pokemon" | "custom";

export interface ActiveWord {
  word: string;
  insertedAt: number;
  list?: WordSource;
}
