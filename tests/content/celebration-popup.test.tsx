import { render, fireEvent } from "@testing-library/preact";
import { CelebrationPopup } from "../../src/content/components/CelebrationPopup";

describe("CelebrationPopup", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(
      <CelebrationPopup
        visible={false}
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={() => {}}
      />
    );
    expect(container.querySelector(".hw-celebration")).toBeNull();
  });

  it("shows the word, duration, and 'no hint' status when visible=true", () => {
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={() => {}}
      />
    );
    const popup = document.querySelector(".hw-celebration");
    expect(popup).not.toBeNull();
    expect(popup!.textContent).toContain("eagle");
    expect(popup!.textContent).toContain("42s");
    expect(popup!.textContent?.toLowerCase()).toContain("no hint");
  });

  it("shows 'hint used' when hintUsed=true", () => {
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={42}
        hintUsed={true}
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration")!.textContent?.toLowerCase())
      .toContain("hint used");
  });

  it("renders the art slot when provided", () => {
    render(
      <CelebrationPopup
        visible={true}
        word="otter"
        durationS={12}
        hintUsed={false}
        art="🦦"
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration__art")?.textContent).toBe("🦦");
  });

  it("invokes onDismiss when the overlay backdrop is clicked", () => {
    const handler = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={handler}
      />
    );
    fireEvent.click(document.querySelector(".hw-celebration") as Element);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders an img element with the pokemon art URL when art is an https URL", () => {
    const pokemonUrl =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png";
    render(
      <CelebrationPopup
        visible={true}
        word="bulbasaur"
        durationS={5}
        hintUsed={false}
        art={pokemonUrl}
        onDismiss={() => {}}
      />
    );
    const img = document.querySelector(
      ".hw-celebration__art-img"
    ) as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe(pokemonUrl);
  });

  it("does not invoke onDismiss when the modal body is clicked", () => {
    const handler = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={handler}
      />
    );
    fireEvent.click(document.querySelector(".hw-celebration__modal") as Element);
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not render a clear button when onClear is not provided", () => {
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration__clear-btn")).toBeNull();
  });

  it("renders a 'Remove word' button when onClear is provided", () => {
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={() => {}}
        onClear={() => {}}
      />
    );
    const btn = document.querySelector(".hw-celebration__clear-btn");
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toBe("Remove word");
  });

  it("calls onClear when the clear button is clicked", () => {
    const onClear = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={() => {}}
        onClear={onClear}
      />
    );
    fireEvent.click(document.querySelector(".hw-celebration__clear-btn") as Element);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss when the clear button is clicked", () => {
    const onDismiss = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={onDismiss}
        onClear={() => {}}
      />
    );
    fireEvent.click(document.querySelector(".hw-celebration__clear-btn") as Element);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
