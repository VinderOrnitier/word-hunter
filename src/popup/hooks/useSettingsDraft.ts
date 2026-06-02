import { useEffect, useState } from "preact/hooks";
import type { Locale } from "../../i18n/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { GameSettings } from "../../shared/types";
import { useStorage } from "./useStorage";

export interface UseSettingsDraftResult {
  draft: GameSettings;
  draftLocale: Locale;
  /** True when the draft (settings or locale) diverges from what is persisted. */
  isDirty: boolean;
  /** Merge a partial change into the settings draft. */
  update: (patch: Partial<GameSettings>) => void;
  setDraftLocale: (locale: Locale) => void;
  /** Persist the draft settings and locale. */
  save: () => void;
  /** Discard the draft, reverting to the persisted values. */
  cancel: () => void;
}

/**
 * Owns the Settings form's edit-then-save buffer: a draft of the persisted
 * settings and locale, the dirty check that drives the Save/Cancel footer, and
 * the commit/revert actions. Both theme skins drive their markup from this one
 * behaviour so the two can never diverge.
 */
export function useSettingsDraft(): UseSettingsDraftResult {
  const [saved, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<GameSettings>(saved);
  const [savedLocale, setSavedLocale] = useStorage("locale", "en");
  const [draftLocale, setDraftLocale] = useState<Locale>(savedLocale);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  useEffect(() => {
    setDraftLocale(savedLocale);
  }, [savedLocale]);

  const isDirty =
    draft.hintDelayMinutes !== saved.hintDelayMinutes ||
    draft.celebrationHoverSeconds !== saved.celebrationHoverSeconds ||
    draft.minWordThreshold !== saved.minWordThreshold ||
    draft.showNextWordPreview !== saved.showNextWordPreview ||
    draft.showReloadHint !== saved.showReloadHint ||
    draft.notificationsEnabled !== saved.notificationsEnabled ||
    draft.showAutoModeToast !== saved.showAutoModeToast ||
    draft.showHintToast !== saved.showHintToast ||
    draft.showNoParagraphToast !== saved.showNoParagraphToast ||
    draftLocale !== savedLocale;

  const update = (patch: Partial<GameSettings>): void => {
    setDraft({ ...draft, ...patch });
  };

  const save = (): void => {
    setSettings(draft);
    setSavedLocale(draftLocale);
  };

  const cancel = (): void => {
    setDraft(saved);
    setDraftLocale(savedLocale);
  };

  return { draft, draftLocale, isDirty, update, setDraftLocale, save, cancel };
}
