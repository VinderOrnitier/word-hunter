import { PIXELARTICONS_BODIES } from "../../../src/popup/components/pixelarticons";

const EXPECTED_SLUGS = [
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
];

describe("PIXELARTICONS_BODIES", () => {
  it("contains exactly the 16 Pokédex icon slugs", () => {
    expect(Object.keys(PIXELARTICONS_BODIES).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has a non-empty currentColor SVG body for every slug", () => {
    for (const slug of EXPECTED_SLUGS) {
      expect(PIXELARTICONS_BODIES[slug]).toContain("currentColor");
    }
  });
});
