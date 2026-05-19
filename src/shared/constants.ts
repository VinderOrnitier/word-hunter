import type { GameSettings } from "./types";

export const DEFAULT_WORDS = [
  "cat", "elephant", "fox", "wolf", "eagle", "bear", "giraffe", "tiger",
  "dolphin", "hedgehog", "zebra", "kangaroo", "lion", "penguin", "owl",
  "crocodile", "flamingo", "peacock",
];

export const DEFAULT_SETTINGS: GameSettings = {
  hintDelayMinutes: 3,
  celebrationHoverSeconds: 1.5,
  minWordThreshold: 30,
  autoContinue: false,
  showNextWordPreview: true,
};

export const MIN_PARAGRAPH_WORDS = 50;

export const HINT_USED_KEY = "hw-hint-used";
