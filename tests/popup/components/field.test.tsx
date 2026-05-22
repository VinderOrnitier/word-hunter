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
    expect(screen.getByText("overrides the list selection")).toBeInTheDocument();
  });

  it("does not render a helper element when helper is omitted", () => {
    const { container } = render(
      <Field label="Word">
        <input />
      </Field>
    );
    expect(container.querySelector(".wh-field__helper")).toBeNull();
  });

  it("renders a counter in the label row when counter prop is provided", () => {
    const { container } = render(
      <Field label="Custom word" helper="overrides" counter="6 / 25">
        <input />
      </Field>
    );
    expect(container.querySelector(".wh-field__counter")).toHaveTextContent("6 / 25");
  });

  it("applies wh-field__counter--error class on the counter when error is set", () => {
    const { container } = render(
      <Field label="Custom word" helper="overrides" counter="26 / 25" error="Max 25 characters">
        <input />
      </Field>
    );
    expect(container.querySelector(".wh-field__counter")).toHaveClass("wh-field__counter--error");
  });

  it("shows error text instead of helper text when error prop is set", () => {
    render(
      <Field
        label="Custom word"
        helper="overrides the list selection"
        error="Letters and hyphens only"
      >
        <input />
      </Field>
    );
    expect(screen.getByText("Letters and hyphens only")).toBeInTheDocument();
    expect(screen.queryByText("overrides the list selection")).not.toBeInTheDocument();
  });
});
