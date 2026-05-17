import type { JSX } from "preact";
import type { GameSettings } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { useStorage } from "../hooks/useStorage";
import { Field } from "../components/Field";
import { Input } from "../components/Input";

export function SettingsTab(): JSX.Element {
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);

  const update = (patch: Partial<GameSettings>): void => {
    setSettings({ ...settings, ...patch });
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
            value={settings.minWordThreshold}
            style={{
              background: `linear-gradient(to right, var(--wh-primary) 0%, var(--wh-primary) ${((settings.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) ${((settings.minWordThreshold - 30) / 120) * 100}%, var(--wh-surface-2) 100%)`,
            }}
            onInput={(e) =>
              update({ minWordThreshold: Number((e.target as HTMLInputElement).value) })
            }
          />
          <span class="wh-settings__range-value">{settings.minWordThreshold}</span>
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
              value={String(settings.hintDelayMinutes)}
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
              value={String(settings.celebrationHoverSeconds)}
              onInput={(v) => update({ celebrationHoverSeconds: Number(v) })}
            />
          </div>
          <span class="wh-settings__unit">s</span>
        </div>
      </Field>

    </div>
  );
}
