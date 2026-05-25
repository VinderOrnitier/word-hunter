# Feature Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a remote feature flag system backed by a GitHub-hosted JSON file so individual features (starting with Pokémon) can be disabled without a new Chrome Web Store release.

**Architecture:** A `config/features.json` file lives in the repo and is served via GitHub raw. The service worker fetches it on install and every hour via Chrome alarm, merging the result with `DEFAULT_FLAGS` and caching it in `chrome.storage.local`. The popup reads flags reactively through a `useFeatureFlags()` Preact hook that wraps the existing `useStorage` pattern. When `flags.pokemon` becomes `false`, `PlayTab` hides the Pokémon chip and auto-switches the active list to animals.

**Tech Stack:** TypeScript, Preact hooks, `chrome.storage.local`, `chrome.alarms`, `fetch`, Jest + jsdom + `@testing-library/preact`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/shared/types.ts` | Add `FeatureFlags` interface |
| Modify | `src/shared/constants.ts` | Add `FLAGS_URL` and `DEFAULT_FLAGS` |
| Modify | `src/shared/storage.ts` | Add `featureFlags` key to `StorageSchema` |
| Create | `src/shared/feature-flags.ts` | `refreshFlags()` — fetch, merge, persist |
| Create | `src/popup/hooks/useFeatureFlags.ts` | Reactive Preact hook for flags |
| Modify | `src/background/service-worker.ts` | Call `refreshFlags()` on install + alarm |
| Modify | `manifest.json` | `host_permissions` + `alarms` permission |
| Create | `config/features.json` | Remote config file hosted on GitHub raw |
| Modify | `src/popup/tabs/PlayTab.tsx` | Consume flags, filter chips, auto-switch |
| Create | `tests/shared/feature-flags.test.ts` | Unit tests for `refreshFlags()` |
| Create | `tests/popup/hooks/use-feature-flags.test.ts` | Unit tests for `useFeatureFlags` |
| Modify | `tests/background/service-worker.test.ts` | Extend chrome mock to include `onInstalled` + `alarms` |
| Create | `tests/background/service-worker-flags.test.ts` | Tests for install + alarm refresh behavior |

---

## Task 1: Foundation — types, constants, StorageSchema

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/constants.ts`
- Modify: `src/shared/storage.ts`

No tests needed — pure type and constant changes.

- [ ] **Step 1: Add `FeatureFlags` interface to `src/shared/types.ts`**

Append to the end of the file:

```typescript
export interface FeatureFlags {
  pokemon: boolean;
}
```

- [ ] **Step 2: Add `FLAGS_URL` and `DEFAULT_FLAGS` to `src/shared/constants.ts`**

Add the import and new exports. The file currently imports `GameSettings` — add `FeatureFlags` to the same import:

```typescript
import type { FeatureFlags, GameSettings } from "./types";
```

Append to the end of the file (after the existing `HINT_USED_KEY` export):

```typescript
export const FLAGS_URL =
  "https://raw.githubusercontent.com/VinderOrnitier/word-hunter/main/config/features.json";

export const DEFAULT_FLAGS: FeatureFlags = {
  pokemon: true,
};
```

- [ ] **Step 3: Add `featureFlags` to `StorageSchema` in `src/shared/storage.ts`**

The current import line is:
```typescript
import type { ActiveWord, GameSettings, HuntRecord, WordListName } from "./types";
```

Replace with:
```typescript
import type { ActiveWord, FeatureFlags, GameSettings, HuntRecord, WordListName } from "./types";
```

Add `featureFlags` to the `StorageSchema` type (after `locale`):

```typescript
export type StorageSchema = {
  finds: HuntRecord[];
  settings: GameSettings;
  activeWord: ActiveWord | null;
  selectedList: WordListName;
  locale: Locale;
  featureFlags: FeatureFlags;
};
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts src/shared/storage.ts
git commit -m "feat(flags): add FeatureFlags type, DEFAULT_FLAGS, FLAGS_URL, StorageSchema key"
```

---

## Task 2: `refreshFlags()` function (TDD)

**Files:**
- Create: `tests/shared/feature-flags.test.ts`
- Create: `src/shared/feature-flags.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/shared/feature-flags.test.ts`:

