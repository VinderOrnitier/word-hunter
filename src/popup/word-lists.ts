import { POKEMON_NAMES } from "../shared/pokemon-sprites";
import type { WordListName } from "../shared/types";

export type { WordListName };

export const ANIMALS = [
  "Alpaca", "Bat", "Bear", "Beaver",
  "Camel", "Cat", "Chameleon", "Cheetah", "Cow", "Crocodile",
  "Deer", "Dolphin", "Eagle", "Elephant", "Elk",
  "Flamingo", "Fox", "Frog",
  "Giraffe", "Gorilla",
  "Hamster", "Hedgehog", "Hippo", "Horse",
  "Iguana",
  "Jaguar",
  "Kangaroo", "Koala",
  "Leopard", "Lion", "Llama",
  "Moose",
  "Octopus", "Otter", "Owl",
  "Panda", "Parrot", "Peacock", "Penguin", "Pig",
  "Rabbit", "Raccoon", "Raven", "Rhino",
  "Shark", "Skunk", "Sloth", "Squirrel",
  "Tiger", "Turtle",
  "Vulture",
  "Whale", "Wolf",
  "Zebra",
];

export const POKEMON = POKEMON_NAMES.map(
  (n) => n.charAt(0).toUpperCase() + n.slice(1)
);

export const WORD_LISTS: Record<WordListName, string[]> = {
  animals: ANIMALS,
  pokemon: POKEMON,
};
