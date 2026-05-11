import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { PopupHeader } from "./components/PopupHeader";
import { Tabs, type TabId } from "./components/Tabs";
import { PlayTab } from "./tabs/PlayTab";
import { StatsTab } from "./tabs/StatsTab";
import { SettingsTab } from "./tabs/SettingsTab";

function TabStub({ label }: { label: string }): JSX.Element {
  return (
    <div class="wh-tab-stub">
      <span class="wh-eyebrow">Coming soon</span>
      <p class="wh-body-sm">{label} is being migrated to Preact.</p>
    </div>
  );
}

export function App(): JSX.Element {
  const [active, setActive] = useState<TabId>("play");

  return (
    <div class="wh-popup">
      <PopupHeader />
      <Tabs active={active} onNavigate={setActive} />
      <main class="wh-popup__main">
        {active === "play" && (
          <div data-testid="tab-panel-play">
            <PlayTab />
          </div>
        )}
        {active === "stats" && (
          <div data-testid="tab-panel-stats">
            <StatsTab />
          </div>
        )}
        {active === "settings" && (
          <div data-testid="tab-panel-settings">
            <SettingsTab />
          </div>
        )}
        {active === "rules" && (
          <div data-testid="tab-panel-rules">
            <TabStub label="Rules" />
          </div>
        )}
      </main>
    </div>
  );
}
