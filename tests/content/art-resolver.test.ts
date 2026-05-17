import { resolveArt } from "../../src/content/art-resolver";

describe("resolveArt", () => {
  it("returns the CDN sprite URL for a known pokemon", () => {
    expect(resolveArt("pikachu", "pokemon")).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif"
    );
  });

  it("is case-insensitive for pokemon names (Pikachu → pikachu)", () => {
    expect(resolveArt("Pikachu", "pokemon")).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif"
    );
  });

  it("returns undefined for an unknown pokemon name", () => {
    expect(resolveArt("unknownmon", "pokemon")).toBeUndefined();
  });

  it("returns the emoji for a known animal", () => {
    expect(resolveArt("Cat", "animals")).toBe("🐱");
  });

  it("returns undefined for an unknown animal", () => {
    expect(resolveArt("dragon", "animals")).toBeUndefined();
  });

  it("returns undefined for custom word list", () => {
    expect(resolveArt("anything", "custom")).toBeUndefined();
  });

  it("returns undefined when source is undefined", () => {
    expect(resolveArt("anything", undefined)).toBeUndefined();
  });
});
