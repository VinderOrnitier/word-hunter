import { render, screen } from "@testing-library/preact";
import { Field } from "../../../src/popup/components/Field";

describe("Field", () => {
  it("renders the label, the child input, and an optional helper", () => {
    render(
      <Field label="Word list" helper="overrides the list selection">
        <input data-testid="inner" />
      </Field>
    );
    expect(screen.getByText("Word list")).toBeInTheDocument();
    expect(screen.getByTestId("inner")).toBeInTheDocument();
    expect(
      screen.getByText("overrides the list selection")
    ).toBeInTheDocument();
  });

  it("does not render a helper element when helper is omitted", () => {
    const { container } = render(
      <Field label="Word">
        <input />
      </Field>
    );
    expect(container.querySelector(".wh-field__helper")).toBeNull();
  });
});
