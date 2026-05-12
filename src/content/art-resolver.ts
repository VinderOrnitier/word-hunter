import type { WordSource } from "../shared/types";

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

export function createArtResolver(
  pokemonImages: Record<string, string>
): (word: string, source: WordSource | undefined) => string | undefined {
  return function resolveArt(
    word: string,
    source: WordSource | undefined
  ): string | undefined {
    switch (source) {
      case "animals":
        return ANIMAL_EMOJI[word.toLowerCase()];
      case "pokemon": {
        const key = `../assets/pokemon/${word.toLowerCase()}.png`;
        return pokemonImages[key] ?? pokemonImages["../assets/pokemon/_placeholder.png"];
      }
      default:
        return undefined;
    }
  };
}
