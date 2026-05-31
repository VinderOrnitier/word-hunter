import { act, fireEvent, render } from "@testing-library/preact";
import { StatsTabPdx } from "../../../src/popup/tabs/StatsTab.pdx";
import { ThemeContext } from "../../../src/popup/theme/ThemeContext";

function setupChromeMock(initial: Record<string, unknown> = {}): void {
  const store: Record<string, unknown> = { ...initial };
  (globalThis as unknown as { chrome: unknown }).chrome = {
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
      onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
    },
  };
}

function renderStats() {
  return render(
    <ThemeContext.Provider value="pokedex">
      <StatsTabPdx />
    </ThemeContext.Provider>
  );
}

const REC = {
  word: "otter",
  foundAt: Date.now(),
  searchDurationSeconds: 12,
  hintUsed: false,
  pageUrl: "https://example.com",
  pageTitle: "Example",
  list: "animals" as const,
};

describe("StatsTabPdx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the LCD empty state when there are no hunts", async () => {
    setupChromeMock({ finds: [] });
    const { container } = renderStats();
    await act(async () => {});
    expect(container.querySelector(".stats-empty")).not.toBeNull();
  });

  it("renders the LCD list with a row per hunt and a CLEAR keycap", async () => {
    setupChromeMock({ finds: [REC] });
    const { container, getByText } = renderStats();
    await act(async () => {});
    expect(container.querySelector(".pdx-popup__body")).not.toBeNull();
    expect(container.querySelector(".stats-list")).not.toBeNull();
    expect(container.querySelectorAll(".stats-row").length).toBe(2); // header + 1 data
    expect(container.querySelector(".pdx-keycap-action")).not.toBeNull();
    expect(getByText("otter")).toBeInTheDocument();
  });

  it("arms a confirm footer when CLEAR is clicked", async () => {
    setupChromeMock({ finds: [REC] });
    const { container } = renderStats();
    await act(async () => {});
    fireEvent.click(container.querySelector(".pdx-keycap-action") as HTMLButtonElement);
    expect(container.querySelector(".pdx-popup__confirm")).not.toBeNull();
  });
});
