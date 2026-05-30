import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { PopupHeader } from "./components/PopupHeader";
import { type TabId, Tabs } from "./components/Tabs";
import { useTheme } from "./hooks/useTheme";
import { PlayTab } from "./tabs/PlayTab";
import { RulesTab } from "./tabs/RulesTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { StatsTab } from "./tabs/StatsTab";
import { ThemeContext } from "./theme/ThemeContext";

export function App(): JSX.Element {
  const theme = useTheme();
  const [active, setActive] = useState<TabId>("play");

  function handleTabNavigate(next: TabId): void {
    setActive(next);
  }

  function handleRules(): void {
    setActive((prev) => (prev === "rules" ? "play" : "rules"));
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div class={`wh-popup ${theme === "pokedex" ? "pdx" : "wh"}`}>
        <PopupHeader onRules={handleRules} rulesActive={active === "rules"} />
        <Tabs active={active} onNavigate={handleTabNavigate} />
        <main class="wh-popup__main">
          {active === "play" && (
            <div class="wh-tab-panel wh-tab-panel--play" data-testid="tab-panel-play">
              <PlayTab />
            </div>
          )}
          {active === "stats" && (
            <div class="wh-tab-panel" data-testid="tab-panel-stats">
              <StatsTab />
            </div>
          )}
          {active === "settings" && (
            <div class="wh-tab-panel wh-tab-panel--settings" data-testid="tab-panel-settings">
              <SettingsTab />
            </div>
          )}
          {active === "rules" && (
            <div class="wh-tab-panel" data-testid="tab-panel-rules">
              <RulesTab />
            </div>
          )}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
