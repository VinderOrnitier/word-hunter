import { fireEvent, render } from "@testing-library/preact";
import { CustomWordModalPdx } from "../../../src/popup/play/CustomWordModal.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function renderModal(props: Partial<Parameters<typeof CustomWordModalPdx>[0]> = {}) {
  return render(
    <ThemeContext.Provider value="pokedex">
      <CustomWordModalPdx
        open={props.open ?? true}
        onClose={props.onClose ?? (() => {})}
        onSubmit={props.onSubmit ?? (() => {})}
      />
    </ThemeContext.Provider>
  );
}

describe("CustomWordModalPdx", () => {
  it("renders nothing when closed", () => {
    const { container } = renderModal({ open: false });
    expect(container.querySelector(".pdx-modal")).toBeNull();
  });

  it("renders the raspberry modal + LCD input + footer buttons when open", () => {
    const { container, getByText } = renderModal();
    expect(container.querySelector(".pdx-modal-backdrop")).not.toBeNull();
    expect(container.querySelector(".pdx-modal")).not.toBeNull();
    expect(container.querySelector(".pdx-modal__input")).not.toBeNull();
    expect(getByText("Enter your own word to hunt")).toBeInTheDocument();
    expect(getByText("Start")).toBeInTheDocument();
  });

  it("submits a valid trimmed word", () => {
    const onSubmit = jest.fn();
    const { container, getByText } = renderModal({ onSubmit });
    const input = container.querySelector<HTMLInputElement>(".pdx-modal__input");
    if (input) fireEvent.input(input, { target: { value: "serendipity" } });
    getByText("Start").click();
    expect(onSubmit).toHaveBeenCalledWith("serendipity");
  });

  it("shows an error and does not submit an invalid word", () => {
    const onSubmit = jest.fn();
    const { container, getByText } = renderModal({ onSubmit });
    const input = container.querySelector<HTMLInputElement>(".pdx-modal__input");
    if (input) fireEvent.input(input, { target: { value: "ab12!" } });
    // fireEvent.click flushes the Preact rerender (act) so the error markup
    // is observable synchronously; a raw .click() defers the rerender.
    fireEvent.click(getByText("Start"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector(".pdx-modal__error")).not.toBeNull();
  });

  it("closes on Escape and on backdrop click", () => {
    const onClose = jest.fn();
    const { container } = renderModal({ onClose });
    fireEvent.keyDown(document, { key: "Escape" });
    container.querySelector<HTMLButtonElement>(".pdx-modal-backdrop")?.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
