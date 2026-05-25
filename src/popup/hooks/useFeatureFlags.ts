import { DEFAULT_FLAGS } from "../../shared/constants";
import type { FeatureFlags } from "../../shared/types";
import { useStorage } from "./useStorage";

export function useFeatureFlags(): FeatureFlags {
  const [flags] = useStorage("featureFlags", DEFAULT_FLAGS);
  return flags;
}
