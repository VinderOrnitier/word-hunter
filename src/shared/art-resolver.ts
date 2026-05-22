import { getSpriteUrl } from "./pokemon-sprites";
import type { WordSource } from "./types";

const ANIMAL_EMOJI: Record<string, string> = {
  Alpaca: "🦙",
  Bat: "🦇",
  Bear: "🐻",
  Beaver: "🦫",
  Camel: "🐪",
  Cat: "🐱",
  Chameleon: "🦎",
  Cheetah: "🐆",
  Cow: "🐄",
  Crocodile: "🐊",
  Deer: "🦌",
  Dolphin: "🐬",
  Eagle: "🦅",
  Elephant: "🐘",
  Elk: "🫎",
  Flamingo: "🦩",
  Fox: "🦊",
  Frog: "🐸",
  Giraffe: "🦒",
  Gorilla: "🦍",
  Hamster: "🐹",
  Hedgehog: "🦔",
  Hippo: "🦛",
  Horse: "🐴",
  Iguana: "🦎",
  Jaguar: "🐆",
  Kangaroo: "🦘",
  Koala: "🐨",
  Leopard: "🐆",
  Lion: "🦁",
  Llama: "🦙",
  Moose: "🫎",
  Octopus: "🐙",
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
  Shark: "🦈",
  Skunk: "🦨",
  Sloth: "🦥",
  Squirrel: "🐿️",
  Tiger: "🐯",
  Turtle: "🐢",
  Vulture: "🦅",
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
