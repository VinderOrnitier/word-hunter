import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { CustomWordModal } from "../../../src/popup/play/CustomWordModal";

describe("CustomWordModal", () => {
  it("renders the input and primary 'Start hunt' button when open", () => {
    render(<CustomWordModal open onClose={() => {}} onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText(/serendipity/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start hunt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
  });

  it("renders nothing when open is false", () => {
    const { container } = render(
      <CustomWordModal open={false} onClose={() => {}} onSubmit={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <CustomWordModal open onClose={onClose} onSubmit={() => {}} />,
    );
    const backdrop = container.querySelector(".wh-modal__backdrop") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when the dialog itself is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <CustomWordModal open onClose={onClose} onSubmit={() => {}} />,
    );
    const dialog = container.querySelector(".wh-modal__dialog") as HTMLElement;
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = jest.fn();
    render(<CustomWordModal open onClose={onClose} onSubmit={() => {}} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close icon button is clicked", () => {
    const onClose = jest.fn();
    render(<CustomWordModal open onClose={onClose} onSubmit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit with the trimmed word when valid and Start hunt is clicked", () => {
    const onSubmit = jest.fn();
    render(<CustomWordModal open onClose={() => {}} onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText(/serendipity/i);
    fireEvent.input(input, { target: { value: "unicorn" } });
    fireEvent.click(screen.getByRole("button", { name: /start hunt/i }));
    expect(onSubmit).toHaveBeenCalledWith("unicorn");
  });

  it("does not submit when the input is empty", () => {
    const onSubmit = jest.fn();
    render(<CustomWordModal open onClose={() => {}} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /start hunt/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error and blocks submit for invalid input", () => {
    const onSubmit = jest.fn();
    render(<CustomWordModal open onClose={() => {}} onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText(/serendipity/i);
    fireEvent.input(input, { target: { value: "bad!" } });
    fireEvent.click(screen.getByRole("button", { name: /start hunt/i }));
    expect(screen.getByText(/letters and hyphens only/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("updates the character counter as the user types", () => {
    render(<CustomWordModal open onClose={() => {}} onSubmit={() => {}} />);
    const input = screen.getByPlaceholderText(/serendipity/i);
    fireEvent.input(input, { target: { value: "dragon" } });
    expect(screen.getByText("6 / 25")).toBeInTheDocument();
  });

  it("focuses the input when opened", async () => {
    render(<CustomWordModal open onClose={() => {}} onSubmit={() => {}} />);
    const input = screen.getByPlaceholderText(/serendipity/i);
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("resets local state when reopened", () => {
    const { rerender } = render(
      <CustomWordModal open onClose={() => {}} onSubmit={() => {}} />,
    );
    const input = screen.getByPlaceholderText(/serendipity/i) as HTMLInputElement;
    fireEvent.input(input, { target: { value: "abc" } });
    expect(input.value).toBe("abc");

    rerender(<CustomWordModal open={false} onClose={() => {}} onSubmit={() => {}} />);
    rerender(<CustomWordModal open onClose={() => {}} onSubmit={() => {}} />);

    const reopened = screen.getByPlaceholderText(/serendipity/i) as HTMLInputElement;
    expect(reopened.value).toBe("");
  });
});
