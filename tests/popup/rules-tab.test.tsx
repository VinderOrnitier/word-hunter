import { render, screen } from "@testing-library/preact";
import { RulesTab } from "../../src/popup/tabs/RulesTab";

describe("RulesTab", () => {
  it("renders the Fraunces italic editorial opener", () => {
    const { container } = render(<RulesTab />);
    const opener = container.querySelector(".wh-editorial");
    expect(opener?.textContent).toMatch(/quiet game/i);
  });

  it("mentions the 50-word minimum rule", () => {
    render(<RulesTab />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it("mentions the notification when no paragraph qualifies", () => {
    const { container } = render(<RulesTab />);
    expect(container.textContent?.toLowerCase()).toMatch(/notif/);
  });

  it("uses player-facing language without technical jargon", () => {
    const { container } = render(<RulesTab />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\bDOM\b/);
    expect(text).not.toMatch(/\belement\b/i);
    expect(text).not.toMatch(/\bnode\b/i);
  });
});
