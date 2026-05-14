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

  it("shows the HiddenWord initially", () => {
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={() => {}} />
    );
    expect(document.querySelector(".hw-word")).not.toBeNull();
  });

  it("applies the found stripe when the word is clicked", () => {
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={() => {}} />
    );
    fireEvent.click(document.querySelector(".hw-word") as Element);
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

  it("searchDurationSeconds is 0 when insertedAt is missing (defensive)", () => {
    const wordWithoutTimestamp = { word: "eagle", list: "animals" } as ActiveWord;
    const onFind = jest.fn();
    render(<HiddenWordHost activeWord={wordWithoutTimestamp} onFind={onFind} />);
    fireEvent.click(document.querySelector(".hw-word") as Element);
    expect((onFind.mock.calls[0][0] as HuntRecord).searchDurationSeconds).toBe(0);
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

  it("calls onReview on re-click with the same record that was passed to onFind", () => {
    const onFind = jest.fn();
    const onReview = jest.fn();
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={onFind} onReview={onReview} />
    );

    const word = document.querySelector(".hw-word") as Element;
    fireEvent.click(word);
    fireEvent.click(word);

    expect(onFind).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview.mock.calls[0][0]).toEqual(onFind.mock.calls[0][0]);
  });

  it("does not call onReview on the first click", () => {
    const onReview = jest.fn();
    render(
      <HiddenWordHost activeWord={ACTIVE} onFind={jest.fn()} onReview={onReview} />
    );

    fireEvent.click(document.querySelector(".hw-word") as Element);

    expect(onReview).not.toHaveBeenCalled();
  });

});
