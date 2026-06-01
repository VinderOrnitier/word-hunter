import { render } from "@testing-library/preact";
import { CollectionSlotPdx } from "../../../src/popup/collection/CollectionSlot.pdx";

describe("CollectionSlotPdx", () => {
  it("renders a caught animal emoji with an xN badge", () => {
    const { container, getByText } = render(
      <CollectionSlotPdx
        word="Fox"
        source="animals"
        count={3}
        isActive={false}
        onClick={() => {}}
      />
    );
    expect(container.querySelector(".pdx-slot-v2")).not.toBeNull();
    expect(getByText("x3")).toBeInTheDocument();
  });

  it("renders ??? for an uncaught emoji slot and no badge", () => {
    const { container, getByText } = render(
      <CollectionSlotPdx
        word="Fox"
        source="animals"
        count={0}
        isActive={false}
        onClick={() => {}}
      />
    );
    expect(getByText("???")).toBeInTheDocument();
    expect(container.querySelector(".pdx-slot-v2__count")).toBeNull();
  });

  it("applies is-active and is-pending modifiers", () => {
    const { container } = render(
      <CollectionSlotPdx
        word="Fox"
        source="animals"
        count={1}
        isActive
        isPending
        onClick={() => {}}
      />
    );
    const el = container.querySelector(".pdx-slot-v2");
    expect(el?.classList.contains("is-active")).toBe(true);
    expect(el?.classList.contains("is-pending")).toBe(true);
  });
});
