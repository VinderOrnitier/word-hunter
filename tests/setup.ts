import "@testing-library/jest-dom";

// Source modules that call chrome APIs at module top-level (e.g. chrome.runtime.getURL)
// would throw ReferenceError in jsdom without this stub. Tests that need specific
// behaviour replace globalThis.chrome entirely via their own setupChromeMock().
const chromeStub = {
  runtime: {
    getURL: (path: string): string => path,
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
  },
};

(globalThis as unknown as { chrome: typeof chromeStub }).chrome = chromeStub;
