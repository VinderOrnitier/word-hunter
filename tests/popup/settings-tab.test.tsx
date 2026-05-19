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
    expect(hintInput.value).toBe("3");
    expect(hoverInput.value).toBe("1.5");
  });

  it("shows the stored settings values from storage", async () => {
    const stored: GameSettings = { hintDelayMinutes: 10, celebrationHoverSeconds: 3, minWordThreshold: 30, autoContinue: false, showNextWordPreview: true };
    setupChromeMock({ settings: stored });
    render(<SettingsTab />);

    await waitFor(() => {
      const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
      expect(hintInput.value).toBe("10");
    });

    const [, hoverInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    expect(hoverInput.value).toBe("3");
  });

  it("renders a range slider for minimum paragraph length with default value 30", () => {
    setupChromeMock();
    render(<SettingsTab />);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("30");
    expect(slider.min).toBe("30");
    expect(slider.max).toBe("150");
    expect(slider.step).toBe("10");
  });

  it("displays the current minWordThreshold value next to the slider", async () => {
    const stored: GameSettings = { hintDelayMinutes: 3, celebrationHoverSeconds: 1.5, minWordThreshold: 80, autoContinue: false, showNextWordPreview: true };
    setupChromeMock({ settings: stored });
    render(<SettingsTab />);

    await waitFor(() => {
      const slider = screen.getByRole("slider") as HTMLInputElement;
      expect(slider.value).toBe("80");
    });
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("does not show a Save button when no settings have been changed", () => {
    setupChromeMock();
    render(<SettingsTab />);

    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("shows Save and Cancel buttons after a setting is changed", () => {
    setupChromeMock();
    render(<SettingsTab />);

    const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hintInput, { target: { value: "10" } });

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("Cancel reverts the input value and hides the Save button", () => {
    setupChromeMock();
    render(<SettingsTab />);

    const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hintInput, { target: { value: "10" } });
    expect((hintInput as HTMLInputElement).value).toBe("10");

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect((hintInput as HTMLInputElement).value).toBe("3");
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("Save writes all draft values to storage", async () => {
    const { setMock } = setupChromeMock();
    render(<SettingsTab />);

    const [hintInput, hoverInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hintInput, { target: { value: "8" } });
    fireEvent.input(hoverInput, { target: { value: "2" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({
        settings: { hintDelayMinutes: 8, celebrationHoverSeconds: 2, minWordThreshold: 30, autoContinue: false, showNextWordPreview: true },
      });
    });
  });

  it("Save button disappears after saving", async () => {
    setupChromeMock();
    render(<SettingsTab />);

    const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
    fireEvent.input(hintInput, { target: { value: "8" } });
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    });
  });

  it("does not show Save button after settings load from storage", async () => {
    const stored: GameSettings = { hintDelayMinutes: 10, celebrationHoverSeconds: 3, minWordThreshold: 50, autoContinue: false, showNextWordPreview: true };
    setupChromeMock({ settings: stored });
    render(<SettingsTab />);

    await waitFor(() => {
      const [hintInput] = screen.getAllByRole("spinbutton") as HTMLInputElement[];
      expect(hintInput.value).toBe("10");
    });

    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  describe("Next-word preview toggle", () => {
    it("renders the 'Show next word preview' switch in the on state by default", () => {
      setupChromeMock();
      render(<SettingsTab />);
      const toggle = screen.getByRole("switch", { name: /next word preview/i });
      expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("reflects showNextWordPreview=false from stored settings", async () => {
      const stored: GameSettings = {
        hintDelayMinutes: 3,
        celebrationHoverSeconds: 1.5,
        minWordThreshold: 30,
        autoContinue: false,
        showNextWordPreview: false,
      };
      setupChromeMock({ settings: stored });
      render(<SettingsTab />);
      await waitFor(() => {
        expect(screen.getByRole("switch", { name: /next word preview/i })).toHaveAttribute("aria-checked", "false");
      });
    });

    it("clicking the toggle dirties the form, requiring Save to persist", async () => {
      setupChromeMock();
      render(<SettingsTab />);
      fireEvent.click(screen.getByRole("switch", { name: /next word preview/i }));
      expect(screen.getByRole("switch", { name: /next word preview/i })).toHaveAttribute("aria-checked", "false");
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });

    it("Save persists showNextWordPreview=false to storage after toggling off", async () => {
      const { setMock } = setupChromeMock();
      render(<SettingsTab />);
      fireEvent.click(screen.getByRole("switch", { name: /next word preview/i }));
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith({
          settings: expect.objectContaining({ showNextWordPreview: false }),
        });
      });
    });
  });

});
