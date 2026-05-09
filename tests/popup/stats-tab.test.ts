import { StatsTab } from "../../src/popup/stats-tab";
import type { HuntRecord } from "../../src/shared/types";

type OnChangedCallback = (
  changes: Record<string, { newValue?: unknown }>,
  area: string
) => void;

type ChromeMock = {
  chrome: {
    storage: {
      local: {
        get: jest.Mock;
        set: jest.Mock;
        remove: jest.Mock;
      };
      onChanged: {
        addListener: jest.Mock;
      };
    };
  };
};

function setupChromeMock(): {
  store: Record<string, unknown>;
  triggerOnChanged: (changes: Record<string, { newValue?: unknown }>, area: string) => void;
} {
  const store: Record<string, unknown> = {};
  let onChangedCallback: OnChangedCallback | null = null;

  (globalThis as unknown as ChromeMock).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
      onChanged: {
        addListener: jest.fn((cb: OnChangedCallback) => {
          onChangedCallback = cb;
        }),
      },
    },
  };

  return {
    store,
    triggerOnChanged: (changes, area) => onChangedCallback?.(changes, area),
  };
}

const RECORD_A: HuntRecord = {
  word: "eagle",
  foundAt: 1000,
  pageUrl: "https://example.com/a",
  pageTitle: "Example A",
  searchDurationSeconds: 42,
  hintUsed: false,
};

const RECORD_B: HuntRecord = {
  word: "tiger",
  foundAt: 2000,
  pageUrl: "https://example.com/b",
  pageTitle: "Example B",
  searchDurationSeconds: 17,
  hintUsed: true,
};

describe("StatsTab", () => {
  let container: HTMLElement;
  let store: Record<string, unknown>;
  let triggerOnChanged: (changes: Record<string, { newValue?: unknown }>, area: string) => void;

  beforeEach(() => {
    container = document.createElement("div");
    ({ store, triggerOnChanged } = setupChromeMock());
    jest.clearAllMocks();
  });

  it("shows empty state when no HuntRecords exist", async () => {
    const tab = new StatsTab(container);
    await tab.init();
    expect(container.querySelector("[data-testid='empty-state']")).not.toBeNull();
  });

  it("renders a row for each HuntRecord", async () => {
    store.finds = [RECORD_A, RECORD_B];
    const tab = new StatsTab(container);
    await tab.init();
    const rows = container.querySelectorAll("[data-testid='stats-row']");
    expect(rows.length).toBe(2);
  });

  it("displays records newest-first", async () => {
    store.finds = [RECORD_A, RECORD_B];
    const tab = new StatsTab(container);
    await tab.init();
    const rows = container.querySelectorAll("[data-testid='stats-row']");
    expect(rows[0].textContent).toContain("tiger");
    expect(rows[1].textContent).toContain("eagle");
  });

  it("each row shows word, duration, hintUsed and page link", async () => {
    store.finds = [RECORD_A];
    const tab = new StatsTab(container);
    await tab.init();
    const row = container.querySelector("[data-testid='stats-row']")!;
    expect(row.textContent).toContain("eagle");
    expect(row.textContent).toContain("42");
    expect(row.textContent).toContain("No");
    const link = row.querySelector("a") as HTMLAnchorElement;
    expect(link.href).toBe("https://example.com/a");
    expect(link.target).toBe("_blank");
    expect(link.textContent).toContain("Example A");
  });

  it("shows hint used as 'Yes' when hintUsed is true", async () => {
    store.finds = [RECORD_B];
    const tab = new StatsTab(container);
    await tab.init();
    const row = container.querySelector("[data-testid='stats-row']")!;
    expect(row.textContent).toContain("Yes");
  });

  it("re-renders when a new HuntRecord is written to storage", async () => {
    const tab = new StatsTab(container);
    await tab.init();
    expect(container.querySelector("[data-testid='empty-state']")).not.toBeNull();

    triggerOnChanged({ finds: { newValue: [RECORD_A] } }, "local");

    const rows = container.querySelectorAll("[data-testid='stats-row']");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("eagle");
  });
});
