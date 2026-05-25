type AlarmListener = (alarm: chrome.alarms.Alarm) => void;

function setupChromeMock() {
  const installedListeners: Array<() => void> = [];
  const alarmListeners: AlarmListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      onMessage: { addListener: jest.fn() },
      onInstalled: {
        addListener: jest.fn((fn: () => void) => installedListeners.push(fn)),
      },
    },
    action: { openPopup: jest.fn().mockResolvedValue(undefined) },
    storage: { onChanged: { addListener: jest.fn() } },
    tabs: { query: jest.fn(), sendMessage: jest.fn() },
    alarms: {
      create: jest.fn(),
      onAlarm: {
        addListener: jest.fn((fn: AlarmListener) => alarmListeners.push(fn)),
      },
    },
  };

  return {
    fireInstalled() {
      installedListeners.forEach((fn) => fn());
    },
    fireAlarm(name: string) {
      alarmListeners.forEach((fn) => fn({ name } as chrome.alarms.Alarm));
    },
  };
}

describe("service worker — feature flag refresh", () => {
  let mockRefreshFlags: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockRefreshFlags = jest.fn().mockResolvedValue(undefined);
    jest.doMock("../../src/shared/feature-flags", () => ({
      refreshFlags: mockRefreshFlags,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls refreshFlags and creates alarm on install", async () => {
    const { fireInstalled } = setupChromeMock();
    await import("../../src/background/service-worker");

    fireInstalled();
    await Promise.resolve();

    expect(mockRefreshFlags).toHaveBeenCalledTimes(1);
    expect(chrome.alarms.create).toHaveBeenCalledWith("refresh-flags", {
      periodInMinutes: 60,
    });
  });

  it("calls refreshFlags when the refresh-flags alarm fires", async () => {
    const { fireAlarm } = setupChromeMock();
    await import("../../src/background/service-worker");

    fireAlarm("refresh-flags");
    await Promise.resolve();

    expect(mockRefreshFlags).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated alarm names", async () => {
    const { fireAlarm } = setupChromeMock();
    await import("../../src/background/service-worker");

    fireAlarm("some-other-alarm");
    await Promise.resolve();

    expect(mockRefreshFlags).not.toHaveBeenCalled();
  });
});
