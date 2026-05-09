import { PlayTab } from "./play-tab";
import { StatsTab } from "./stats-tab";
import { SettingsTab } from "./settings-tab";

const app = document.getElementById("app")!;

type TabName = "play" | "stats" | "settings";

const tabs: Record<TabName, { instance: PlayTab | StatsTab | SettingsTab | null }> = {
  play: { instance: null },
  stats: { instance: null },
  settings: { instance: null },
};

async function showTab(name: TabName): Promise<void> {
  app.innerHTML = "";

  if (name === "play") {
    const tab = new PlayTab(app);
    tabs.play.instance = tab;
    await tab.init();
  } else if (name === "stats") {
    const tab = new StatsTab(app);
    tabs.stats.instance = tab;
    await tab.init();
  } else if (name === "settings") {
    const tab = new SettingsTab(app);
    tabs.settings.instance = tab;
    await tab.init();
  }
}

document.querySelectorAll<HTMLButtonElement>("nav button[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    showTab(btn.dataset.tab as TabName);
  });
});

showTab("play");
