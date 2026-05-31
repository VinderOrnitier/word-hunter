import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { Locale } from "../../i18n/types";
import { DEFAULT_SETTINGS, DEFAULT_THEME } from "../../shared/constants";
import type { GameSettings, Theme } from "../../shared/types";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";
import { Field } from "../components/Field";
import { NumberInput } from "../components/NumberInput";
import { useStorage } from "../hooks/useStorage";

const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export function SettingsTab(): JSX.Element {
  const t = useT();
  const [saved, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<GameSettings>(saved);
  const [savedLocale, setSavedLocale] = useStorage("locale", "en");
  const [draftLocale, setDraftLocale] = useState<Locale>(savedLocale);
  const [theme, setTheme] = useStorage("theme", DEFAULT_THEME);

  const themeTiles: Array<{
    value: Theme;
    labelKey: "settings_theme_slate" | "settings_theme_pokedex";
  }> = [
    { value: "slate", labelKey: "settings_theme_slate" },
    { value: "pokedex", labelKey: "settings_theme_pokedex" },
  ];

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

  const handleSave = (): void => {
    setSettings(draft);
    setSavedLocale(draftLocale);
  };

  const handleCancel = (): void => {
    setDraft(saved);
    setDraftLocale(savedLocale);
  };

  return (
    <div class="wh-settings">
      <div class="wh-settings__scroll">
        <Field label={t("settings_theme_label")} helper={t("settings_theme_reopen_hint")}>
          <div class="wh-settings__theme-tiles">
            {themeTiles.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                class={`wh-settings__theme-tile wh-settings__theme-tile--${value}${theme === value ? " is-active" : ""}`}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <span class="wh-settings__theme-swatch">
                  <span class="wh-settings__theme-accent" />
                </span>
                <span class="wh-settings__theme-name">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("settings_language_label")} htmlFor="setting-language">
          <select
            id="setting-language"
            class="wh-select"
            value={draftLocale}
            onChange={(e) => setDraftLocale((e.target as HTMLSelectElement).value as Locale)}
          >
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={t("settings_min_paragraph_label")}
          htmlFor="setting-min-paragraph"
          helper={t("settings_min_paragraph_helper")}
        >
          <div class="wh-settings__input-row">
            <input
              id="setting-min-paragraph"
              type="range"
              class="wh-settings__range"
              min={30}
              max={150}
              step={10}
              value={draft.minWordThreshold}
              style={{
                background: `linear-gradient(to right, var(--wh-primary) 0%, var(--wh-primary) ${((draft.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) ${((draft.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) 100%)`,
              }}
              onInput={(e) =>
                update({ minWordThreshold: Number((e.target as HTMLInputElement).value) })
              }
            />
            <span class="wh-settings__range-value">{draft.minWordThreshold}</span>
          </div>
        </Field>

        <Field
          label={t("settings_hint_delay_label")}
          htmlFor="setting-hint-delay"
          helper={t("settings_hint_delay_helper")}
        >
          <div class="wh-settings__input-row">
            <NumberInput
              id="setting-hint-delay"
              min={1}
              step={1}
              value={String(draft.hintDelayMinutes)}
              onInput={(v) => update({ hintDelayMinutes: Number(v) })}
            />
            <span class="wh-settings__unit">{t("settings_hint_delay_unit")}</span>
          </div>
        </Field>

        <Field
          label={t("settings_cursor_delay_label")}
          htmlFor="setting-cursor-delay"
          helper={t("settings_cursor_delay_helper")}
        >
          <div class="wh-settings__input-row">
            <NumberInput
              id="setting-cursor-delay"
              min={0.1}
              step={0.1}
              value={String(draft.celebrationHoverSeconds)}
              onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
            />
            <span class="wh-settings__unit">{t("settings_cursor_delay_unit")}</span>
          </div>
        </Field>

        <Field label={t("settings_reload_hint_label")} helper={t("settings_reload_hint_helper")}>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showReloadHint ? " is-on" : ""}`}
            aria-checked={draft.showReloadHint}
            aria-label={t("settings_reload_hint_label")}
            onClick={() => update({ showReloadHint: !draft.showReloadHint })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showReloadHint ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field
          label={t("settings_next_word_preview_label")}
          helper={t("settings_next_word_preview_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNextWordPreview ? " is-on" : ""}`}
            aria-checked={draft.showNextWordPreview}
            aria-label={t("settings_next_word_preview_label")}
            onClick={() => update({ showNextWordPreview: !draft.showNextWordPreview })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNextWordPreview ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <div class="wh-settings__notif-header">
          <Eyebrow>{t("settings_notifications_eyebrow")}</Eyebrow>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.notificationsEnabled ? " is-on" : ""}`}
            aria-checked={draft.notificationsEnabled}
            aria-label={t("settings_notifications_aria")}
            title={t("settings_notifications_title")}
            onClick={() => update({ notificationsEnabled: !draft.notificationsEnabled })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
          </button>
        </div>

        <Field
          label={t("settings_auto_continue_label")}
          helper={t("settings_auto_continue_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showAutoModeToast ? " is-on" : ""}`}
            aria-checked={draft.showAutoModeToast}
            aria-label={t("settings_auto_continue_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showAutoModeToast: !draft.showAutoModeToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showAutoModeToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field
          label={t("settings_hint_reminder_label")}
          helper={t("settings_hint_reminder_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showHintToast ? " is-on" : ""}`}
            aria-checked={draft.showHintToast}
            aria-label={t("settings_hint_reminder_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showHintToast: !draft.showHintToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showHintToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>

        <Field
          label={t("settings_no_paragraphs_label")}
          helper={t("settings_no_paragraphs_helper")}
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNoParagraphToast ? " is-on" : ""}`}
            aria-checked={draft.showNoParagraphToast}
            aria-label={t("settings_no_paragraphs_label")}
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showNoParagraphToast: !draft.showNoParagraphToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNoParagraphToast ? t("settings_switch_on") : t("settings_switch_off")}
            </span>
          </button>
        </Field>
      </div>

      {isDirty && (
        <div class="wh-settings__footer">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            {t("settings_cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t("settings_save")}
          </Button>
        </div>
      )}
    </div>
  );
}
