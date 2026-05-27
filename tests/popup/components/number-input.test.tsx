import { fireEvent, render, screen } from "@testing-library/preact";
import { NumberInput } from "../../../src/popup/components/NumberInput";

describe("NumberInput", () => {
  it("renders an input with the given value", () => {
    render(<NumberInput value="3" onInput={() => {}} id="test" />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("3");
  });

  it("calls onInput when the user types directly", () => {
    const onInput = jest.fn();
    render(<NumberInput value="3" onInput={onInput} id="test" />);
    const input = screen.getByRole("spinbutton");
    fireEvent.input(input, { target: { value: "5" } });
    expect(onInput).toHaveBeenCalledWith("5");
  });

  it("increments value by step when up button is clicked", () => {
    const onInput = jest.fn();
    render(<NumberInput value="3" step={1} onInput={onInput} />);
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("4");
  });

  it("decrements value by step when down button is clicked", () => {
    const onInput = jest.fn();
    render(<NumberInput value="3" step={1} onInput={onInput} />);
    fireEvent.click(screen.getByLabelText("Decrement"));
    expect(onInput).toHaveBeenCalledWith("2");
  });

  it("does not decrement below min", () => {
    const onInput = jest.fn();
    render(<NumberInput value="1" step={1} min={1} onInput={onInput} />);
    fireEvent.click(screen.getByLabelText("Decrement"));
    expect(onInput).not.toHaveBeenCalled();
  });

  it("handles decimal step correctly", () => {
    const onInput = jest.fn();
    render(<NumberInput value="1.5" step={0.1} onInput={onInput} />);
    fireEvent.click(screen.getByLabelText("Increment"));
    expect(onInput).toHaveBeenCalledWith("1.6");
  });

  it("applies wh-numfield--error class when error is true", () => {
    const { container } = render(<NumberInput value="0" onInput={() => {}} error />);
    expect(container.querySelector(".wh-numfield--error")).not.toBeNull();
  });

  it("does not apply error class by default", () => {
    const { container } = render(<NumberInput value="0" onInput={() => {}} />);
    expect(container.querySelector(".wh-numfield--error")).toBeNull();
  });

  it("renders a type=number input (spinbutton role for accessibility)", () => {
    render(<NumberInput value="5" onInput={() => {}} />);
    expect(screen.getByRole("spinbutton")).not.toBeNull();
  });
});
