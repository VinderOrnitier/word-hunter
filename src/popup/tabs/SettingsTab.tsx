import type { JSX } from "preact";
import type { GameSettings } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { useStorage } from "../hooks/useStorage";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";

export function SettingsTab(): JSX.Element {
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [, setFinds] = useStorage("finds", []);

  const update = (patch: Partial<GameSettings>): void => {
    setSettings({ ...settings, ...patch });
  };

  return (
    <div class="wh-settings">
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
        label="Celebration hover"
        helper="seconds you must hover before the popup appears"
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

      <div class="wh-settings__divider" />

      <Eyebrow>Danger zone</Eyebrow>
      <Button
        variant="danger"
        size="sm"
        leftIcon="trash"
        onClick={() => setFinds([])}
      >
        Clear all hunts
      </Button>
    </div>
  );
}
