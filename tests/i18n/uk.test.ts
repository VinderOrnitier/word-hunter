import { en } from "../../src/i18n/messages/en";
import { uk } from "../../src/i18n/messages/uk";
import type { MessageKey } from "../../src/i18n/types";

const enKeys = Object.keys(en) as MessageKey[];
const tokenRe = /\{(\w+)\}/g;

function tokens(s: string): string[] {
  return [...s.matchAll(tokenRe)].map((m) => m[1]).sort();
}

describe("uk translation", () => {
  it("covers every key defined in en", () => {
    for (const key of enKeys) {
      expect(uk[key]).toBeDefined();
      expect(uk[key]).not.toBe("");
    }
    expect(Object.keys(uk)).toHaveLength(enKeys.length);
  });

  it("preserves placeholder tokens for keys that have them", () => {
    for (const key of enKeys) {
      const enTokens = tokens(en[key]);
      if (enTokens.length === 0) continue;
      expect(tokens(uk[key] ?? "")).toEqual(enTokens);
    }
  });
});
