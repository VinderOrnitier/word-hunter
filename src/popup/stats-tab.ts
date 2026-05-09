import { getFinds } from "../shared/storage";
import type { HuntRecord } from "../shared/types";

export class StatsTab {
  constructor(private container: HTMLElement) {}

  async init(): Promise<void> {
    const records = await getFinds();
    this.render(records);
    this.listenForUpdates();
  }

  private render(records: HuntRecord[]): void {
    if (records.length === 0) {
      this.container.innerHTML = `<p data-testid="empty-state">No words found yet.</p>`;
      return;
    }

    const sorted = [...records].sort((a, b) => b.foundAt - a.foundAt);
    this.container.innerHTML = `
      <table data-testid="stats-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Found at</th>
            <th>Duration (s)</th>
            <th>Hint used</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((r) => this.renderRow(r)).join("")}
        </tbody>
      </table>
    `;
  }

  private renderRow(record: HuntRecord): string {
    const date = new Date(record.foundAt).toLocaleString();
    return `
      <tr data-testid="stats-row">
        <td>${record.word}</td>
        <td>${date}</td>
        <td>${record.searchDurationSeconds}</td>
        <td>${record.hintUsed ? "Yes" : "No"}</td>
        <td><a href="${record.pageUrl}" target="_blank">${record.pageTitle}</a></td>
      </tr>
    `;
  }

  private listenForUpdates(): void {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes["finds"]) {
        const records = (changes["finds"].newValue as HuntRecord[]) ?? [];
        this.render(records);
      }
    });
  }
}
