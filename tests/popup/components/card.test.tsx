import { render, screen } from "@testing-library/preact";
import { Card } from "../../../src/popup/components/Card";

describe("Card", () => {
  it("renders its children inside a wh-card container", () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(container.querySelector(".wh-card")).not.toBeNull();
  });
});
