import type { JSX } from "preact";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { Icon, type IconName } from "./Icon";
import type { TabId } from "./Tabs";

interface TabDescriptor {
  id: Exclude<TabId, "rules">;
  labelKey: MessageKey;
  icon: IconName;
}

const TABS: TabDescriptor[] = [
  { id: "play", labelKey: "tab_play", icon: "search" },
  { id: "stats", labelKey: "tab_stats", icon: "bar-chart" },
  { id: "settings", labelKey: "tab_settings", icon: "settings" },
];

interface TabsProps {
  active: TabId;
  onNavigate: (next: TabId) => void;
}

export function TabsPdx({ active, onNavigate }: TabsProps): JSX.Element {
  const t = useT();
  return (
    <nav class="pdx-popup__tabs">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive ? "true" : "false"}
            class={`pdx-popup__tab${isActive ? " is-active" : ""}`}
            onClick={() => onNavigate(tab.id)}
          >
            <Icon name={tab.icon} size={14} />
            <span class="pdx-popup__tab-label">{t(tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
