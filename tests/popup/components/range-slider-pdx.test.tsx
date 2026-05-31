import { fireEvent, render } from "@testing-library/preact";
import { RangeSliderPdx } from "../../../src/popup/components/RangeSlider.pdx";

describe("RangeSliderPdx", () => {
  it("always renders exactly 12 cells (trap #4)", () => {
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={() => {}} />
    );
    expect(container.querySelectorAll(".pdx-range-mini__cell")).toHaveLength(12);
  });

  it("places the head cell per the value→cell ratio and fills before it", () => {
    // value 60: round((60-30)/120 * 11) = round(2.75) = 3
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={() => {}} />
    );
    const cells = Array.from(container.querySelectorAll(".pdx-range-mini__cell"));
    expect(cells[3].className).toContain("is-head");
    expect(cells[2].className).toContain("is-filled");
    expect(cells[4].className).not.toContain("is-filled");
    expect(cells[4].className).not.toContain("is-head");
  });

  it("shows the raw value in the chip", () => {
    const { container } = render(
      <RangeSliderPdx value={100} min={30} max={150} step={10} onInput={() => {}} />
    );
    expect(container.querySelector(".pdx-range-mini__chip")?.textContent).toBe("100");
  });

  it("emits a number from the native range input", () => {
    const onInput = jest.fn();
    const { container } = render(
      <RangeSliderPdx value={60} min={30} max={150} step={10} onInput={onInput} />
    );
    const input = container.querySelector("input[type=range]") as HTMLInputElement;
    fireEvent.input(input, { target: { value: "90" } });
    expect(onInput).toHaveBeenCalledWith(90);
  });
});
