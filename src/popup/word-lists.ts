import { POKEMON_NAMES } from "../shared/pokemon-sprites";

export type WordListName = "animals" | "pokemon";

export const ANIMALS = [
  "cat", "elephant", "fox", "wolf", "eagle", "bear", "giraffe", "tiger",
  "dolphin", "hedgehog", "zebra", "kangaroo", "lion", "penguin", "owl",
  "crocodile", "flamingo", "peacock",
];

export const POKEMON = POKEMON_NAMES.map(
  (n) => n.charAt(0).toUpperCase() + n.slice(1)
);

export const WORD_LISTS: Record<WordListName, string[]> = {
  animals: ANIMALS,
  pokemon: POKEMON,
};
