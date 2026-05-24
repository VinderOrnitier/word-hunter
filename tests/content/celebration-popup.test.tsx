import { fireEvent, render } from "@testing-library/preact";
import { CelebrationPopup } from "../../src/content/components/CelebrationPopup";

describe("CelebrationPopup", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(
      <CelebrationPopup
        visible={false}
        locale="en"
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
        locale="en"
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={() => {}}
      />
    );
    const popup = document.querySelector(".hw-celebration");
    expect(popup).not.toBeNull();
    expect(popup?.textContent).toContain("eagle");
    expect(popup?.textContent).toContain("42s");
    expect(popup?.textContent?.toLowerCase()).toContain("no hint");
  });

  it("shows 'hint used' when hintUsed=true", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="eagle"
        durationS={42}
        hintUsed={true}
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration")?.textContent?.toLowerCase()).toContain(
      "hint used"
    );
  });

  it("renders localized strings when locale='uk'", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="uk"
        word="eagle"
        durationS={10}
        hintUsed={true}
        onDismiss={() => {}}
      />
    );
    const text = document.querySelector(".hw-celebration")?.textContent ?? "";
    expect(text).toContain("Знайдено!");
    expect(text).toContain("підказка використана");
  });

  it("renders the art slot when provided", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
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
        locale="en"
        word="eagle"
        durationS={42}
        hintUsed={false}
        onDismiss={handler}
      />
    );
    fireEvent.click(document.querySelector(".hw-celebration__dismiss") as Element);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders an img element with the pokemon art URL when art is an https URL", () => {
    const pokemonUrl =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png";
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="bulbasaur"
        durationS={5}
        hintUsed={false}
        art={pokemonUrl}
        onDismiss={() => {}}
      />
    );
    const img = document.querySelector(".hw-celebration__art-img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe(pokemonUrl);
  });

  it("does not invoke onDismiss when the modal body is clicked", () => {
    const handler = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
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
        locale="en"
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
        locale="en"
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={() => {}}
        onClear={() => {}}
      />
    );
    const btn = document.querySelector(".hw-celebration__clear-btn");
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toBe("Remove word");
  });

  it("calls onClear when the clear button is clicked", () => {
    const onClear = jest.fn();
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
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
        locale="en"
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

  it("does not render a next-up section when 'next' prop is omitted", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="eagle"
        durationS={5}
        hintUsed={false}
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration__next")).toBeNull();
  });

  it("renders a next-up section showing the upcoming word when 'next' prop is provided", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="eagle"
        durationS={5}
        hintUsed={false}
        next={{ word: "capybara" }}
        onDismiss={() => {}}
      />
    );
    const next = document.querySelector(".hw-celebration__next");
    expect(next).not.toBeNull();
    expect(next?.textContent).toContain("capybara");
  });

  it("renders the next word art (emoji) when provided in 'next' prop", () => {
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="eagle"
        durationS={5}
        hintUsed={false}
        next={{ word: "otter", art: "🦦" }}
        onDismiss={() => {}}
      />
    );
    expect(document.querySelector(".hw-celebration__next-art")?.textContent).toBe("🦦");
  });

  it("renders the next word art as an img when art is a URL", () => {
    const url = "https://example.com/sprite.png";
    render(
      <CelebrationPopup
        visible={true}
        locale="en"
        word="eagle"
        durationS={5}
        hintUsed={false}
        next={{ word: "pikachu", art: url }}
        onDismiss={() => {}}
      />
    );
    const img = document.querySelector(".hw-celebration__next-art-img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe(url);
  });
});
