import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { GameSettings } from "../../shared/types";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { useStorage } from "../hooks/useStorage";

export function SettingsTab(): JSX.Element {
  const [saved, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState<GameSettings>(saved);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const isDirty =
    draft.hintDelayMinutes !== saved.hintDelayMinutes ||
    draft.celebrationHoverSeconds !== saved.celebrationHoverSeconds ||
    draft.minWordThreshold !== saved.minWordThreshold ||
    draft.showNextWordPreview !== saved.showNextWordPreview ||
    draft.showReloadHint !== saved.showReloadHint ||
    draft.notificationsEnabled !== saved.notificationsEnabled ||
    draft.showAutoModeToast !== saved.showAutoModeToast ||
    draft.showHintToast !== saved.showHintToast ||
    draft.showNoParagraphToast !== saved.showNoParagraphToast;

  const update = (patch: Partial<GameSettings>): void => {
    setDraft({ ...draft, ...patch });
  };

  const handleSave = (): void => {
    setSettings(draft);
  };

  const handleCancel = (): void => {
    setDraft(saved);
  };

  return (
    <div class="wh-settings">
      <div class="wh-settings__scroll">
        <Field
          label="Minimum paragraph length"
          htmlFor="setting-min-paragraph"
          helper="paragraphs below this word count are skipped"
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
          label="Hint delay"
          htmlFor="setting-hint-delay"
          helper="minutes the page is open before the hint tooltip shows"
        >
          <div class="wh-settings__input-row">
            <div class="wh-settings__input-cell">
              <Input
                id="setting-hint-delay"
                type="number"
                min={1}
                step={1}
                value={String(draft.hintDelayMinutes)}
                onInput={(v) => update({ hintDelayMinutes: Number(v) })}
              />
            </div>
            <span class="wh-settings__unit">min</span>
          </div>
        </Field>

        <Field
          label="Cursor reveal delay"
          htmlFor="setting-cursor-delay"
          helper="seconds of hovering before the cursor reveals the word"
        >
          <div class="wh-settings__input-row">
            <div class="wh-settings__input-cell">
              <Input
                id="setting-cursor-delay"
                type="number"
                min={0.1}
                step={0.1}
                value={String(draft.celebrationHoverSeconds)}
                onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
              />
            </div>
            <span class="wh-settings__unit">s</span>
          </div>
        </Field>

        <Field label="Reload hint" helper="prompt to reload the page after starting a hunt">
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showReloadHint ? " is-on" : ""}`}
            aria-checked={draft.showReloadHint}
            aria-label="Reload hint"
            onClick={() => update({ showReloadHint: !draft.showReloadHint })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">{draft.showReloadHint ? "On" : "Off"}</span>
          </button>
        </Field>

        <Field
          label="Show next word preview"
          helper="Reveal the upcoming word in the celebration popup when Auto-Continue is on"
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNextWordPreview ? " is-on" : ""}`}
            aria-checked={draft.showNextWordPreview}
            aria-label="Show next word preview"
            onClick={() => update({ showNextWordPreview: !draft.showNextWordPreview })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNextWordPreview ? "On" : "Off"}
            </span>
          </button>
        </Field>

        <div class="wh-settings__notif-header">
          <Eyebrow>Notifications</Eyebrow>
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.notificationsEnabled ? " is-on" : ""}`}
            aria-checked={draft.notificationsEnabled}
            aria-label="In-page notifications"
            title="All notifications"
            onClick={() => update({ notificationsEnabled: !draft.notificationsEnabled })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
          </button>
        </div>

        <Field
          label="Auto-Continue started"
          helper="brief confirmation when Auto-Continue begins a new hunt"
        >
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showAutoModeToast ? " is-on" : ""}`}
            aria-checked={draft.showAutoModeToast}
            aria-label="Auto-Continue started"
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showAutoModeToast: !draft.showAutoModeToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">{draft.showAutoModeToast ? "On" : "Off"}</span>
          </button>
        </Field>

        <Field label="Hint reminder" helper="shown after the hint delay passes with no find">
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showHintToast ? " is-on" : ""}`}
            aria-checked={draft.showHintToast}
            aria-label="Hint reminder"
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showHintToast: !draft.showHintToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">{draft.showHintToast ? "On" : "Off"}</span>
          </button>
        </Field>

        <Field label="No paragraphs" helper="shown when the page has no suitable text">
          <button
            type="button"
            role="switch"
            class={`wh-settings__switch${draft.showNoParagraphToast ? " is-on" : ""}`}
            aria-checked={draft.showNoParagraphToast}
            aria-label="No paragraphs"
            disabled={!draft.notificationsEnabled}
            onClick={() => update({ showNoParagraphToast: !draft.showNoParagraphToast })}
          >
            <span class="wh-settings__switch-track">
              <span class="wh-settings__switch-thumb" />
            </span>
            <span class="wh-settings__switch-state">
              {draft.showNoParagraphToast ? "On" : "Off"}
            </span>
          </button>
        </Field>
      </div>

      {isDirty && (
        <div class="wh-settings__footer">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
