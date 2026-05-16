import { validateCustomWord } from "../../src/shared/word-validation";

describe("validateCustomWord", () => {
  it("returns undefined for an empty string", () => {
    expect(validateCustomWord("")).toBeUndefined();
  });

  it("returns an error for invalid characters", () => {
    expect(validateCustomWord("hello123")).toBe("Letters and hyphens only");
  });

  it("returns an error when the word is too short", () => {
    expect(validateCustomWord("a")).toBe("Min 2 characters");
  });

  it("returns an error when the word exceeds 25 characters", () => {
    expect(validateCustomWord("a".repeat(26))).toBe("Max 25 characters");
  });

  it("returns an error for hyphen-only strings", () => {
    expect(validateCustomWord("--")).toBe("Must contain at least one letter");
    expect(validateCustomWord("-")).toBe("Must contain at least one letter");
  });

  it("returns undefined for a valid word", () => {
    expect(validateCustomWord("fox")).toBeUndefined();
  });

  it("returns undefined for a hyphenated word", () => {
    expect(validateCustomWord("self-aware")).toBeUndefined();
  });

  it("returns undefined for non-Latin scripts", () => {
    expect(validateCustomWord("дракон")).toBeUndefined();
    expect(validateCustomWord("تنين")).toBeUndefined();
    expect(validateCustomWord("ドラゴン")).toBeUndefined();
  });
});
