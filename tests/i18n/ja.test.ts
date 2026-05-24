import { en } from "../../src/i18n/messages/en";
import { ja } from "../../src/i18n/messages/ja";
import type { MessageKey } from "../../src/i18n/types";

const enKeys = Object.keys(en) as MessageKey[];
const tokenRe = /\{(\w+)\}/g;

function tokens(s: string): string[] {
  return [...s.matchAll(tokenRe)].map((m) => m[1]).sort();
}

describe("ja translation", () => {
  it("covers every key defined in en", () => {
    for (const key of enKeys) {
      expect(ja[key]).toBeDefined();
      expect(ja[key]).not.toBe("");
    }
    expect(Object.keys(ja)).toHaveLength(enKeys.length);
  });

  it("preserves placeholder tokens for keys that have them", () => {
    for (const key of enKeys) {
      const enTokens = tokens(en[key]);
      if (enTokens.length === 0) continue;
      expect(tokens(ja[key] ?? "")).toEqual(enTokens);
    }
  });
});