```typescript
import { DEFAULT_FLAGS, FLAGS_URL } from "../../src/shared/constants";
import { refreshFlags } from "../../src/shared/feature-flags";

function setupChromeMock(): Record<string, unknown> {
  const store: Record<string, unknown> = {};

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
      },
    },
  };

  return store;
}

describe("refreshFlags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("writes merged flags to storage on successful fetch", async () => {
    const store = setupChromeMock();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pokemon: false }),
    });

    await refreshFlags();

    expect(store["featureFlags"]).toEqual({ pokemon: false });
  });

  it("merges partial remote response with DEFAULT_FLAGS", async () => {
    const store = setupChromeMock();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await refreshFlags();

    expect(store["featureFlags"]).toEqual(DEFAULT_FLAGS);
  });

  it("does not write to storage when fetch returns non-ok status", async () => {
    const store = setupChromeMock();
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await refreshFlags();

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(store["featureFlags"]).toBeUndefined();
  });

  it("resolves without throwing when fetch rejects", async () => {
    const store = setupChromeMock();
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    await expect(refreshFlags()).resolves.toBeUndefined();
    expect(store["featureFlags"]).toBeUndefined();
  });

  it("fetches from FLAGS_URL", async () => {
    setupChromeMock();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await refreshFlags();

    expect(fetch).toHaveBeenCalledWith(FLAGS_URL);
  });
});
```

- [ ] **Step 2: Run to verify tests fail**

```bash
pnpm test tests/shared/feature-flags.test.ts
```

Expected: FAIL — `Cannot find module '../../src/shared/feature-flags'`

- [ ] **Step 3: Create `src/shared/feature-flags.ts`**

```typescript
import { DEFAULT_FLAGS, FLAGS_URL } from "./constants";
import type { FeatureFlags } from "./types";

export async function refreshFlags(): Promise<void> {
  try {
    const response = await fetch(FLAGS_URL);
    if (!response.ok) return;
    const remote = (await response.json()) as Partial<FeatureFlags>;
    const merged: FeatureFlags = { ...DEFAULT_FLAGS, ...remote };
    await chrome.storage.local.set({ featureFlags: merged });
  } catch {
    // network error or parse failure — cached value in storage serves as fallback
  }
}
```

- [ ] **Step 4: Run to verify tests pass**

```bash
pnpm test tests/shared/feature-flags.test.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/shared/feature-flags.ts tests/shared/feature-flags.test.ts
git commit -m "feat(flags): add refreshFlags() with remote fetch and storage persistence"
```

---

## Task 3: `useFeatureFlags` hook (TDD)

**Files:**
- Create: `tests/popup/hooks/use-feature-flags.test.ts`
- Create: `src/popup/hooks/useFeatureFlags.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/popup/hooks/use-feature-flags.test.ts`:

```typescript
import { act, renderHook } from "@testing-library/preact";
import { DEFAULT_FLAGS } from "../../../src/shared/constants";
import { useFeatureFlags } from "../../../src/popup/hooks/useFeatureFlags";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
) => void;

function setupChromeMock(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
  const listeners: StorageChangeListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: jest.fn(async (key: string) => ({ [key]: store[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
          const changes = Object.fromEntries(
            Object.entries(items).map(([k, v]) => [k, { newValue: v }])
          );
          listeners.forEach((fn) => fn(changes, "local"));
        }),
      },
      onChanged: {
        addListener: jest.fn((fn: StorageChangeListener) => listeners.push(fn)),
        removeListener: jest.fn((fn: StorageChangeListener) => {
          const i = listeners.indexOf(fn);
          if (i !== -1) listeners.splice(i, 1);
        }),
      },
    },
  };

  return {
    fireStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      listeners.forEach((fn) => fn(changes, "local"));
    },
  };
}

describe("useFeatureFlags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns DEFAULT_FLAGS when storage is empty", async () => {
    setupChromeMock();
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current).toEqual(DEFAULT_FLAGS);
  });

  it("returns stored flags when featureFlags is in storage", async () => {
    setupChromeMock({ featureFlags: { pokemon: false } });
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current).toEqual({ pokemon: false });
  });

  it("updates reactively when featureFlags changes in storage", async () => {
    const { fireStorageChange } = setupChromeMock({ featureFlags: { pokemon: true } });
    const { result } = renderHook(() => useFeatureFlags());
    await act(async () => {});
    expect(result.current.pokemon).toBe(true);

    await act(async () => {
      fireStorageChange({ featureFlags: { newValue: { pokemon: false } } });
    });

    expect(result.current.pokemon).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify tests fail**

```bash
pnpm test tests/popup/hooks/use-feature-flags.test.ts
```

Expected: FAIL — `Cannot find module '../../src/popup/hooks/useFeatureFlags'`

- [ ] **Step 3: Create `src/popup/hooks/useFeatureFlags.ts`**

```typescript
import { DEFAULT_FLAGS } from "../../shared/constants";
import type { FeatureFlags } from "../../shared/types";
import { useStorage } from "./useStorage";

