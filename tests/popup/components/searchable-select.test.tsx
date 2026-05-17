import { render, screen, fireEvent } from "@testing-library/preact";
import { SearchableSelect } from "../../../src/popup/components/SearchableSelect";

const LIST_OPTIONS = [
  { value: "animals", label: "Animals" },
  { value: "pokemon", label: "Pokémon" },
];

const ANIMALS = ["alpaca", "fox", "tiger", "wolf"];

describe("SearchableSelect", () => {
  // ── Slice 1: trigger shows selected label ────────────────────
  it("shows the selected option label on the trigger", () => {
    render(
      <SearchableSelect value="pokemon" onChange={() => {}}>
        {LIST_OPTIONS}
      </SearchableSelect>
    );
    expect(screen.getByRole("button", { name: /pokémon/i })).toBeInTheDocument();
  });

  // ── Slice 2: clicking trigger reveals all options ─────────────
  it("shows all options when the trigger is clicked", () => {
    render(
      <SearchableSelect value="animals" onChange={() => {}}>
        {LIST_OPTIONS}
      </SearchableSelect>
    );
    fireEvent.click(screen.getByRole("button", { name: /animals/i }));
    expect(screen.getByRole("option", { name: "Animals" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pokémon" })).toBeInTheDocument();
  });

  // ── Slice 3: typing in search filters the list ────────────────
  it("filters options to those matching the search query", () => {
    render(
      <SearchableSelect value="alpaca" onChange={() => {}}>
        {ANIMALS}
      </SearchableSelect>
    );
    fireEvent.click(screen.getByRole("button", { name: /alpaca/i }));
    fireEvent.input(screen.getByPlaceholderText("Search…"), {
      target: { value: "tig" },
    });
    expect(screen.getByRole("option", { name: "tiger" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "fox" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "wolf" })).not.toBeInTheDocument();
  });

  // ── Slice 4: empty result shows "No results" message ─────────
  it("shows a 'No results' message when the query matches nothing", () => {
    render(
      <SearchableSelect value="alpaca" onChange={() => {}}>
        {ANIMALS}
      </SearchableSelect>
    );
    fireEvent.click(screen.getByRole("button", { name: /alpaca/i }));
    fireEvent.input(screen.getByPlaceholderText("Search…"), {
      target: { value: "xyz" },
    });
    expect(screen.getByText(/no results for "xyz"/i)).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  // ── Slice 5: selecting an option calls onChange and closes ────
  it("calls onChange with the option value and closes the dropdown", () => {
    const onChange = jest.fn();
    render(
      <SearchableSelect value="alpaca" onChange={onChange}>
        {ANIMALS}
      </SearchableSelect>
    );
    fireEvent.click(screen.getByRole("button", { name: /alpaca/i }));
    fireEvent.click(screen.getByRole("option", { name: "tiger" }));
    expect(onChange).toHaveBeenCalledWith("tiger");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  // ── Slice 6: Escape closes the dropdown ───────────────────────
  it("closes the dropdown when Escape is pressed", () => {
    render(
      <SearchableSelect value="alpaca" onChange={() => {}}>
        {ANIMALS}
      </SearchableSelect>
    );
    fireEvent.click(screen.getByRole("button", { name: /alpaca/i }));
    expect(screen.getByRole("option", { name: "tiger" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByPlaceholderText("Search…"), { key: "Escape" });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
