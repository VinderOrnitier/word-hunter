// Hint tooltip — top-right of the page after hintDelayMinutes.

function HintTooltip({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 2147483000,
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: "var(--wh-radius-2)",
      background: "rgba(11,15,25,0.92)",
      border: "1px solid var(--wh-hint)",
      backdropFilter: "blur(12px)",
      boxShadow: "var(--wh-shadow-3)",
      fontFamily: "var(--wh-font-sans)", fontSize: 12, fontWeight: 500,
      color: "var(--wh-fg)",
      animation: "hw-enter 200ms var(--wh-ease-standard) both",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--wh-hint)" }}/>
      The word is hidden on this page.
    </div>
  );
}

Object.assign(window, { HintTooltip });
