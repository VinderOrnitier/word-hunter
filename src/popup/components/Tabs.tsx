import type { JSX } from "preact";
import { Icon, type IconName } from "./Icon";

export type TabId = "play" | "stats" | "settings" | "rules";

interface TabDescriptor {
  id: Exclude<TabId, "rules">;
  label: string;
  icon: IconName;
}

const TABS: TabDescriptor[] = [
  { id: "play", label: "Play", icon: "search" },
  { id: "stats", label: "Statistics", icon: "bar-chart" },
  { id: "settings", label: "Settings", icon: "settings" },
];

interface TabsProps {
  active: TabId;
  onNavigate: (next: TabId) => void;
}

export function Tabs({ active, onNavigate }: TabsProps): JSX.Element {
  return (
    <nav class="wh-tabs" role="tablist">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive ? "true" : "false"}
            class={`wh-tab${isActive ? " wh-tab--active" : ""}`}
            onClick={() => onNavigate(tab.id)}
          >
            <Icon name={tab.icon} size={14} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
