import { fireEvent, render, screen } from "@testing-library/preact";
import { ActiveWordCard } from "../../../src/popup/play/ActiveWordCard";
import type { ActiveWord } from "../../../src/shared/types";

describe("ActiveWordCard", () => {
  it("shows the placeholder copy when no active word is set", () => {
    render(<ActiveWordCard activeWord={null} onClear={() => {}} />);
    expect(screen.getByText(/no active word/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a word below/i)).toBeInTheDocument();
  });

  it("shows the active word and the 'Active word' eyebrow when one is set", () => {
    const active: ActiveWord = { word: "Fox", list: "animals", insertedAt: 0 };
    render(<ActiveWordCard activeWord={active} onClear={() => {}} />);
    expect(screen.getByText(/active word/i)).toBeInTheDocument();
    expect(screen.getByText("Fox")).toBeInTheDocument();
  });

  it("renders a stop button labelled 'Clear active word' that fires onClear", () => {
    const active: ActiveWord = { word: "Fox", list: "animals", insertedAt: 0 };
    const onClear = jest.fn();
    render(<ActiveWordCard activeWord={active} onClear={onClear} />);
    const stop = screen.getByRole("button", { name: /clear active word/i });
    fireEvent.click(stop);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not render the stop button when no active word is set", () => {
    render(<ActiveWordCard activeWord={null} onClear={() => {}} />);
    expect(screen.queryByRole("button", { name: /clear active word/i })).toBeNull();
  });

  it("renders the animal emoji art when the active word is from the animals list", () => {
    const active: ActiveWord = { word: "Fox", list: "animals", insertedAt: 0 };
    render(<ActiveWordCard activeWord={active} onClear={() => {}} />);
    expect(screen.getByText("🦊")).toBeInTheDocument();
  });

  it("renders the pokemon sprite when the active word is from the pokemon list", () => {
    const active: ActiveWord = { word: "Pikachu", list: "pokemon", insertedAt: 0 };
    const { container } = render(<ActiveWordCard activeWord={active} onClear={() => {}} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
  });
});
