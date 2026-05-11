// Settings tab.

const { useState: useStateSet } = React;

function SettingsTab() {
  const [hint, setHint] = useStateSet(5);
  const [hover, setHover] = useStateSet(1.5);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Hint delay" helper="minutes the page is open before the hint tooltip shows">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90 }}>
            <Input type="number" min={1} step={1} value={hint} onChange={(v) => setHint(Number(v))} />
          </div>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 12, color: "var(--wh-fg-3)" }}>min</span>
        </div>
      </Field>

      <Field label="Celebration hover" helper="seconds you must hover before the popup appears">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90 }}>
            <Input type="number" min={0.1} step={0.1} value={hover} onChange={(v) => setHover(Number(v))} />
          </div>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 12, color: "var(--wh-fg-3)" }}>s</span>
        </div>
      </Field>

      <div style={{ height: 1, background: "var(--wh-border-soft)", margin: "4px 0" }}/>

      <Eyebrow>Danger zone</Eyebrow>
      <Button variant="danger" leftIcon="trash" size="sm">Clear all hunts</Button>
    </div>
  );
}

Object.assign(window, { SettingsTab });
