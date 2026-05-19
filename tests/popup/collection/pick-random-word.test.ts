import { pickRandomWord } from "../../../src/popup/collection/pickRandomWord";
import { WORD_LISTS } from "../../../src/popup/word-lists";

describe("pickRandomWord", () => {
  it("returns a word from the given WordList", () => {
    const result = pickRandomWord("animals", new Map(), "any");
    expect(WORD_LISTS.animals).toContain(result);
  });

  it("returns only uncaught words when mode='uncaught' and some are caught", () => {
    const caughtAnimals = WORD_LISTS.animals.slice(0, WORD_LISTS.animals.length - 1);
    const counts = new Map(caughtAnimals.map((w) => [w, 1] as const));
    const remaining = WORD_LISTS.animals[WORD_LISTS.animals.length - 1];

    for (let i = 0; i < 20; i++) {
      const result = pickRandomWord("animals", counts, "uncaught");
      expect(result).toBe(remaining);
    }
  });

  it("falls back to the full list when every word is already caught (mode='uncaught')", () => {
    const counts = new Map(WORD_LISTS.animals.map((w) => [w, 3] as const));
    const result = pickRandomWord("animals", counts, "uncaught");
    expect(WORD_LISTS.animals).toContain(result);
  });

  it("defaults to mode='uncaught' when omitted", () => {
    const caughtAnimals = WORD_LISTS.animals.slice(0, WORD_LISTS.animals.length - 1);
    const counts = new Map(caughtAnimals.map((w) => [w, 1] as const));
    const remaining = WORD_LISTS.animals[WORD_LISTS.animals.length - 1];
    const result = pickRandomWord("animals", counts);
    expect(result).toBe(remaining);
  });

  it("treats counts of zero as uncaught", () => {
    const counts = new Map(WORD_LISTS.animals.map((w) => [w, 0] as const));
    const result = pickRandomWord("animals", counts, "uncaught");
    expect(WORD_LISTS.animals).toContain(result);
  });

  it("works for the pokemon list", () => {
    const result = pickRandomWord("pokemon", new Map(), "any");
    expect(WORD_LISTS.pokemon).toContain(result);
  });
});
