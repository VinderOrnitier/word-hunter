import { fireEvent, render, screen } from "@testing-library/preact";
import { App } from "../../src/popup/App";

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

function setupChromeMock(): void {
  const store: Record<string, unknown> = {};
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
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
}

describe("App shell", () => {
  beforeEach(() => {
    setupChromeMock();
    jest.clearAllMocks();
  });

  it("renders the popup header with the Word Hunter wordmark", () => {
    const { container } = render(<App />);
    const header = container.querySelector("header");
    expect(header?.textContent).toMatch(/word\s*hunter/i);
  });

  it("renders three tab buttons in the navigation (no Rules tab)", () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /statistics/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /settings/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /rules/i })).toBeNull();
  });

  it("shows the Rules panel when the header Rules button is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /rules/i }));
    expect(screen.getByTestId("tab-panel-rules")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-play")).toBeNull();
  });

  it("switches away from Rules when a tab is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /rules/i }));
    fireEvent.click(screen.getByRole("tab", { name: /statistics/i }));
    expect(screen.getByTestId("tab-panel-stats")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-rules")).toBeNull();
  });

  it("shows the Play panel by default", () => {
    render(<App />);
    expect(screen.getByTestId("tab-panel-play")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-stats")).toBeNull();
  });

  it("switches the visible panel when another tab is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /statistics/i }));
    expect(screen.getByTestId("tab-panel-stats")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-panel-play")).toBeNull();
  });

  it("marks the active tab via aria-selected", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));
    expect(screen.getByRole("tab", { name: /settings/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /play/i })).toHaveAttribute("aria-selected", "false");
  });
});
