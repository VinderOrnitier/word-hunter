import { fireEvent, render } from "@testing-library/preact";
import { NumberStepperPdx } from "../../../src/popup/components/NumberStepper.pdx";

describe("NumberStepperPdx", () => {
  it("renders the value and unit in the LCD", () => {
    const { container } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={() => {}} />
    );
    expect(container.querySelector(".pdx-stepper-mini__value")?.textContent).toBe("3");
    expect(container.querySelector(".pdx-stepper-mini__unit")?.textContent).toBe("min");
  });

  it("increments by step on the plus key", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={onInput} />
    );
    fireEvent.click(getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("4");
  });

  it("decrements by step on the minus key", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="3" unit="min" min={1} step={1} onInput={onInput} />
    );
    fireEvent.click(getByLabelText("Decrement"));
    expect(onInput).toHaveBeenCalledWith("2");
  });

  it("clamps at min (no call below min)", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="1" unit="min" min={1} step={1} onInput={onInput} />
    );
    fireEvent.click(getByLabelText("Decrement"));
    expect(onInput).not.toHaveBeenCalled();
  });

  it("rounds to the step's decimal places (0.1 step)", () => {
    const onInput = jest.fn();
    const { getByLabelText } = render(
      <NumberStepperPdx value="1.5" unit="s" min={0.1} step={0.1} onInput={onInput} />
    );
    fireEvent.click(getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("1.6");
  });
});
