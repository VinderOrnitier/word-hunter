export type WordListName = "animals" | "pokemon";

export const ANIMALS = [
  "cat", "elephant", "fox", "wolf", "eagle", "bear", "giraffe", "tiger",
  "dolphin", "hedgehog", "zebra", "kangaroo", "lion", "penguin", "owl",
  "crocodile", "flamingo", "peacock",
];

export const POKEMON = [
  "Pikachu", "Bulbasaur", "Charmander", "Squirtle", "Jigglypuff", "Mewtwo",
  "Eevee", "Snorlax", "Gengar", "Psyduck", "Machop", "Alakazam", "Magikarp",
  "Gyarados", "Lapras", "Vaporeon", "Flareon", "Dragonite",
];

export const WORD_LISTS: Record<WordListName, string[]> = {
  animals: ANIMALS,
  pokemon: POKEMON,
};
