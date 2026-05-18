import { render, screen, fireEvent } from "@testing-library/preact";
import { CollectionToolbar } from "../../../src/popup/collection/CollectionToolbar";

describe("CollectionToolbar", () => {
  it("calls onListChange with 'pokemon' when the Pokémon chip is clicked", () => {
    const onListChange = jest.fn();
    render(
      <CollectionToolbar
        list="animals"
        filter="all"
        onListChange={onListChange}
        onFilterChange={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("tab", { name: /pokémon/i }));
    expect(onListChange).toHaveBeenCalledWith("pokemon");
  });

  it("calls onFilterChange with 'caught' when the Caught chip is clicked", () => {
    const onFilterChange = jest.fn();
    render(
      <CollectionToolbar
        list="animals"
        filter="all"
        onListChange={() => {}}
        onFilterChange={onFilterChange}
      />
    );
    fireEvent.click(screen.getByRole("tab", { name: /^caught$/i }));
    expect(onFilterChange).toHaveBeenCalledWith("caught");
  });

  it("marks exactly one list chip as aria-selected", () => {
    const { container } = render(
      <CollectionToolbar
        list="pokemon"
        filter="all"
        onListChange={() => {}}
        onFilterChange={() => {}}
      />
    );
    const listChips = container.querySelectorAll('[data-group="list"] [role="tab"]');
    const selected = Array.from(listChips).filter((c) => c.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toMatch(/pokémon/i);
  });

  it("marks exactly one filter chip as aria-selected", () => {
    const { container } = render(
      <CollectionToolbar
        list="animals"
        filter="uncaught"
        onListChange={() => {}}
        onFilterChange={() => {}}
      />
    );
    const filterChips = container.querySelectorAll('[data-group="filter"] [role="tab"]');
    const selected = Array.from(filterChips).filter((c) => c.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toMatch(/uncaught/i);
  });
});