export function useFeatureFlags(): FeatureFlags {
  const [flags] = useStorage("featureFlags", DEFAULT_FLAGS);
  return flags;
}
```

- [ ] **Step 4: Run to verify tests pass**

```bash
pnpm test tests/popup/hooks/use-feature-flags.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/popup/hooks/useFeatureFlags.ts tests/popup/hooks/use-feature-flags.test.ts
git commit -m "feat(flags): add useFeatureFlags hook"
```

---

## Task 4: Service worker — alarm and refresh on install (TDD)

**Files:**
- Modify: `tests/background/service-worker.test.ts`
- Create: `tests/background/service-worker-flags.test.ts`
- Modify: `src/background/service-worker.ts`

> **Why two test files?** `jest.mock()` must be at the module top level to be hoisted. The existing test file uses `jest.resetModules()` + `await import()` without any module mocks. Keeping the flag-refresh tests in a separate file avoids hoisting conflicts and keeps each file's setup self-contained.

- [ ] **Step 1: Extend `setupChromeMock` in `tests/background/service-worker.test.ts`**

The existing mock doesn't include `runtime.onInstalled` or `alarms`. Without them, the module will throw when it's loaded after the new code is added. Replace the existing `setupChromeMock` function (lines 8–38) with:

```typescript
function setupChromeMock() {
  const storageListeners: StorageChangeListener[] = [];

  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      onMessage: { addListener: jest.fn() },
      onInstalled: { addListener: jest.fn() },
    },
    action: {
      openPopup: jest.fn().mockResolvedValue(undefined),
    },
    storage: {
      onChanged: {
        addListener: jest.fn((fn: StorageChangeListener) => storageListeners.push(fn)),
      },
    },
    tabs: {
      query: jest.fn((_filter: unknown, cb: (tabs: { id: number }[]) => void) =>
        cb([{ id: 10 }, { id: 20 }])
      ),
      sendMessage: jest.fn(),
    },
    alarms: {
      create: jest.fn(),
      onAlarm: { addListener: jest.fn() },
    },
  };

  return {
    fireStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      storageListeners.forEach((fn) => fn(changes, "local"));
    },
  };
}
```

- [ ] **Step 2: Create `tests/background/service-worker-flags.test.ts`**

`jest.mock()` at the top level is hoisted by Jest. After `jest.resetModules()`, when `service-worker.ts` is re-imported via `await import()`, it loads the mocked `feature-flags` module from the mock registry.

```typescript
jest.mock("../../src/shared/feature-flags", () => ({
  refreshFlags: jest.fn().mockResolvedValue(undefined),
}));

import { refreshFlags } from "../../src/shared/feature-flags";

