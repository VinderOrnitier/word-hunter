import { render, screen, fireEvent } from "@testing-library/preact";
import { CollectionSlot } from "../../../src/popup/collection/CollectionSlot";

describe("CollectionSlot", () => {
  it("renders the placeholder for an uncaught Animals slot", () => {
    render(
      <CollectionSlot word="Fox" source="animals" count={0} isActive={false} onClick={() => {}} />
    );
    const slot = screen.getByRole("button", { name: /Fox, not caught yet/i });
    expect(slot).toHaveClass("wh-slot");
    expect(slot).toHaveClass("is-uncaught");
    expect(slot.textContent).toContain("???");
  });

  it("renders the emoji and count for a caught Animals slot", () => {
    render(
      <CollectionSlot word="Fox" source="animals" count={3} isActive={false} onClick={() => {}} />
    );
    const slot = screen.getByRole("button", { name: /Fox, caught 3 times/i });
    expect(slot).toHaveClass("is-caught");
    expect(slot.textContent).toContain("🦊");
    expect(slot.textContent).toContain("×3");
  });

  it("uses singular 'time' for a count of one", () => {
    render(
      <CollectionSlot word="Cat" source="animals" count={1} isActive={false} onClick={() => {}} />
    );
    expect(screen.getByRole("button", { name: /Cat, caught 1 time$/i })).toBeInTheDocument();
  });

  it("renders a lazy <img> with the showdown sprite URL for caught Pokémon", () => {
    render(
      <CollectionSlot word="Pikachu" source="pokemon" count={2} isActive={false} onClick={() => {}} />
    );
    const img = screen.getByRole("button").querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("loading")).toBe("lazy");
    expect(img!.getAttribute("src")).toContain("PokeAPI/sprites");
    expect(img).not.toHaveClass("wh-slot__silhouette");
  });

  it("applies the silhouette class to uncaught Pokémon sprites", () => {
    render(
      <CollectionSlot word="Pikachu" source="pokemon" count={0} isActive={false} onClick={() => {}} />
    );
    const img = screen.getByRole("button").querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveClass("wh-slot__silhouette");
  });

  it("adds the is-active class when isActive is true", () => {
    render(
      <CollectionSlot word="Fox" source="animals" count={1} isActive={true} onClick={() => {}} />
    );
    expect(screen.getByRole("button")).toHaveClass("is-active");
  });

  it("calls onClick when the slot is clicked", () => {
    const onClick = jest.fn();
    render(
      <CollectionSlot word="Fox" source="animals" count={1} isActive={false} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
