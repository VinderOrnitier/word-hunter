import { getSpriteUrl, POKEMON_NAMES } from "../../src/shared/pokemon-sprites";

describe("getSpriteUrl", () => {
  it("returns the showdown GIF URL for a known pokemon", () => {
    expect(getSpriteUrl("pikachu")).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif"
    );
  });

  it("returns null for an unknown pokemon name", () => {
    expect(getSpriteUrl("unknownmon")).toBeNull();
  });
});

describe("POKEMON_NAMES", () => {
  it("contains all 151 Gen 1 pokemon", () => {
    expect(POKEMON_NAMES).toHaveLength(151);
  });
});
