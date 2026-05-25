import type { FeatureFlags, GameSettings } from "./types";

export const DEFAULT_WORDS = [
  "cat",
  "elephant",
  "fox",
  "wolf",
  "eagle",
  "bear",
  "giraffe",
  "tiger",
  "dolphin",
  "hedgehog",
  "zebra",
  "kangaroo",
  "lion",
  "penguin",
  "owl",
  "crocodile",
  "flamingo",
  "peacock",
];

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

export const MIN_PARAGRAPH_WORDS = 50;

export const HINT_USED_KEY = "hw-hint-used";

export const FLAGS_URL =
  "https://raw.githubusercontent.com/VinderOrnitier/word-hunter/main/config/features.json";

export const DEFAULT_FLAGS: FeatureFlags = {
  pokemon: true,
};
