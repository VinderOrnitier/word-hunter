import { fireEvent, render, screen } from "@testing-library/preact";
import { CollectionGrid } from "../../../src/popup/collection/CollectionGrid";
import { WORD_LISTS } from "../../../src/popup/word-lists";

describe("CollectionGrid", () => {
  it("renders one slot per word in the Animals list", () => {
    render(
      <CollectionGrid
        list="animals"
        filter="all"
        counts={new Map()}
        activeWord={null}
        onPick={() => {}}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(WORD_LISTS.animals.length);
  });

  it("renders one slot per Pokémon in the Pokémon list", () => {
    render(
      <CollectionGrid
        list="pokemon"
        filter="all"
        counts={new Map()}
        activeWord={null}
        onPick={() => {}}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(WORD_LISTS.pokemon.length);
  });

  it("renders only caught words when filter is 'caught'", () => {
    const counts = new Map<string, number>([["Fox", 2]]);
    render(
      <CollectionGrid
        list="animals"
        filter="caught"
        counts={counts}
        activeWord={null}
        onPick={() => {}}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute("aria-label")).toMatch(/Fox, caught 2 times/);
  });

  it("renders the uncaught subset when filter is 'uncaught'", () => {
    const counts = new Map<string, number>([["Fox", 2]]);
    render(
      <CollectionGrid
        list="animals"
        filter="uncaught"
        counts={counts}
        activeWord={null}
        onPick={() => {}}
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(WORD_LISTS.animals.length - 1);
    for (const btn of buttons) {
      expect(btn.getAttribute("aria-label")).toMatch(/not caught yet/);
    }
  });

  it("shows the empty-state copy when no slots match the filter", () => {
    render(
      <CollectionGrid
        list="animals"
        filter="caught"
        counts={new Map()}
        activeWord={null}
        onPick={() => {}}
      />
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText(/no caught words yet/i)).toBeInTheDocument();
  });

  it("calls onPick with the exact list-cased word when a slot is clicked", () => {
    const onPick = jest.fn();
    render(
      <CollectionGrid
        list="animals"
        filter="all"
        counts={new Map()}
        activeWord={null}
        onPick={onPick}
      />
    );
    const foxBtn = screen.getByRole("button", { name: /Fox, not caught yet/i });
    fireEvent.click(foxBtn);
    expect(onPick).toHaveBeenCalledWith("Fox");
  });

  it("marks the slot whose word equals activeWord with is-active", () => {
    render(
      <CollectionGrid
        list="animals"
        filter="all"
        counts={new Map()}
        activeWord="Fox"
        onPick={() => {}}
      />
    );
    const foxBtn = screen.getByRole("button", { name: /Fox/ });
    expect(foxBtn).toHaveClass("is-active");
  });
});
