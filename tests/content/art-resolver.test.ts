import { createArtResolver } from "../../src/content/art-resolver";

const noImages: Record<string, string> = {};

describe("createArtResolver", () => {
  it("returns the emoji for a known animal", () => {
    const resolve = createArtResolver(noImages);
    expect(resolve("cat", "animals")).toBe("🐱");
  });

  it("returns undefined for an unknown animal", () => {
    const resolve = createArtResolver(noImages);
    expect(resolve("dragon", "animals")).toBeUndefined();
  });

  it("returns the image URL for a pokemon that has a matching file", () => {
    const images = { "../assets/pokemon/pikachu.png": "chrome-ext://pikachu.png" };
    const resolve = createArtResolver(images);
    expect(resolve("Pikachu", "pokemon")).toBe("chrome-ext://pikachu.png");
  });

  it("falls back to placeholder when no specific pokemon image exists", () => {
    const images = { "../assets/pokemon/_placeholder.png": "chrome-ext://placeholder.png" };
    const resolve = createArtResolver(images);
    expect(resolve("Mewtwo", "pokemon")).toBe("chrome-ext://placeholder.png");
  });

  it("resolves pokemon image case-insensitively (list entry 'Pikachu' → pikachu.png)", () => {
    const images = {
      "../assets/pokemon/pikachu.png": "chrome-ext://pikachu.png",
      "../assets/pokemon/_placeholder.png": "chrome-ext://placeholder.png",
    };
    const resolve = createArtResolver(images);
    expect(resolve("Pikachu", "pokemon")).toBe("chrome-ext://pikachu.png");
  });

  it("returns undefined for custom word list", () => {
    const resolve = createArtResolver(noImages);
    expect(resolve("anything", "custom")).toBeUndefined();
  });

  it("returns undefined when source is undefined", () => {
    const resolve = createArtResolver(noImages);
    expect(resolve("anything", undefined)).toBeUndefined();
  });
});
