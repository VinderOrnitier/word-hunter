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
