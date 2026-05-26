import { getSpriteUrl } from "./pokemon-sprites";
import type { WordSource } from "./types";

const ANIMAL_EMOJI: Record<string, string> = {
  Badger: "🦡",
  Bat: "🦇",
  Bear: "🐻",
  Beaver: "🦫",
  Bison: "🦬",
  Boar: "🐗",
  Butterfly: "🦋",
  Camel: "🐪",
  Cat: "🐱",
  Chameleon: "🦎",
  Cow: "🐄",
  Crab: "🦀",
  Crocodile: "🐊",
  Deer: "🦌",
  Dodo: "🦤",
  Dolphin: "🐬",
  Dove: "🕊️",
  Duck: "🦆",
  Eagle: "🦅",
  Elephant: "🐘",
  Fish: "🐟",
  Flamingo: "🦩",
  Fox: "🦊",
  Frog: "🐸",
  Giraffe: "🦒",
  Goat: "🐐",
  Gorilla: "🦍",
  Hamster: "🐹",
  Hedgehog: "🦔",
  Hippo: "🦛",
  Horse: "🐴",
  Kangaroo: "🦘",
  Koala: "🐨",
  Leopard: "🐆",
  Lion: "🦁",
  Llama: "🦙",
  Lobster: "🦞",
  Mammoth: "🦣",
  Monkey: "🐒",
  Moose: "🫎",
  Octopus: "🐙",
  Orangutan: "🦧",
  Otter: "🦦",
  Owl: "🦉",
  Panda: "🐼",
  Parrot: "🦜",
  Peacock: "🦚",
  Penguin: "🐧",
  Pig: "🐷",
  Rabbit: "🐰",
  Raccoon: "🦝",
  Raven: "🐦",
  Rhino: "🦏",
  Seal: "🦭",
  Shark: "🦈",
  Sheep: "🐑",
  Skunk: "🦨",
  Sloth: "🦥",
  Snake: "🐍",
  Squid: "🦑",
  Squirrel: "🐿️",
  Swan: "🦢",
  Tiger: "🐯",
  Turkey: "🦃",
  Turtle: "🐢",
  Whale: "🐳",
  Wolf: "🐺",
  Zebra: "🦓",
};

export function resolveArt(word: string, source: WordSource | undefined): string | undefined {
  switch (source) {
    case "animals":
      return ANIMAL_EMOJI[word];
    case "pokemon":
      return getSpriteUrl(word.toLowerCase()) ?? undefined;
    default:
      return undefined;
  }
}
