import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { PlayTab } from "../../src/popup/tabs/PlayTab";
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
      word: "eagle",
      list: "animals",
      insertedAt: 1000,
    };
    setupChromeMock({ activeWord: active });
    render(<PlayTab />);
    await waitFor(() =>
      expect(screen.getByText("eagle")).toBeInTheDocument()
    );
  });

  it("updates the word dropdown when the WordList selection changes", () => {
    setupChromeMock();
    render(<PlayTab />);

    const lists = screen.getAllByRole("combobox");
    const wordListSelect = lists[0];
    fireEvent.change(wordListSelect, { target: { value: "pokemon" } });

    expect(screen.getByRole("option", { name: "Pikachu" })).toBeInTheDocument();
  });

  it("writes the dropdown selection to storage when 'New word' is clicked", async () => {
    const { setMock } = setupChromeMock();
    render(<PlayTab />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "fox" } });
    fireEvent.click(screen.getByRole("button", { name: /new word/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activeWord: expect.objectContaining({ word: "fox", list: "animals" }),
        })
      );
    });
  });

  it("writes a custom word with list='custom' when the custom input is filled", async () => {
    const { setMock } = setupChromeMock();
    render(<PlayTab />);

    const custom = screen.getByPlaceholderText(/type your own/i);
    fireEvent.input(custom, { target: { value: "unicorn" } });
    fireEvent.click(screen.getByRole("button", { name: /new word/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          activeWord: expect.objectContaining({
            word: "unicorn",
            list: "custom",
          }),
        })
      );
    });
  });

  it("clears the ActiveWord when the Clear button is clicked", async () => {
    const active: ActiveWord = {
      word: "fox",
      list: "animals",
      insertedAt: 1000,
    };
    const { setMock } = setupChromeMock({ activeWord: active });
    render(<PlayTab />);

    await waitFor(() =>
      expect(screen.getByText("fox")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ activeWord: null })
      );
    });
  });
});
