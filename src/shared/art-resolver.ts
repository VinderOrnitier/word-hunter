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

export type ResolvedArt =
  | { kind: "sprite"; url: string }
  | { kind: "emoji"; char: string }
  | { kind: "none" };

export function resolveArtView(word: string, source: WordSource | undefined): ResolvedArt {
  switch (source) {
    case "animals": {
      const char = ANIMAL_EMOJI[word];
      return char ? { kind: "emoji", char } : { kind: "none" };
    }
    case "pokemon": {
      const url = getSpriteUrl(word.toLowerCase());
      return url ? { kind: "sprite", url } : { kind: "none" };
    }
    default:
      return { kind: "none" };
  }
}

export function resolveArt(word: string, source: WordSource | undefined): string | undefined {
  const art = resolveArtView(word, source);
  if (art.kind === "sprite") return art.url;
  if (art.kind === "emoji") return art.char;
  return undefined;
}
