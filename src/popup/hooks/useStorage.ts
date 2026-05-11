import { useEffect, useState } from "preact/hooks";
import type { StorageSchema } from "../../shared/storage";

export function useStorage<K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K]
): [StorageSchema[K], (value: StorageSchema[K]) => void] {
  const [value, setLocalValue] = useState<StorageSchema[K]>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    chrome.storage.local.get(key).then((result) => {
      if (cancelled) return;
      const stored = result[key] as StorageSchema[K] | undefined;
      if (stored !== undefined) setLocalValue(stored);
    });

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ): void => {
      if (areaName !== "local") return;
      const change = changes[key];
      if (!change) return;
      setLocalValue(change.newValue as StorageSchema[K]);
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      cancelled = true;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [key]);

  const setValue = (next: StorageSchema[K]): void => {
    setLocalValue(next);
    void chrome.storage.local.set({ [key]: next });
  };

  return [value, setValue];
}
