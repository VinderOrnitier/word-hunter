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

  return { store, setMock };
}

describe("PlayTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("writes the slot's word to storage when a CollectionSlot is clicked", async () => {
    const { setMock } = setupChromeMock();
    render(<PlayTab />);

    fireEvent.click(screen.getByRole("button", { name: /Fox, not caught yet/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activeWord: expect.objectContaining({ word: "Fox", list: "animals" }),
        }),
      );
    });
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
    it("sets a random word from the active list when 'Start a hunt' is clicked", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

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

    it("respects the chosen list for the random pick", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("tab", { name: /pokémon/i }));
      fireEvent.click(screen.getByRole("button", { name: /start a hunt/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ list: "pokemon" }),
          }),
        );
      });
    });

    it("shuffle icon button picks a random word", async () => {
      const { setMock } = setupChromeMock();
      render(<PlayTab />);

      fireEvent.click(screen.getByRole("button", { name: /pick a random word/i }));

      await waitFor(() => {
        expect(setMock).toHaveBeenCalledWith(
          expect.objectContaining({
            activeWord: expect.objectContaining({ list: "animals" }),
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
});
