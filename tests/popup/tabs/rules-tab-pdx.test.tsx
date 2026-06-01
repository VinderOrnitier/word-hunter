import { render } from "@testing-library/preact";
import { en } from "../../../src/i18n/messages/en";
import { RulesTabPdx } from "../../../src/popup/tabs/RulesTab.pdx";

describe("RulesTabPdx", () => {
  it("renders its own LCD body well", () => {
    const { container } = render(<RulesTabPdx />);
    expect(container.querySelector(".pdx-popup__body")).toBeTruthy();
    expect(container.querySelector(".pdx-popup__body-inner")).toBeTruthy();
    expect(container.querySelector(".rules-content")).toBeTruthy();
  });

  it("renders the editorial intro and body copy", () => {
    const { getByText } = render(<RulesTabPdx />);
    expect(getByText(en.rules_editorial)).toBeTruthy();
    expect(getByText(en.rules_body)).toBeTruthy();
  });

  it("renders the three steps with zero-padded markers", () => {
    const { container, getByText } = render(<RulesTabPdx />);
    const items = container.querySelectorAll(".rules-list li");
    expect(items).toHaveLength(3);
    const markers = Array.from(container.querySelectorAll(".rules-list__marker")).map(
      (m) => m.textContent
    );
    expect(markers).toEqual(["01", "02", "03"]);
    expect(getByText(en.rules_step_1)).toBeTruthy();
    expect(getByText(en.rules_step_2)).toBeTruthy();
    expect(getByText(en.rules_step_3)).toBeTruthy();
  });

  it("renders the settings hint and disclaimer (parity with Slate)", () => {
    const { getByText, container } = render(<RulesTabPdx />);
    expect(getByText(en.rules_settings)).toBeTruthy();
    expect(getByText(en.rules_disclaimer)).toBeTruthy();
    expect(container.querySelector(".rules-settings svg")).toBeTruthy();
  });
});
