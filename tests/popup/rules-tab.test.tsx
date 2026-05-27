import { render } from "@testing-library/preact";
import { RulesTab } from "../../src/popup/tabs/RulesTab";

describe("RulesTab", () => {
  it("renders the Fraunces italic editorial opener", () => {
    const { container } = render(<RulesTab />);
    const opener = container.querySelector(".wh-editorial");
    expect(opener?.textContent).toMatch(/quiet game/i);
  });

  it("renders three numbered how-to-start steps", () => {
    const { container } = render(<RulesTab />);
    const dots = container.querySelectorAll(".wh-rules__step-dot");
    expect(dots).toHaveLength(3);
    expect(dots[0].textContent).toBe("1");
    expect(dots[1].textContent).toBe("2");
    expect(dots[2].textContent).toBe("3");
  });

  it("disclaimer advises adjusting settings when a page does not cooperate", () => {
    const { container } = render(<RulesTab />);
    const disclaimer = container.querySelector(".wh-rules__disclaimer");
    expect(disclaimer?.textContent?.toLowerCase()).toMatch(/settings/);
  });

  it("uses player-facing language without technical jargon", () => {
    const { container } = render(<RulesTab />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\bDOM\b/);
    expect(text).not.toMatch(/\belement\b/i);
    expect(text).not.toMatch(/\bnode\b/i);
  });
});
