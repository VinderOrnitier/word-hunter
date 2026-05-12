// Sticky-top tab nav for the popup.

function Tabs({ active, onChange }) {
  const tabs = [
    { id: "play",     label: "Play",       icon: "search" },
    { id: "stats",    label: "Statistics", icon: "bar-chart" },
    { id: "settings", label: "Settings",   icon: "settings" },
  ];
  return (
    <nav style={{
      display: "flex", gap: 0,
      borderBottom: "1px solid var(--wh-border)",
      background: "var(--wh-bg)",
      position: "sticky", top: 0, zIndex: 2,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              fontFamily: "var(--wh-font-sans)",
              fontSize: 12, fontWeight: 600,
              color: isActive ? "var(--wh-fg)" : "var(--wh-fg-3)",
              padding: "12px 14px",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              position: "relative",
              display: "flex", alignItems: "center", gap: 8,
              flex: 1, justifyContent: "center",
            }}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
            {isActive && (
              <span style={{
                position: "absolute", left: 8, right: 8, bottom: -1,
                height: 2, background: "var(--wh-primary)",
                borderRadius: "2px 2px 0 0",
              }}/>
            )}
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Tabs });
