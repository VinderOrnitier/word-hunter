import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { GameSettings } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { useStorage } from "../hooks/useStorage";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

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
    draft.showNextWordPreview !== saved.showNextWordPreview;

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
      <Field
        label="Minimum paragraph length"
        helper="paragraphs below this word count are skipped"
      >
        <div class="wh-settings__input-row">
          <input
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
        helper="minutes the page is open before the hint tooltip shows"
      >
        <div class="wh-settings__input-row">
          <div class="wh-settings__input-cell">
            <Input
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
        helper="seconds of hovering before the cursor reveals the word"
      >
        <div class="wh-settings__input-row">
          <div class="wh-settings__input-cell">
            <Input
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
          <span class="wh-settings__switch-state">{draft.showNextWordPreview ? "On" : "Off"}</span>
        </button>
      </Field>

      {isDirty && (
        <div class="wh-settings__footer">
          <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
        </div>
      )}
    </div>
  );
}
