import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { Locale } from "../../i18n/types";
import { DEFAULT_THEME } from "../../shared/constants";
import type { Theme } from "../../shared/types";
import { NumberStepperPdx } from "../components/NumberStepper.pdx";
import { RangeSliderPdx } from "../components/RangeSlider.pdx";
import { SwitchPdx } from "../components/Switch.pdx";
import { useSettingsDraft } from "../hooks/useSettingsDraft";
import { useStorage } from "../hooks/useStorage";

const LANGUAGE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export function SettingsTabPdx(): JSX.Element {
  const t = useT();
  const { draft, draftLocale, isDirty, update, setDraftLocale, save, cancel } = useSettingsDraft();
  const [theme, setTheme] = useStorage("theme", DEFAULT_THEME);

  const themeTiles: Array<{
    value: Theme;
    labelKey: "settings_theme_slate" | "settings_theme_pokedex";
  }> = [
    { value: "slate", labelKey: "settings_theme_slate" },
    { value: "pokedex", labelKey: "settings_theme_pokedex" },
  ];

  return (
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          <div class="pdx-section-eyebrow">
            <span class="pdx-section-eyebrow__title">{t("tab_settings")}</span>
          </div>

          {/* THEME */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_theme_label")}</span>
            <div class="settings-field__row">
              <div class="pdx-theme-tiles">
                {themeTiles.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    class={`pdx-theme-tile pdx-theme-tile--${value}${theme === value ? " is-active" : ""}`}
                    aria-pressed={theme === value}
                    onClick={() => setTheme(value)}
                  >
                    <span class="pdx-theme-tile__swatch">
                      <span class="pdx-theme-tile__accent" />
                    </span>
                    <span class="pdx-theme-tile__name">{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <span class="settings-field__helper">{t("settings_theme_reopen_hint")}</span>
          </div>

          {/* LANGUAGE — pdx-styled select arrives in Phase 3c; native select keeps it functional */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_language_label")}</span>
            <div class="settings-field__row">
              <select
                class="pdx-select"
                value={draftLocale}
                onChange={(e) => setDraftLocale((e.target as HTMLSelectElement).value as Locale)}
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MIN PARAGRAPH */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_min_paragraph_label")}</span>
            <div class="settings-field__row">
              <RangeSliderPdx
                value={draft.minWordThreshold}
                min={30}
                max={150}
                step={10}
                ariaLabel={t("settings_min_paragraph_label")}
                onInput={(v) => update({ minWordThreshold: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_min_paragraph_helper")}</span>
          </div>

          {/* HINT DELAY */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_hint_delay_label")}</span>
            <div class="settings-field__row">
              <NumberStepperPdx
                value={String(draft.hintDelayMinutes)}
                unit={t("settings_hint_delay_unit")}
                min={1}
                step={1}
                onInput={(v) => update({ hintDelayMinutes: Number(v) })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_hint_delay_helper")}</span>
          </div>

          {/* CURSOR REVEAL */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_cursor_delay_label")}</span>
            <div class="settings-field__row">
              <NumberStepperPdx
                value={String(draft.celebrationHoverSeconds)}
                unit={t("settings_cursor_delay_unit")}
                min={0.1}
                step={0.1}
                onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_cursor_delay_helper")}</span>
          </div>

          {/* RELOAD HINT */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_reload_hint_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showReloadHint}
                ariaLabel={t("settings_reload_hint_label")}
                onChange={(v) => update({ showReloadHint: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_reload_hint_helper")}</span>
          </div>

          {/* NEXT WORD PREVIEW */}
          <div class="settings-field">
            <span class="settings-field__label">{t("settings_next_word_preview_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showNextWordPreview}
                ariaLabel={t("settings_next_word_preview_label")}
                onChange={(v) => update({ showNextWordPreview: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_next_word_preview_helper")}</span>
          </div>

          {/* NOTIFICATIONS group — label + switch inline, no helper */}
          <div class="settings-field settings-field--inline">
            <span class="settings-field__label">{t("settings_notifications_eyebrow")}</span>
            <SwitchPdx
              checked={draft.notificationsEnabled}
              ariaLabel={t("settings_notifications_aria")}
              title={t("settings_notifications_title")}
              onChange={(v) => update({ notificationsEnabled: v })}
            />
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_auto_continue_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showAutoModeToast}
                ariaLabel={t("settings_auto_continue_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showAutoModeToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_auto_continue_helper")}</span>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_hint_reminder_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showHintToast}
                ariaLabel={t("settings_hint_reminder_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showHintToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_hint_reminder_helper")}</span>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{t("settings_no_paragraphs_label")}</span>
            <div class="settings-field__row">
              <SwitchPdx
                checked={draft.showNoParagraphToast}
                ariaLabel={t("settings_no_paragraphs_label")}
                disabled={!draft.notificationsEnabled}
                onChange={(v) => update({ showNoParagraphToast: v })}
              />
            </div>
            <span class="settings-field__helper">{t("settings_no_paragraphs_helper")}</span>
          </div>
        </div>
      </div>

      {isDirty && (
        <div class="pdx-popup__footer">
          <span class="pdx-popup__footer-msg">{t("pdx_unsaved_edits")}</span>
          <button type="button" class="pdx-btn-ghost" onClick={cancel}>
            {t("settings_cancel")}
          </button>
          <button type="button" class="pdx-btn-primary" onClick={save}>
            {t("settings_save")}
          </button>
        </div>
      )}
    </>
  );
}
