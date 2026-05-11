// Statistics tab — table of HuntRecords.

const { useState: useStateStats } = React;

function StatsTab({ records, setRecords }) {
  const [hovered, setHovered] = useStateStats(null);

  if (records.length === 0) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Icon name="search" size={28} />
        <div style={{ fontFamily: "var(--wh-font-sans)", fontSize: 14, color: "var(--wh-fg-2)" }}>No words found yet.</div>
        <div style={{ fontFamily: "var(--wh-font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--wh-fg-3)", textAlign: "center", lineHeight: 1.5 }}>
          your hunts will appear here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 6px",
      }}>
        <Eyebrow>{records.length} hunts</Eyebrow>
        <Button variant="ghost" size="sm" leftIcon="trash" onClick={() => setRecords([])}>Clear</Button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--wh-font-sans)", fontSize: 12 }}>
        <thead>
          <tr>
            {["Word","Found","Time","Hint","Page"].map(h => (
              <th key={h} style={{
                textAlign: "left", fontSize: 10, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--wh-fg-3)", padding: "0 8px 8px",
                borderBottom: "1px solid var(--wh-border)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? "var(--wh-surface-2)" : "transparent",
                transition: "background var(--wh-dur-fast) var(--wh-ease-standard)",
              }}>
              <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--wh-border-soft)" }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: LIST_DOT[r.list], marginRight: 8, verticalAlign: "middle" }}/>
                <span style={{ fontFamily: "var(--wh-font-mono)", color: "var(--wh-fg)", fontWeight: 500 }}>{r.word}</span>
              </td>
              <td style={{ padding: "10px 8px", color: "var(--wh-fg-3)", fontFamily: "var(--wh-font-mono)", fontSize: 11, borderBottom: "1px solid var(--wh-border-soft)" }}>{formatRelative(r.foundAt)}</td>
              <td style={{ padding: "10px 8px", color: "var(--wh-fg-2)", fontFamily: "var(--wh-font-mono)", fontSize: 11, borderBottom: "1px solid var(--wh-border-soft)" }}>{formatDuration(r.searchDurationSeconds)}</td>
              <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--wh-border-soft)" }}>
                {r.hintUsed
                  ? <span style={{ color: "var(--wh-hint)", fontSize: 10, fontWeight: 600 }}>used</span>
                  : <span style={{ color: "var(--wh-fg-4)", fontSize: 10 }}>—</span>}
              </td>
              <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--wh-border-soft)" }}>
                <a href={r.pageUrl} target="_blank" rel="noopener" style={{
                  color: "var(--wh-hint)", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
                }}>
                  {r.pageTitle}
                  <Icon name="external" size={10} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { StatsTab });
