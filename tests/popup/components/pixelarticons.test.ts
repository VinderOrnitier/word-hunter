import {
  PIXELARTICONS_BODIES,
  type PixelarticonSlug,
} from "../../../src/popup/components/pixelarticons";

const EXPECTED_SLUGS: PixelarticonSlug[] = [
  "search",
  "chart",
  "sliders",
  "info-box",
  "trash",
  "external-link",
  "reload",
  "check",
  "close",
  "target",
  "clock",
  "play",
  "shuffle",
  "edit",
  "star",
  "chevron-down",
  "bookmark",
];

describe("PIXELARTICONS_BODIES", () => {
  it("contains exactly the 17 Pokédex icon slugs", () => {
    expect(Object.keys(PIXELARTICONS_BODIES).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has a non-empty currentColor SVG body for every slug", () => {
    for (const slug of EXPECTED_SLUGS) {
      expect(PIXELARTICONS_BODIES[slug]).toContain("currentColor");
    }
  });
});
