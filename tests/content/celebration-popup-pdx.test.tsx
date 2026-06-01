import { fireEvent, render } from "@testing-library/preact";
import { CelebrationPopupPdx } from "../../src/content/components/CelebrationPopup.pdx";

beforeAll(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { getURL: (p: string) => p },
  };
});

const base = {
  visible: true as const,
  locale: "en" as const,
  word: "otter",
  durationS: 12,
  hintUsed: false,
};

describe("CelebrationPopupPdx", () => {
  it("returns null when not visible", () => {
    const { container } = render(
      <CelebrationPopupPdx {...base} visible={false} onDismiss={() => {}} />
    );
    expect(container.querySelector(".pdx-celebration")).toBeNull();
  });

  it("renders the device with word + duration and a green found LED", () => {
    const { container } = render(<CelebrationPopupPdx {...base} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-celebration")).toBeTruthy();
    expect(container.querySelector(".pdx-celebration__word")?.textContent).toBe("otter");
    expect(container.querySelector(".pdx-celebration__leds .led--green")).toBeTruthy();
    expect(container.querySelector(".pdx-celebration__found")).toBeTruthy();
  });

  it("shows the next-up pill only when next is provided", () => {
    const { container, rerender } = render(<CelebrationPopupPdx {...base} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-next")).toBeNull();
    rerender(<CelebrationPopupPdx {...base} next={{ word: "eevee" }} onDismiss={() => {}} />);
    expect(container.querySelector(".pdx-next__word")?.textContent).toBe("eevee");
  });

  it("shows the remove-word CTA only when onClear is provided and fires it", () => {
    const onClear = jest.fn();
    const { container } = render(
      <CelebrationPopupPdx {...base} onClear={onClear} onDismiss={() => {}} />
    );
    const cta = container.querySelector(".pdx-celebration__cta") as HTMLButtonElement;
    expect(cta).toBeTruthy();
    fireEvent.click(cta);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("dismisses when the scrim backdrop is clicked", () => {
    const onDismiss = jest.fn();
    const { container } = render(<CelebrationPopupPdx {...base} onDismiss={onDismiss} />);
    fireEvent.click(container.querySelector(".pdx-celebration__dismiss") as HTMLElement);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
