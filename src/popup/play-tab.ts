import { getActiveWord, setActiveWord } from "../shared/storage";
import { WORD_LISTS, WordListName } from "./word-lists";

export class PlayTab {
  constructor(private container: HTMLElement) {}

  async init(): Promise<void> {
    const activeWord = await getActiveWord();
    this.render(activeWord?.word ?? null);
  }

  private render(currentWord: string | null): void {
    this.container.innerHTML = `
      <div class="play-tab">
        <p data-testid="active-word-display">
          ${currentWord ? `Current word: <strong>${currentWord}</strong>` : "No word selected"}
        </p>
        <div class="word-picker">
          <select data-testid="word-list-selector">
            <option value="animals">Animals</option>
            <option value="pokemon">Pokémon</option>
          </select>
          <select data-testid="word-dropdown"></select>
          <input
            data-testid="custom-word-input"
            type="text"
            placeholder="Or type a custom word..."
          />
          <button data-testid="new-word-btn">New word</button>
        </div>
      </div>
    `;

    const listSelector = this.container.querySelector(
      "[data-testid='word-list-selector']"
    ) as HTMLSelectElement;
    const dropdown = this.container.querySelector(
      "[data-testid='word-dropdown']"
    ) as HTMLSelectElement;
    const customInput = this.container.querySelector(
      "[data-testid='custom-word-input']"
    ) as HTMLInputElement;
    const button = this.container.querySelector(
      "[data-testid='new-word-btn']"
    ) as HTMLButtonElement;

    this.populateDropdown(dropdown, "animals");

    listSelector.addEventListener("change", () => {
      this.populateDropdown(dropdown, listSelector.value as WordListName);
    });

    button.addEventListener("click", async () => {
      const word = customInput.value.trim() || dropdown.value;
      if (!word) return;
      await setActiveWord({ word, insertedAt: Date.now() });
      customInput.value = "";
      const display = this.container.querySelector(
        "[data-testid='active-word-display']"
      )!;
      display.innerHTML = `Current word: <strong>${word}</strong>`;
    });
  }

  private populateDropdown(dropdown: HTMLSelectElement, listName: WordListName): void {
    const words = WORD_LISTS[listName];
    dropdown.innerHTML = words
      .map((w) => `<option value="${w}">${w}</option>`)
      .join("");
  }
}
