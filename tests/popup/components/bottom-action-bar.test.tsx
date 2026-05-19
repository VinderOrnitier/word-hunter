import { render, screen, fireEvent } from "@testing-library/preact";
import { BottomActionBar } from "../../../src/popup/components/BottomActionBar";

describe("BottomActionBar", () => {
  it("renders the primary CTA labelled 'Start a hunt'", () => {
    render(
      <BottomActionBar
        onStart={() => {}}
        onShuffle={() => {}}
        onCustom={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /start a hunt/i })).toBeInTheDocument();
  });

  it("renders the shuffle and custom icon buttons by aria-label", () => {
    render(
      <BottomActionBar
        onStart={() => {}}
        onShuffle={() => {}}
        onCustom={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /pick a random word/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /custom word/i })).toBeInTheDocument();
  });

  it("invokes onStart when the primary CTA is clicked", () => {
    const onStart = jest.fn();
    render(
      <BottomActionBar
        onStart={onStart}
        onShuffle={() => {}}
        onCustom={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("invokes onShuffle when the shuffle button is clicked", () => {
    const onShuffle = jest.fn();
    render(
      <BottomActionBar
        onStart={() => {}}
        onShuffle={onShuffle}
        onCustom={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /pick a random word/i }));
    expect(onShuffle).toHaveBeenCalledTimes(1);
  });

  it("invokes onCustom when the custom-word button is clicked", () => {
    const onCustom = jest.fn();
    render(
      <BottomActionBar
        onStart={() => {}}
        onShuffle={() => {}}
        onCustom={onCustom}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /custom word/i }));
    expect(onCustom).toHaveBeenCalledTimes(1);
  });
});
