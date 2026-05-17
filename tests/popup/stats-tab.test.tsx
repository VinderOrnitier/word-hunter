import { render, screen, fireEvent, waitFor, act } from "@testing-library/preact";
import { StatsTab } from "../../src/popup/tabs/StatsTab";
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
        removeListener: jest.Mock;
      };
    };
  };
};

function setupChromeMock(initial: Record<string, unknown> = {}): {
  store: Record<string, unknown>;
  setMock: jest.Mock;
  triggerOnChanged: (changes: Record<string, { newValue?: unknown }>, area: string) => void;
} {
  const store: Record<string, unknown> = { ...initial };
  const listeners: OnChangedCallback[] = [];
  const setMock = jest.fn(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });

  (globalThis as unknown as ChromeMock).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: setMock,
        remove: jest.fn(async (key: string) => {
          delete store[key];
        }),
      },
      onChanged: {
        addListener: jest.fn((cb: OnChangedCallback) => listeners.push(cb)),
        removeListener: jest.fn((cb: OnChangedCallback) => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        }),
      },
    },
  };

  return {
    store,
    setMock,
    triggerOnChanged: (changes, area) => listeners.forEach((cb) => cb(changes, area)),
  };
}

const RECORD_A: HuntRecord = {
  word: "eagle",
  foundAt: Date.now() - 5 * 60_000,
  pageUrl: "https://example.com/a",
  pageTitle: "Example A",
  searchDurationSeconds: 42,
  hintUsed: false,
};

const RECORD_B: HuntRecord = {
  word: "tiger",
  foundAt: Date.now() - 2 * 60_000,
  pageUrl: "https://example.com/b",
  pageTitle: "Example B",
  searchDurationSeconds: 17,
  hintUsed: true,
};

describe("StatsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the editorial empty state when no HuntRecords exist", async () => {
    setupChromeMock();
    const { container } = render(<StatsTab />);
    await waitFor(() => {
      expect(container.querySelector(".wh-editorial")).not.toBeNull();
    });
    expect(screen.getByText(/your hunts will appear here/i)).toBeInTheDocument();
  });

  it("renders one row per HuntRecord, newest first, with the hunt count header", async () => {
    setupChromeMock({ finds: [RECORD_A, RECORD_B] });
    render(<StatsTab />);

    await waitFor(() =>
      expect(screen.getByText(/2 hunts/i)).toBeInTheDocument()
    );

    const rows = document.querySelectorAll(".wh-stats__row");
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain("tiger");
    expect(rows[1].textContent).toContain("eagle");
  });

  it("renders word, duration, hint badge, and page link for each row", async () => {
    setupChromeMock({ finds: [RECORD_A] });
    render(<StatsTab />);

    await waitFor(() =>
      expect(screen.getByText("eagle")).toBeInTheDocument()
    );

    expect(screen.getByText("42s")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /example a/i }) as HTMLAnchorElement;
    expect(link.href).toBe("https://example.com/a");
    expect(link.target).toBe("_blank");
  });

  it("renders the hint badge when hintUsed=true and skips it when false", async () => {
    setupChromeMock({ finds: [RECORD_A, RECORD_B] });
    render(<StatsTab />);

    await waitFor(() => {
      expect(screen.getByText("tiger")).toBeInTheDocument();
    });

    const badges = document.querySelectorAll(".wh-stats__hint--used");
    expect(badges).toHaveLength(1);
  });

  it("shows a confirm overlay after Clear is clicked", async () => {
    setupChromeMock({ finds: [RECORD_A] });
    render(<StatsTab />);

    await waitFor(() => expect(screen.getByText("eagle")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("writes finds=[] to storage when Clear then Yes is clicked", async () => {
    const { setMock } = setupChromeMock({ finds: [RECORD_A] });
    render(<StatsTab />);

    await waitFor(() => expect(screen.getByText("eagle")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ finds: [] });
    });
  });

  it("does not write to storage when Clear then Cancel is clicked", async () => {
    const { setMock } = setupChromeMock({ finds: [RECORD_A] });
    render(<StatsTab />);

    await waitFor(() => expect(screen.getByText("eagle")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(setMock).not.toHaveBeenCalledWith({ finds: [] });
  });

  it("reactively shows a new HuntRecord when storage changes from another context", async () => {
    const { triggerOnChanged } = setupChromeMock();
    render(<StatsTab />);

    await waitFor(() =>
      expect(screen.getByText(/your hunts will appear here/i)).toBeInTheDocument()
    );

    act(() => {
      triggerOnChanged({ finds: { newValue: [RECORD_A] } }, "local");
    });

    await waitFor(() =>
      expect(screen.getByText("eagle")).toBeInTheDocument()
    );
  });
});
