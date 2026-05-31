import { render } from "@testing-library/preact";
import { ConfirmOverlayPdx } from "../../../src/popup/components/ConfirmOverlay.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderOverlay(onConfirm = () => {}, onCancel = () => {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ConfirmOverlayPdx prompt="Clear all hunts?" onConfirm={onConfirm} onCancel={onCancel} />
    </ThemeContext.Provider>
  );
}

describe("ConfirmOverlayPdx", () => {
  it("renders the raspberry confirm footer with the prompt", () => {
    const { container, getByText } = renderOverlay();
    expect(container.querySelector(".pdx-popup__confirm")).not.toBeNull();
    expect(container.querySelector(".pdx-btn-danger")).not.toBeNull();
    expect(container.querySelector(".pdx-btn-ghost")).not.toBeNull();
    expect(getByText("Clear all hunts?")).toBeInTheDocument();
  });

  it("fires onConfirm (danger) and onCancel (ghost)", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { container } = renderOverlay(onConfirm, onCancel);
    container.querySelector<HTMLButtonElement>(".pdx-btn-danger")?.click();
    container.querySelector<HTMLButtonElement>(".pdx-btn-ghost")?.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
