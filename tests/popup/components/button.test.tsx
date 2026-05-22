import { fireEvent, render, screen } from "@testing-library/preact";
import { Button } from "../../../src/popup/components/Button";

describe("Button", () => {
  it("renders its children and is interactive by default", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>New word</Button>);
    const btn = screen.getByRole("button", { name: "New word" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} disabled>
        New word
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies a variant class for the given variant", () => {
    const { container } = render(<Button variant="danger">Clear</Button>);
    const btn = container.querySelector("button");
    expect(btn).toHaveClass("wh-btn--danger");
  });

  it("applies a size class for the given size", () => {
    const { container } = render(<Button size="lg">Big</Button>);
    expect(container.querySelector("button")).toHaveClass("wh-btn--lg");
  });

  it("renders a left icon when leftIcon is provided", () => {
    const { container } = render(<Button leftIcon="refresh">New word</Button>);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
