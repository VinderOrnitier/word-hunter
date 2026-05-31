import { fireEvent, render } from "@testing-library/preact";
import { InPageToastPdx } from "../../src/content/components/InPageToast.pdx";

beforeAll(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: { sendMessage: jest.fn(), getURL: (p: string) => p },
  };
});

describe("InPageToastPdx", () => {
  it("renders the variant class, lens, message and close — no find key without onFind", () => {
    const { container } = render(
      <InPageToastPdx
        message="THE WORD IS ON THIS PAGE"
        locale="en"
        variant="hint"
        onClose={() => {}}
      />
    );
    expect(container.querySelector(".pdx-toast--hint")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__lens")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__msg")?.textContent).toContain(
      "THE WORD IS ON THIS PAGE"
    );
    expect(container.querySelector(".pdx-toast__close")).toBeTruthy();
    expect(container.querySelector(".pdx-toast__find")).toBeNull();
  });

  it("renders a find pixel-key when onFind is provided and fires it", () => {
    const onFind = jest.fn();
    const { container } = render(
      <InPageToastPdx message="x" locale="en" variant="hint" onClose={() => {}} onFind={onFind} />
    );
    const find = container.querySelector(".pdx-toast__find") as HTMLButtonElement;
    expect(find).toBeTruthy();
    fireEvent.click(find);
    expect(onFind).toHaveBeenCalledTimes(1);
  });

  it("fires onClose from the close key", () => {
    const onClose = jest.fn();
    const { container } = render(
      <InPageToastPdx message="x" locale="en" variant="info" onClose={onClose} />
    );
    fireEvent.click(container.querySelector(".pdx-toast__close") as HTMLButtonElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
