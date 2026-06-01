import { fireEvent, render } from "@testing-library/preact";
import { SwitchPdx } from "../../../src/popup/components/Switch.pdx";

describe("SwitchPdx", () => {
  it("reflects the checked state via aria-checked and is-on class", () => {
    const { container, rerender } = render(
      <SwitchPdx checked={false} ariaLabel="Reload hint" onChange={() => {}} />
    );
    const btn = container.querySelector("button");
    expect(btn).toHaveAttribute("role", "switch");
    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(btn?.className).not.toContain("is-on");

    rerender(<SwitchPdx checked={true} ariaLabel="Reload hint" onChange={() => {}} />);
    const onBtn = container.querySelector("button");
    expect(onBtn).toHaveAttribute("aria-checked", "true");
    expect(onBtn?.className).toContain("is-on");
  });

  it("calls onChange with the toggled value on click", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <SwitchPdx checked={false} ariaLabel="Reload hint" onChange={onChange} />
    );
    fireEvent.click(getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not fire onChange when disabled", () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <SwitchPdx checked={false} ariaLabel="x" disabled onChange={onChange} />
    );
    fireEvent.click(getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole("switch")).toBeDisabled();
  });
});
