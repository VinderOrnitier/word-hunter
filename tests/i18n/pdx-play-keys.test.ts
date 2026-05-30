import { en } from "../../src/i18n/messages/en";

describe("Pokédex Play copy keys", () => {
  it("defines the Play-surface pokedex strings", () => {
    expect(en.pdx_active_now_hunting).toBe("Now hunting");
    expect(en.pdx_active_no_hunt).toBe("No hunt");
    expect(en.pdx_active_empty_hint).toBe("pick a slot below to start.");
    expect(en.pdx_progress_caught_label).toBe("CGHT");
    expect(en.pdx_filter_label).toBe("Show");
    expect(en.pdx_filter_all).toBe("All");
    expect(en.pdx_filter_caught).toBe("CGHT");
    expect(en.pdx_filter_uncaught).toBe("MISS");
    expect(en.pdx_collection_empty_caught).toBe("No catches — go hunt!");
    expect(en.pdx_collection_empty_uncaught).toBe("All caught!");
  });
});
