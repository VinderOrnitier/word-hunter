import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { SettingsTab } from "../../src/popup/tabs/SettingsTab";
import type { GameSettings } from "../../src/shared/types";

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
} {
  const store: Record<string, unknown> = { ...initial };
  const setMock = jest.fn(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });

  (globalThis as unknown as ChromeMock).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: setMock,
        remove: jest.fn(),
      },
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };

  return { store, setMock };
}

describe("SettingsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the DEFAULT_SETTINGS values when no settings are stored", () => {
    setupChromeMock();
    render(<SettingsTab />);

    const [hintInput, hoverInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(hintInput.value).toBe("5");
    expect(hoverInput.value).toBe("1.5");
  });

  it("shows the stored settings values from storage", async () => {
    const stored: GameSettings = { hintDelayMinutes: 10, celebrationHoverSeconds: 3 };
    setupChromeMock({ settings: stored });
    render(<SettingsTab />);

    await waitFor(() => {
      const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
      expect(hintInput.value).toBe("10");
    });

    const [, hoverInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(hoverInput.value).toBe("3");
  });

  it("persists a new hint delay to storage when the input changes", async () => {
    const { setMock } = setupChromeMock();
    render(<SettingsTab />);

    const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hintInput, { target: { value: "15" } });

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({
        settings: { hintDelayMinutes: 15, celebrationHoverSeconds: 1.5 },
      });
    });
  });

  it("persists a new celebration hover duration to storage when the input changes", async () => {
    const { setMock } = setupChromeMock();
    render(<SettingsTab />);

    const [, hoverInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hoverInput, { target: { value: "2.5" } });

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({
        settings: { hintDelayMinutes: 5, celebrationHoverSeconds: 2.5 },
      });
    });
  });

  it("writes finds=[] to storage when 'Clear all hunts' is clicked", async () => {
    const { setMock } = setupChromeMock({ finds: [{ word: "fox" }] });
    render(<SettingsTab />);

    fireEvent.click(await screen.findByRole("button", { name: /clear all hunts/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ finds: [] });
    });
  });
});
