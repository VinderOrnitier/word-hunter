import { de } from "../../src/i18n/messages/de";
import { en } from "../../src/i18n/messages/en";
import { uk } from "../../src/i18n/messages/uk";

describe("Pokédex tab label keys", () => {
  it("defines short en labels for the key-cap tabs", () => {
    expect(en.pdx_tab_play).toBe("Play");
    expect(en.pdx_tab_stats).toBe("Stats");
    expect(en.pdx_tab_settings).toBe("Settings");
  });

  it("uses short localized forms where the full word overflows the key-cap", () => {
    expect(de.pdx_tab_settings).toBe("Optionen");
    expect(uk.pdx_tab_settings).toBe("Опції");
    expect(de.pdx_tab_stats).toBe("Stats");
    // uk keeps the full word — "Статистика" already fits the key-cap.
    expect(uk.pdx_tab_stats).toBe("Статистика");
  });
});
