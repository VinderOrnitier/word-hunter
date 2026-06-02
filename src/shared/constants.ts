import type { FeatureFlags, GameSettings, Theme } from "./types";

export const DEFAULT_SETTINGS: GameSettings = {
  hintDelayMinutes: 3,
  celebrationHoverSeconds: 1.5,
  minWordThreshold: 30,
  autoContinue: false,
  showNextWordPreview: true,
  showReloadHint: true,
  notificationsEnabled: true,
  showAutoModeToast: true,
  showHintToast: true,
  showNoParagraphToast: true,
};

export const HINT_USED_KEY = "hw-hint-used";

export const FLAGS_URL =
  "https://raw.githubusercontent.com/VinderOrnitier/word-hunter/master/config/features.json";

export const DEFAULT_FLAGS: FeatureFlags = {
  pokemon: true,
};

export const DEFAULT_THEME: Theme = "slate";
