import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { SettingsTabPdx } from "../../../src/popup/tabs/SettingsTab.pdx";
import type { GameSettings } from "../../../src/shared/types";

type ChromeMock = {
  chrome: {
    storage: {
      local: { get: jest.Mock; set: jest.Mock; remove: jest.Mock };
      onChanged: { addListener: jest.Mock; removeListener: jest.Mock };
    };
  };
};

function setupChromeMock(initial: Record<string, unknown> = {}): { setMock: jest.Mock } {
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
      onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
    },
  };
  return { setMock };
}

const STORED: GameSettings = {
  hintDelayMinutes: 3,
  celebrationHoverSeconds: 1.5,
  minWordThreshold: 80,
  autoContinue: false,
  showNextWordPreview: true,
  showReloadHint: true,
  notificationsEnabled: true,
  showAutoModeToast: true,
  showHintToast: true,
  showNoParagraphToast: true,
};

describe("SettingsTabPdx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the body well with the three pdx controls and no footer when clean", () => {
    setupChromeMock();
    const { container } = render(<SettingsTabPdx />);

    expect(container.querySelector(".pdx-popup__body")).toBeTruthy();
    expect(container.querySelector(".pdx-range-mini")).toBeTruthy();
    expect(container.querySelectorAll(".pdx-stepper").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll(".pdx-switch-mini").length).toBeGreaterThanOrEqual(2);
    // clean -> no footer
    expect(container.querySelector(".pdx-popup__footer")).toBeNull();
  });

  it("renders the THEME field as the first settings field with two tiles", () => {
    setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTabPdx />);
    const tiles = container.querySelectorAll(".pdx-theme-tile");
    expect(tiles.length).toBe(2);
    // THEME field is first in the body
    const firstField = container.querySelector(".settings-field");
    expect(firstField?.querySelector(".pdx-theme-tiles")).toBeTruthy();
  });

  it("marks the stored theme's tile active", async () => {
    setupChromeMock({ theme: "pokedex" });
    const { container } = render(<SettingsTabPdx />);
    await waitFor(() => {
      const active = container.querySelector(".pdx-theme-tile.is-active");
      expect(active?.classList.contains("pdx-theme-tile--pokedex")).toBe(true);
    });
  });

  it("writes the theme key when a tile is clicked", async () => {
    const { setMock } = setupChromeMock({ theme: "slate" });
    const { container } = render(<SettingsTabPdx />);
    const pokedexTile = container.querySelector(".pdx-theme-tile--pokedex") as HTMLElement;
    fireEvent.click(pokedexTile);
    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ theme: "pokedex" });
    });
  });

  it("reflects stored minWordThreshold on the slider and chip", async () => {
    setupChromeMock({ settings: STORED });
    const { container } = render(<SettingsTabPdx />);
    await waitFor(() => {
      expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("80");
    });
    expect(container.querySelector(".pdx-range-mini__chip")?.textContent).toBe("80");
  });

  it("renders the language selector with four options in native script", () => {
    setupChromeMock();
    render(<SettingsTabPdx />);
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Українська" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Deutsch" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "日本語" })).toBeInTheDocument();
  });

  it("shows the unsaved-edits footer after a change and hides it after cancel", async () => {
    setupChromeMock();
    const { container } = render(<SettingsTabPdx />);

    fireEvent.click(screen.getByRole("switch", { name: /reload hint/i }));
    await waitFor(() => expect(container.querySelector(".pdx-popup__footer")).toBeTruthy());

    fireEvent.click(container.querySelector(".pdx-btn-ghost") as HTMLButtonElement);
    await waitFor(() => expect(container.querySelector(".pdx-popup__footer")).toBeNull());
  });

  it("Save persists the toggled value to storage", async () => {
    const { setMock } = setupChromeMock();
    const { container } = render(<SettingsTabPdx />);

    fireEvent.click(screen.getByRole("switch", { name: /reload hint/i }));
    fireEvent.click(container.querySelector(".pdx-btn-primary") as HTMLButtonElement);

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({
        settings: expect.objectContaining({ showReloadHint: false }),
      });
    });
  });

  it("disables notification child switches when the master is off", () => {
    setupChromeMock();
    render(<SettingsTabPdx />);
    fireEvent.click(screen.getByRole("switch", { name: /in-page notifications/i }));
    expect(screen.getByRole("switch", { name: /auto-continue started/i })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /hint reminder/i })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /no paragraphs/i })).toBeDisabled();
  });
});
