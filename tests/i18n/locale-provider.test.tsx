import { render, screen, waitFor } from "@testing-library/preact";
import { h } from "preact";
import { LocaleProvider, useT, getLocale } from "../../src/i18n";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string
) => void;

function setupChromeMock(initial: Record<string, unknown> = {}): {
  store: Record<string, unknown>;
  fireChange: (changes: Record<string, chrome.storage.StorageChange>) => void;
} {
  const store = { ...initial };
  const listeners: StorageChangeListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(),
        remove: jest.fn(),
      },
      onChanged: {
        addListener: jest.fn((l: StorageChangeListener) => listeners.push(l)),
        removeListener: jest.fn((l: StorageChangeListener) => {
          const i = listeners.indexOf(l);
          if (i >= 0) listeners.splice(i, 1);
        }),
      },
    },
  };

  return {
    store,
    fireChange: (changes) => listeners.forEach((l) => l(changes, "local")),
  };
}

function EyebrowOutput() {
  const t = useT();
  return <span data-testid="output">{t("active_word_eyebrow")}</span>;
}

describe("useT()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns English strings when called without a LocaleProvider", () => {
    setupChromeMock();
    render(<EyebrowOutput />);
    expect(screen.getByTestId("output")).toHaveTextContent("Active word");
  });

  it("returns English strings when locale is en", async () => {
    setupChromeMock({ locale: "en" });
    render(
      <LocaleProvider>
        <EyebrowOutput />
      </LocaleProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId("output")).toHaveTextContent("Active word")
    );
  });
});

describe("getLocale()", () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns "en" when no locale is stored', async () => {
    setupChromeMock();
    expect(await getLocale()).toBe("en");
  });

  it("returns the stored locale", async () => {
    setupChromeMock({ locale: "uk" });
    expect(await getLocale()).toBe("uk");
  });
});
