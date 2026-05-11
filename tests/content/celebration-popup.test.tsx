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
});
