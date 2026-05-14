import { render, screen, fireEvent } from "@testing-library/preact";
import { Input } from "../../../src/popup/components/Input";

describe("Input", () => {
  it("reflects the value prop in the rendered input", () => {
    render(<Input value="hello" onInput={() => {}} placeholder="type…" />);
    const el = screen.getByPlaceholderText("type…") as HTMLInputElement;
    expect(el.value).toBe("hello");
  });

  it("calls onInput with the new value when the user types", () => {
    const onInput = jest.fn();
    render(<Input value="" onInput={onInput} placeholder="type…" />);
    const el = screen.getByPlaceholderText("type…") as HTMLInputElement;
    fireEvent.input(el, { target: { value: "owl" } });
    expect(onInput).toHaveBeenCalledWith("owl");
  });

  it("applies wh-input--mono class when mono is set", () => {
    const { container } = render(
      <Input value="" onInput={() => {}} mono />
    );
    expect(container.querySelector("input")).toHaveClass("wh-input--mono");
  });

  it("applies wh-input--error class when error is true", () => {
    const { container } = render(
      <Input value="" onInput={() => {}} error />
    );
    expect(container.querySelector("input")).toHaveClass("wh-input--error");
  });

  it("does not apply wh-input--error class by default", () => {
    const { container } = render(
      <Input value="" onInput={() => {}} />
    );
    expect(container.querySelector("input")).not.toHaveClass("wh-input--error");
  });
});
