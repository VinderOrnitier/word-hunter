import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { PopupHeader } from "./components/PopupHeader";
import { PopupHeaderPdx } from "./components/PopupHeader.pdx";
import { type TabId, Tabs } from "./components/Tabs";
import { TabsPdx } from "./components/Tabs.pdx";
import { useTheme } from "./hooks/useTheme";
import { PlayTab } from "./tabs/PlayTab";
import { PlayTabPdx } from "./tabs/PlayTab.pdx";
import { RulesTab } from "./tabs/RulesTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SettingsTabPdx } from "./tabs/SettingsTab.pdx";
import { StatsTab } from "./tabs/StatsTab";
import { StatsTabPdx } from "./tabs/StatsTab.pdx";
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

  const panels = (
    <>
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
    </>
  );

  if (theme === "pokedex") {
    return (
      <ThemeContext.Provider value={theme}>
        <div class="pdx">
          <div class="pdx-popup">
            <PopupHeaderPdx onRules={handleRules} rulesActive={active === "rules"} />
            <TabsPdx active={active} onNavigate={handleTabNavigate} />
            <div class="pdx-popup__ridge" />
            {active === "play" ? (
              <PlayTabPdx />
            ) : active === "stats" ? (
              <StatsTabPdx />
            ) : active === "settings" ? (
              <SettingsTabPdx />
            ) : (
              <div class="pdx-popup__body">
                <div class="pdx-popup__body-inner">{panels}</div>
              </div>
            )}
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div class="wh-popup wh">
        <PopupHeader onRules={handleRules} rulesActive={active === "rules"} />
        <Tabs active={active} onNavigate={handleTabNavigate} />
        <main class="wh-popup__main">{panels}</main>
      </div>
    </ThemeContext.Provider>
  );
}
