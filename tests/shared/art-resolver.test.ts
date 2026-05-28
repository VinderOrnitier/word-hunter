import { resolveArt, resolveArtView } from "../../src/shared/art-resolver";

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

describe("resolveArtView", () => {
  it("returns sprite kind with url for a known pokemon", () => {
    expect(resolveArtView("pikachu", "pokemon")).toEqual({
      kind: "sprite",
      url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
    });
  });

  it("is case-insensitive for pokemon names", () => {
    expect(resolveArtView("Pikachu", "pokemon")).toEqual({
      kind: "sprite",
      url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
    });
  });

  it("returns none for an unknown pokemon", () => {
    expect(resolveArtView("unknownmon", "pokemon")).toEqual({ kind: "none" });
  });

  it("returns emoji kind with char for a known animal", () => {
    expect(resolveArtView("Cat", "animals")).toEqual({ kind: "emoji", char: "🐱" });
  });

  it("returns none for an unknown animal", () => {
    expect(resolveArtView("dragon", "animals")).toEqual({ kind: "none" });
  });

  it("returns none for custom word source", () => {
    expect(resolveArtView("anything", "custom")).toEqual({ kind: "none" });
  });

  it("returns none when source is undefined", () => {
    expect(resolveArtView("anything", undefined)).toEqual({ kind: "none" });
  });
});
