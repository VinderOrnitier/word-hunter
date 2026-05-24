import { t } from "../../src/i18n";

describe("t()", () => {
  it("returns the English string for a known key", () => {
    expect(t("active_word_eyebrow", "en")).toBe("Active word");
  });

  it("substitutes {param} tokens", () => {
    expect(t("stats_n_hunts", "en", { count: 3 })).toBe("3 hunts");
  });

  it("supports a count of zero", () => {
    expect(t("stats_n_hunts", "en", { count: 0 })).toBe("0 hunts");
  });

  it("substitutes multiple params", () => {
    expect(
      t("progress_aria_label", "en", {
        caught: 5,
        total: 24,
        unlocked: 2,
        achTotal: 8,
      })
    ).toBe("Progress: 5 of 24 words caught, 2 of 8 achievements unlocked");
  });

  it("falls back to English when the requested locale has no translation", () => {
    expect(t("active_word_eyebrow", "ja")).toBe("Active word");
  });

  it("returns the German translation when de locale is selected", () => {
    expect(t("active_word_eyebrow", "de")).toBe("Aktives Wort");
  });

  it("returns the Ukrainian translation when uk locale is selected", () => {
    expect(t("active_word_eyebrow", "uk")).toBe("Активне слово");
  });

  it("returns the raw template when no params are passed", () => {
    expect(t("stats_n_hunts", "en")).toBe("{count} hunts");
  });
});
