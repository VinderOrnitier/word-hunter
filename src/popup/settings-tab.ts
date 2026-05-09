import { getSettings, saveSettings } from "../shared/storage";
import type { GameSettings } from "../shared/types";

export class SettingsTab {
  constructor(private container: HTMLElement) {}

  async init(): Promise<void> {
    const settings = await getSettings();
    this.render(settings);
  }

  private render(settings: GameSettings): void {
    this.container.innerHTML = `
      <div class="settings-tab">
        <label>
          Hint delay (minutes)
          <input data-testid="hint-delay-input" type="number" min="1" step="1" value="${settings.hintDelayMinutes}" />
        </label>
        <label>
          Celebration hover duration (seconds)
          <input data-testid="celebration-hover-input" type="number" min="0.1" step="0.1" value="${settings.celebrationHoverSeconds}" />
        </label>
      </div>
    `;

    let current = { ...settings };

    const hintInput = this.container.querySelector("[data-testid='hint-delay-input']") as HTMLInputElement;
    const hoverInput = this.container.querySelector("[data-testid='celebration-hover-input']") as HTMLInputElement;

    hintInput.addEventListener("change", async () => {
      current = { ...current, hintDelayMinutes: Number(hintInput.value) };
      await saveSettings(current);
    });

    hoverInput.addEventListener("change", async () => {
      current = { ...current, celebrationHoverSeconds: Number(hoverInput.value) };
      await saveSettings(current);
    });
  }
}
