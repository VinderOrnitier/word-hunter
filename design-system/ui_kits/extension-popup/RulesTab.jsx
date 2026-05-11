// Rules tab — the editorial moment of the popup.

function RulesTab() {
  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{
        fontFamily: "var(--wh-font-serif)", fontStyle: "italic",
        fontSize: 17, lineHeight: 1.4, color: "var(--wh-fg-2)",
      }}>
        a quiet game while you read.
      </span>

      <div style={{
        fontFamily: "var(--wh-font-sans)", fontSize: 13, color: "var(--wh-fg-2)",
        lineHeight: 1.6,
      }}>
        On every page you visit, Word Hunter hides the active word inside a paragraph.
        It looks like normal text but is invisible to <code style={{ fontFamily: "var(--wh-font-mono)", fontSize: 11, padding: "1px 5px", background: "var(--wh-surface-2)", border: "1px solid var(--wh-border)", borderRadius: 4 }}>Ctrl + F</code>.
        Find it by reading. Click it to log the find.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--wh-font-mono)", fontSize: 11, color: "var(--wh-primary)", fontWeight: 600, marginTop: 2 }}>50 +</span>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 12, color: "var(--wh-fg-2)", lineHeight: 1.5 }}>words required to qualify a paragraph</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--wh-font-mono)", fontSize: 11, color: "var(--wh-primary)", fontWeight: 600, marginTop: 2 }}>1×</span>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 12, color: "var(--wh-fg-2)", lineHeight: 1.5 }}>active word at a time, across all your tabs</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--wh-font-mono)", fontSize: 11, color: "var(--wh-primary)", fontWeight: 600, marginTop: 2 }}>—</span>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 12, color: "var(--wh-fg-2)", lineHeight: 1.5 }}>no long text? no word hidden. you'll see a notification</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RulesTab });
