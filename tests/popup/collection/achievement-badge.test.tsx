import { render, screen } from "@testing-library/preact";
import { AchievementBadge } from "../../../src/popup/collection/AchievementBadge";

describe("AchievementBadge", () => {
  it("renders the achievement label", () => {
    render(
      <AchievementBadge
        achievement={{ id: "first-catch", label: "First catch", unlocked: true }}
      />
    );
    expect(screen.getByText("First catch")).toBeInTheDocument();
  });

  it("applies the is-locked class for locked achievements", () => {
    const { container } = render(
      <AchievementBadge
        achievement={{ id: "half-way", label: "Half-way", unlocked: false, hint: "Catch 25 more" }}
      />
    );
    expect(container.firstElementChild).toHaveClass("is-locked");
  });

  it("does not apply is-locked when unlocked", () => {
    const { container } = render(
      <AchievementBadge
        achievement={{ id: "first-catch", label: "First catch", unlocked: true }}
      />
    );
    expect(container.firstElementChild).not.toHaveClass("is-locked");
  });

  it("exposes the hint as a tooltip (title attribute) when locked", () => {
    const { container } = render(
      <AchievementBadge
        achievement={{ id: "half-way", label: "Half-way", unlocked: false, hint: "Catch 25 more" }}
      />
    );
    expect(container.firstElementChild?.getAttribute("title")).toBe("Catch 25 more");
  });
});
