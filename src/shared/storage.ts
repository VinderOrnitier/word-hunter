import { DEFAULT_SETTINGS } from "./constants";
import type { ActiveWord, GameSettings, HuntRecord, WordListName } from "./types";
import type { Locale } from "../i18n/types";

export type StorageSchema = {
  finds: HuntRecord[];
  settings: GameSettings;
  activeWord: ActiveWord | null;
  selectedList: WordListName;
  locale: Locale;
};

async function get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageSchema[K] | undefined;
}

export async function saveFind(record: HuntRecord): Promise<void> {
  const finds = (await get("finds")) ?? [];
  await chrome.storage.local.set({ finds: [...finds, record] });
}

export async function getFinds(): Promise<HuntRecord[]> {
  return (await get("finds")) ?? [];
}

export async function getSettings(): Promise<GameSettings> {
  const stored = await get("settings");
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function getActiveWord(): Promise<ActiveWord | null> {
  return (await get("activeWord")) ?? null;
}

export async function setActiveWord(activeWord: ActiveWord): Promise<void> {
  await chrome.storage.local.set({ activeWord });
}

export async function clearActiveWord(): Promise<void> {
  await chrome.storage.local.remove("activeWord");
}
