import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { PlayTab } from "../../src/popup/tabs/PlayTab";
import { WORD_LISTS } from "../../src/popup/word-lists";
import type { ActiveWord } from "../../src/shared/types";

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
    tabs: {
      query: jest.Mock;
    };
    scripting: {
      executeScript: jest.Mock;
    };
  };
};

function setupChromeMock(initial: Record<string, unknown> = {}): {
  store: Record<string, unknown>;
  setMock: jest.Mock;
  executeScriptMock: jest.Mock;
} {
  const store: Record<string, unknown> = { ...initial };
  const setMock = jest.fn(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });
  const executeScriptMock = jest.fn();

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
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    tabs: {
      query: jest.fn((_q: unknown, cb: (tabs: { id: number }[]) => void) => cb([{ id: 42 }])),
    },
    scripting: {
      executeScript: executeScriptMock,
    },
  };

  return { store, setMock, executeScriptMock };
}

describe("PlayTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("selectedList persistence", () => {
    it("defaults to the Animals grid when nothing is stored", () => {
      setupChromeMock();
      render(<PlayTab />);

      expect(screen.getByRole("tab", { name: /animals/i })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: /pokémon/i })).toHaveAttribute("aria-selected", "false");
    });

    it("restores the Pokémon grid when selectedList:'pokemon' is stored", async () => {
      setupChromeMock({ selectedList: "pokemon" });
      render(<PlayTab />);

      await waitFor(() =>
        expect(screen.getByRole("tab", { name: /pokémon/i })).toHaveAttribute("aria-selected", "true"),
      );
      expect(screen.getByRole("button", { name: /Pikachu, not caught yet/i })).toBeInTheDocument();
    });

    it("writes selectedList to storage when the Pokémon chip is clicked", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("tab", { name: /pokémon/i }));

      await waitFor(() =>
        expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ selectedList: "pokemon" })),
      );
    });
  });

  it("shows the 'no active word' placeholder when none is stored", () => {
    setupChromeMock();
    render(<PlayTab />);
    expect(screen.getByText(/no active word/i)).toBeInTheDocument();
  });

  it("shows the current ActiveWord after it loads from storage", async () => {
    const active: ActiveWord = {
      word: "Eagle",
      list: "animals",
      insertedAt: 1000,
    };
    setupChromeMock({ activeWord: active });
    render(<PlayTab />);
    await waitFor(() => expect(screen.getByText("Eagle")).toBeInTheDocument());
  });

  it("swaps the collection grid when the list chip changes to Pokémon", () => {
    setupChromeMock();
    render(<PlayTab />);

    expect(screen.getByRole("button", { name: /Fox, not caught yet/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /pokémon/i }));

    expect(screen.queryByRole("button", { name: /Fox, not caught yet/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Pikachu, not caught yet/i })).toBeInTheDocument();
  });

  it("clicking a CollectionSlot does NOT write activeWord to storage immediately", async () => {
    const { setMock } = setupChromeMock();
    render(<PlayTab />);

    fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));

    await new Promise((r) => setTimeout(r, 50));
    expect(setMock).not.toHaveBeenCalled();
  });

  it("marks the currently-active word's slot with the is-active class", async () => {
    setupChromeMock({
      activeWord: { word: "Fox", list: "animals", insertedAt: 1000 },
    });
    render(<PlayTab />);

    await waitFor(() => {
      const foxSlot = screen.getByRole("button", { name: /^Fox/ });
      expect(foxSlot).toHaveClass("is-active");
    });
  });

  it("shows a caught Fox slot when finds contain a Fox record", async () => {
    setupChromeMock({
      finds: [
        {
          word: "Fox",
          foundAt: Date.now(),
          pageUrl: "https://example.com",
          pageTitle: "Example",
          searchDurationSeconds: 10,
          hintUsed: false,
          list: "animals",
        },
      ],
    });
    render(<PlayTab />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Fox, caught 1 time$/i })).toBeInTheDocument();
    });
  });

  it("clears the ActiveWord when the active-word card's stop button is clicked", async () => {
    const active: ActiveWord = {
      word: "Fox",
      list: "animals",
      insertedAt: 1000,
    };
    const { setMock } = setupChromeMock({ activeWord: active });
    render(<PlayTab />);

    await waitFor(() => expect(screen.getByText("Fox")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /clear active word/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ activeWord: null }),
      );
    });
  });

  describe("Start a hunt action bar", () => {
    it("clicking a slot marks it with is-pending class", () => {
      setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));

      expect(screen.getByRole("button", { name: /^Fox/ })).toHaveClass("is-pending");
    });

    it("'Start a hunt' is disabled when no slot is selected", () => {
      setupChromeMock();
      render(<PlayTab />);

      expect(screen.getByRole("button", { name: /start a hunt/i })).toBeDisabled();
    });

    it("'Start a hunt' confirms the pending slot and writes to storage", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ word: "Fox", list: "animals" }),
          }),
        );
      });
    });

    it("'Start a hunt' clears the pending state after confirming", async () => {
      setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Fox/ })).not.toHaveClass("is-pending");
      });
    });

    it("shuffle sets a pending word without writing to storage", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /pick a random word/i }));

      await new Promise((r) => setTimeout(r, 50));
      expect(setMock).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: /start a hunt/i })).not.toBeDisabled();
    });

    it("confirming shuffle via 'Start a hunt' writes a word from the active list", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /pick a random word/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ list: "animals" }),
          }),
        );
      });
      const call = setMock.mock.calls[0]?.[0] as { activeWord: ActiveWord };
      expect(WORD_LISTS.animals).toContain(call.activeWord.word);
    });

    it("clicking a slot while a hunt is active updates the pending word", async () => {
      setupChromeMock({
        activeWord: { word: "Eagle", list: "animals", insertedAt: 1000 },
      });
      render(<PlayTab />);

      await waitFor(() => expect(screen.getByText("Eagle")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));

      expect(screen.getByRole("button", { name: /^Fox/ })).toHaveClass("is-pending");
    });

    it("confirming a new word while a hunt is active replaces the activeWord", async () => {
      const { setMock } = setupChromeMock({
        activeWord: { word: "Eagle", list: "animals", insertedAt: 1000 },
      });
      render(<PlayTab />);

      await waitFor(() => expect(screen.getByText("Eagle")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ word: "Fox" }),
          }),
        );
      });
    });
  });

  describe("Custom word modal", () => {
    it("does not render the modal by default", () => {
      setupChromeMock();
      render(<PlayTab />);
      expect(screen.queryByPlaceholderText(/serendipity/i)).toBeNull();
    });

    it("opens the modal when the custom-word icon button is pressed", () => {
      setupChromeMock();
      render(<PlayTab />);
      fireEvent.click(screen.getByRole("button", { name: /custom word/i }));
      expect(screen.getByPlaceholderText(/serendipity/i)).toBeInTheDocument();
    });

    it("writes a custom word with list='custom' on submit and closes the modal", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /custom word/i }));
      const input = screen.getByPlaceholderText(/serendipity/i);
      fireEvent.input(input, { target: { value: "unicorn" } });
      fireEvent.click(screen.getByRole("button", { name: /start hunt/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ word: "unicorn", list: "custom" }),
          }),
        );
      });
      expect(screen.queryByPlaceholderText(/serendipity/i)).toBeNull();
    });

    it("does not write to storage for an invalid custom word", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /custom word/i }));
      const input = screen.getByPlaceholderText(/serendipity/i);
      fireEvent.input(input, { target: { value: "bad!" } });
      fireEvent.click(screen.getByRole("button", { name: /start hunt/i }));

      await new Promise((r) => setTimeout(r, 50));
      expect(setMock).not.toHaveBeenCalled();
    });
  });

  describe("Auto-Continue toggle", () => {
    it("renders the Auto-Continue switch in the off state by default", () => {
      setupChromeMock();
      render(<PlayTab />);
      const toggle = screen.getByRole("switch", { name: /auto-continue/i });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it("reflects autoContinue=true from stored settings", async () => {
      setupChromeMock({
        settings: {
          hintDelayMinutes: 3,
          celebrationHoverSeconds: 1.5,
          minWordThreshold: 30,
          autoContinue: true,
          showNextWordPreview: true,
        },
      });
      render(<PlayTab />);
      await waitFor(() => {
        const toggle = screen.getByRole("switch", { name: /auto-continue/i });
        expect(toggle).toHaveAttribute("aria-checked", "true");
      });
    });

    it("saves autoContinue=true to storage when the toggle is clicked from off", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);
      fireEvent.click(screen.getByRole("switch", { name: /auto-continue/i }));
      await waitFor(() =>
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({ autoContinue: true }),
          }),
        ),
      );
    });

    it("saves autoContinue=false when the toggle is clicked from on", async () => {
      const { setMock } = setupChromeMock({
        settings: {
          hintDelayMinutes: 3,
          celebrationHoverSeconds: 1.5,
          minWordThreshold: 30,
          autoContinue: true,
          showNextWordPreview: true,
        },
      });
      render(<PlayTab />);
      await waitFor(() => {
        expect(screen.getByRole("switch", { name: /auto-continue/i })).toHaveAttribute("aria-checked", "true");
      });
      fireEvent.click(screen.getByRole("switch", { name: /auto-continue/i }));
      await waitFor(() =>
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({ autoContinue: false }),
          }),
        ),
      );
    });
  });

  describe("Reload hint banner", () => {
    const settingsWithHint = {
      hintDelayMinutes: 3,
      celebrationHoverSeconds: 1.5,
      minWordThreshold: 30,
      autoContinue: false,
      showNextWordPreview: true,
      showReloadHint: true,
    };

    const settingsWithoutHint = { ...settingsWithHint, showReloadHint: false };

    it("is not visible before any hunt is started", () => {
      setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);
      expect(screen.queryByText(/reload the page to begin hunting/i)).not.toBeInTheDocument();
    });

    it("shows the reload hint banner after starting a hunt when showReloadHint is on", async () => {
      setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByText(/reload the page to begin hunting/i)).toBeInTheDocument();
      });
    });

    it("does not show the banner after starting a hunt when showReloadHint is off", async () => {
      setupChromeMock({ settings: settingsWithoutHint });
      render(<PlayTab />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /animals/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await new Promise((r) => setTimeout(r, 50));
      expect(screen.queryByText(/reload the page to begin hunting/i)).not.toBeInTheDocument();
    });

    it("hides the banner when the dismiss button is clicked", async () => {
      setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByText(/reload the page to begin hunting/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

      expect(screen.queryByText(/reload the page to begin hunting/i)).not.toBeInTheDocument();
    });

    it("calls chrome.scripting.executeScript on the active tab when Reload is clicked", async () => {
      const { executeScriptMock } = setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^reload$/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /^reload$/i }));

      expect(executeScriptMock).toHaveBeenCalledWith(
        expect.objectContaining({ target: { tabId: 42 } }),
      );
    });

    it("hides the banner after Reload is clicked", async () => {
      setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^reload$/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /^reload$/i }));

      expect(screen.queryByText(/reload the page to begin hunting/i)).not.toBeInTheDocument();
    });

    it("hides the banner when the active hunt is stopped", async () => {
      setupChromeMock({ settings: settingsWithHint });
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(screen.getByText(/reload the page to begin hunting/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /clear active word/i }));

      expect(screen.queryByText(/reload the page to begin hunting/i)).not.toBeInTheDocument();
    });
  });
});
