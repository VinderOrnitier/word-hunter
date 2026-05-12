import type { WordSource } from "../shared/types";
import { getSpriteUrl } from "../shared/pokemon-sprites";

const ANIMAL_EMOJI: Record<string, string> = {
  cat: "🐱",
  elephant: "🐘",
  fox: "🦊",
  wolf: "🐺",
  eagle: "🦅",
  bear: "🐻",
  giraffe: "🦒",
  tiger: "🐯",
  dolphin: "🐬",
  hedgehog: "🦔",
  zebra: "🦓",
  kangaroo: "🦘",
  lion: "🦁",
  penguin: "🐧",
  owl: "🦉",
  crocodile: "🐊",
  flamingo: "🦩",
  peacock: "🦚",
};

export function resolveArt(
  word: string,
  source: WordSource | undefined
): string | undefined {
  switch (source) {
    case "animals":
      return ANIMAL_EMOJI[word.toLowerCase()];
    case "pokemon":
      return getSpriteUrl(word.toLowerCase()) ?? undefined;
    default:
      return undefined;
  }
}
