import { render } from "@testing-library/preact";
import { BottomActionBarPdx } from "../../../src/popup/components/BottomActionBar.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderBar(props: Partial<Parameters<typeof BottomActionBarPdx>[0]> = {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <BottomActionBarPdx
        onStart={props.onStart ?? (() => {})}
        onShuffle={props.onShuffle ?? (() => {})}
        onCustom={props.onCustom ?? (() => {})}
        startDisabled={props.startDisabled}
        autoContinue={props.autoContinue}
        onAutoContinue={props.onAutoContinue ?? (() => {})}
      />
    </ThemeContext.Provider>
  );
}

describe("BottomActionBarPdx", () => {
  it("renders the raspberry action bar with a primary CTA", () => {
    const { container } = renderBar();
    expect(container.querySelector(".pdx-popup__action-bar")).not.toBeNull();
    expect(container.querySelector(".pdx-action-primary")).not.toBeNull();
    expect(container.querySelectorAll(".pdx-action-icon").length).toBe(3);
  });

  it("disables the primary CTA and marks auto-continue on", () => {
    const { container } = renderBar({ startDisabled: true, autoContinue: true });
    expect(container.querySelector<HTMLButtonElement>(".pdx-action-primary")?.disabled).toBe(true);
    expect(container.querySelector(".pdx-action-icon.is-on")).not.toBeNull();
  });

  it("fires onStart when the CTA is clicked", () => {
    const onStart = jest.fn();
    const { container } = renderBar({ onStart });
    container.querySelector<HTMLButtonElement>(".pdx-action-primary")?.click();
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
