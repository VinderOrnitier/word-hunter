import { en } from "../../src/i18n/messages/en";

describe("Pokédex modal/reload copy keys", () => {
  it("defines the modal + reload-hint pokedex strings", () => {
    expect(en.pdx_reload_hint_text).toBe("Reload to hunt");
    expect(en.pdx_custom_word_prompt).toBe("Enter your own word to hunt");
    expect(en.pdx_custom_word_helper).toBe(
      "no spaces · 2-25 letters · won't appear in your collection"
    );
    expect(en.pdx_custom_word_submit).toBe("Start");
  });
});
