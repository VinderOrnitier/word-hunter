import { render } from "@testing-library/preact";
import { NoParagraphBanner } from "../../src/content/components/NoParagraphBanner";

describe("NoParagraphBanner", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(<NoParagraphBanner visible={false} />);
    expect(container.querySelector(".hw-no-paragraph")).toBeNull();
  });

  it("renders the explanation message at top-center when visible=true", () => {
    render(<NoParagraphBanner visible={true} />);
    const banner = document.querySelector(".hw-no-paragraph");
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toBe(
      "No long text found on this page — word not hidden"
    );
  });
});
