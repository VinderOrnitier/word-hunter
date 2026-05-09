import { RulesTab } from "../../src/popup/rules-tab";

describe("RulesTab", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders tab container", async () => {
    const tab = new RulesTab(container);
    await tab.init();
    expect(container.querySelector("[data-testid='rules-tab']")).not.toBeNull();
  });

  it("explains the 50-word minimum rule", async () => {
    const tab = new RulesTab(container);
    await tab.init();
    expect(container.textContent).toMatch(/50/);
  });

  it("mentions the notification on short pages", async () => {
    const tab = new RulesTab(container);
    await tab.init();
    expect(container.textContent?.toLowerCase()).toMatch(/notif/);
  });

  it("uses player-facing language without technical jargon", async () => {
    const tab = new RulesTab(container);
    await tab.init();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\bDOM\b/);
    expect(text).not.toMatch(/\belement\b/i);
    expect(text).not.toMatch(/\bnode\b/i);
  });
});
