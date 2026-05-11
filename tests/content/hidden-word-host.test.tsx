import { render, fireEvent, waitFor } from "@testing-library/preact";
import { HiddenWordHost } from "../../src/content/components/HiddenWordHost";
import type { ActiveWord, HuntRecord } from "../../src/shared/types";

const ACTIVE: ActiveWord = {
  word: "eagle",
  insertedAt: Date.now() - 30_000,
  list: "animals",
};

describe("HiddenWordHost", () => {
  beforeEach(() => {
    document.title = "Test Page";
    sessionStorage.clear();
  });

  it("shows the HiddenWord and no celebration popup initially", () => {
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={() => {}} />
    );
    expect(document.querySelector(".hw-word")).not.toBeNull();
    expect(document.querySelector(".hw-celebration")).toBeNull();
  });

  it("opens the CelebrationPopup and applies the found stripe when the word is clicked", async () => {
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={() => {}} />
    );

    fireEvent.click(document.querySelector(".hw-word") as Element);

    await waitFor(() => {
      expect(document.querySelector(".hw-celebration")).not.toBeNull();
    });
    expect(
      document.querySelector(".hw-word")?.classList.contains("hw-word--found")
    ).toBe(true);
  });

  it("calls onFind with a HuntRecord shaped from the click context", () => {
    const onFind = jest.fn();
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={onFind} />
    );

    fireEvent.click(document.querySelector(".hw-word") as Element);

    expect(onFind).toHaveBeenCalledTimes(1);
    const record = onFind.mock.calls[0][0] as HuntRecord;
    expect(record.word).toBe("eagle");
    expect(record.pageUrl).toBe(window.location.href);
    expect(record.pageTitle).toBe("Test Page");
    expect(record.hintUsed).toBe(false);
    expect(record.searchDurationSeconds).toBeGreaterThanOrEqual(0);
    expect(record.foundAt).toBeLessThanOrEqual(Date.now());
  });

  it("reports hintUsed=true when the hw-hint-used session flag is set", () => {
    sessionStorage.setItem("hw-hint-used", "true");
    const onFind = jest.fn();
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={onFind} />
    );

    fireEvent.click(document.querySelector(".hw-word") as Element);

    expect((onFind.mock.calls[0][0] as HuntRecord).hintUsed).toBe(true);
  });

  it("does not call onFind a second time on a repeated click", () => {
    const onFind = jest.fn();
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={onFind} />
    );

    const word = document.querySelector(".hw-word") as Element;
    fireEvent.click(word);
    fireEvent.click(word);

    expect(onFind).toHaveBeenCalledTimes(1);
  });

  it("dismisses the CelebrationPopup when the backdrop is clicked", async () => {
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={() => {}} />
    );

    fireEvent.click(document.querySelector(".hw-word") as Element);
    await waitFor(() => {
      expect(document.querySelector(".hw-celebration")).not.toBeNull();
    });

    fireEvent.click(document.querySelector(".hw-celebration") as Element);

    await waitFor(() => {
      expect(document.querySelector(".hw-celebration")).toBeNull();
    });
  });
});
