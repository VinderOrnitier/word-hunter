import type { FindRecord, GameSettings, ActiveWord } from "./types";
import { DEFAULT_SETTINGS } from "./constants";

type StorageSchema = {
  finds: FindRecord[];
  settings: GameSettings;
  activeWord: ActiveWord | null;
};

async function get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageSchema[K] | undefined;
}

export async function saveFind(record: FindRecord): Promise<void> {
  const finds = (await get("finds")) ?? [];
  await chrome.storage.local.set({ finds: [...finds, record] });
}

export async function getFinds(): Promise<FindRecord[]> {
  return (await get("finds")) ?? [];
}

export async function getSettings(): Promise<GameSettings> {
  return (await get("settings")) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function getActiveWord(): Promise<ActiveWord | null> {
  return (await get("activeWord")) ?? null;
}

export async function setActiveWord(activeWord: ActiveWord | null): Promise<void> {
  await chrome.storage.local.set({ activeWord });
}