const mockRefreshFlags = refreshFlags as jest.Mock;

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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
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
```

- [ ] **Step 3: Run to verify new tests fail and existing tests still pass**

```bash
pnpm test tests/background/
```

Expected: `service-worker.test.ts` — PASS (existing tests unaffected by extended mock). `service-worker-flags.test.ts` — FAIL (service worker doesn't have the new code yet).

- [ ] **Step 4: Update `src/background/service-worker.ts`**

Add import at the top:
```typescript
import { refreshFlags } from "../shared/feature-flags";
```

Append at the end of the file (after the existing `storage.onChanged` listener):
```typescript
chrome.runtime.onInstalled.addListener(() => {
  void refreshFlags();
  chrome.alarms.create("refresh-flags", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh-flags") {
    void refreshFlags();
  }
});
```

- [ ] **Step 5: Run all service worker tests to verify they pass**

```bash
pnpm test tests/background/
```

Expected: PASS — all tests in both files.

- [ ] **Step 6: Commit**

```bash
git add src/background/service-worker.ts tests/background/service-worker.test.ts tests/background/service-worker-flags.test.ts
git commit -m "feat(flags): refresh feature flags on install and every hour via alarm"
```

---

## Task 5: Manifest and remote config file

**Files:**
- Modify: `manifest.json`
- Create: `config/features.json`

- [ ] **Step 1: Update `manifest.json`**

Add `"alarms"` to `"permissions"` and add `"host_permissions"`. The full updated file:

```json
{
  "manifest_version": 3,
  "name": "Word Hunter",
  "version": "0.1.0",
  "description": "A vocabulary game that hides a word invisibly in web-page text and lets you hunt for it as you read.",
  "default_locale": "en",
  "permissions": ["storage", "activeTab", "scripting", "alarms"],
  "host_permissions": ["https://raw.githubusercontent.com/*"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"]
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon16.png",
      "32": "public/icons/icon32.png",
      "48": "public/icons/icon48.png",
      "128": "public/icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "icons": {
    "16": "public/icons/icon16.png",
    "32": "public/icons/icon32.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
}
```

- [ ] **Step 2: Create `config/features.json`**

```json
{
  "pokemon": true
}
```

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add manifest.json config/features.json
git commit -m "feat(flags): add host_permissions, alarms permission, and remote features.json"
```

---

## Task 6: PlayTab — consume flags and auto-switch

**Files:**
- Modify: `src/popup/tabs/PlayTab.tsx`

- [ ] **Step 1: Update imports in `src/popup/tabs/PlayTab.tsx`**

Replace:
```typescript
import { useMemo, useState } from "preact/hooks";
```
With:
```typescript
import { useEffect, useMemo, useState } from "preact/hooks";
```

Add after the existing `useStorage` import:
```typescript
import { useFeatureFlags } from "../hooks/useFeatureFlags";
```

- [ ] **Step 2: Add `useFeatureFlags` call inside `PlayTab`**

After the existing `useStorage` hooks (after line `const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);`), add:

```typescript
const flags = useFeatureFlags();
```

- [ ] **Step 3: Add auto-switch effect**

After the `flags` line, add:

```typescript
useEffect(() => {
  if (!flags.pokemon && list === "pokemon") {
    void chrome.storage.local.set({ selectedList: "animals" });
  }
}, [flags.pokemon, list]);
```

- [ ] **Step 4: Filter visible list chips**

Replace the `LIST_CHIPS.map(...)` call in the JSX. The current JSX at the chip group is:

```tsx
{LIST_CHIPS.map((chip) => (
  <button
    key={chip.value}
    type="button"
    role="tab"
    class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
    aria-selected={list === chip.value}
    onClick={() => setList(chip.value)}
  >
    {t(chip.labelKey)}
  </button>
))}
```

Replace with:

```tsx
{LIST_CHIPS.filter((chip) => chip.value !== "pokemon" || flags.pokemon).map((chip) => (
  <button
    key={chip.value}
    type="button"
    role="tab"
    class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
    aria-selected={list === chip.value}
    onClick={() => setList(chip.value)}
  >
    {t(chip.labelKey)}
  </button>
))}
```

- [ ] **Step 5: Run full test suite and build**

```bash
pnpm test && pnpm build
```

Expected: all tests PASS, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/popup/tabs/PlayTab.tsx
git commit -m "feat(flags): hide Pokémon chip and auto-switch to animals when flag is disabled"
```

---

## Verification

After all tasks are done:

1. `pnpm test` — all tests pass
2. `pnpm build` — build succeeds
3. Load unpacked extension in Chrome (`chrome://extensions` → Load unpacked → select `dist/`)
4. Verify the Pokémon chip is visible in the Play tab, games work normally
5. To test the kill switch: temporarily change `FLAGS_URL` in `src/shared/constants.ts` to a local server (or mock in devtools) returning `{"pokemon": false}` — verify the chip disappears and the active list switches to animals
6. Re-enable: chip reappears, collection history is intact
