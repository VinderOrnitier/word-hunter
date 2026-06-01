import { render } from "@testing-library/preact";
import { ReloadHintPdx } from "../../../src/popup/play/ReloadHint.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderHint(onReload = () => {}, onDismiss = () => {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <ReloadHintPdx onReload={onReload} onDismiss={onDismiss} />
    </ThemeContext.Provider>
  );
}

describe("ReloadHintPdx", () => {
  it("renders the LCD notice with the RELOAD TO HUNT message", () => {
    const { container, getByText } = renderHint();
    expect(container.querySelector(".pdx-reload-hint")).not.toBeNull();
    expect(container.querySelector(".pdx-reload-hint__info")).not.toBeNull();
    expect(getByText("Reload to hunt")).toBeInTheDocument();
  });

  it("fires onReload and onDismiss", () => {
    const onReload = jest.fn();
    const onDismiss = jest.fn();
    const { container } = renderHint(onReload, onDismiss);
    container.querySelector<HTMLButtonElement>(".pdx-reload-hint__btn")?.click();
    container.querySelector<HTMLButtonElement>(".pdx-reload-hint__close")?.click();
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
