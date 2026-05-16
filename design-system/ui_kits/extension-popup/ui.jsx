// Atoms — Word Hunter popup
// Loaded as type=text/babel; exports to window at the bottom.

const { useState } = React;

// ---------- Icon ----------
function Icon({ name, size = 16 }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 2,
    strokeLinecap: "round", strokeLinejoin: "round"
  };
  switch (name) {
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>;
    case "bar-chart":
      return <svg {...props}><path d="M3 3v18h18"/><path d="M7 14v4M12 9v9M17 4v14"/></svg>;
    case "settings":
      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case "info":
      return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case "trash":
      return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case "external":
      return <svg {...props}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>;
    case "refresh":
      return <svg {...props}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>;
    case "duration":
      return <svg {...props}><circle cx="12" cy="13" r="8" data-om-id="41e6c60d:51"></circle><path d="M12 9v4l2.5 2.5" data-om-id="41e6c60d:52"></path><path d="M9 2h6" data-om-id="41e6c60d:53"></path><path d="M12 2v3" data-om-id="41e6c60d:54"></path></svg>;
    default: return null;
  }
}

// ---------- Eyebrow ----------
function Eyebrow({ children }) {
  return <div style={popupStyles.eyebrow}>{children}</div>;
}

// ---------- Button ----------
function Button({ variant = "secondary", size = "md", children, onClick, disabled, leftIcon }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const base = {
    fontFamily: "var(--wh-font-sans)",
    fontWeight: 600,
    border: "1px solid transparent",
    borderRadius: "var(--wh-radius-2)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "background var(--wh-dur-base) var(--wh-ease-standard), color var(--wh-dur-base) var(--wh-ease-standard)",
    display: "inline-flex", alignItems: "center", gap: 8,
    boxShadow: focus ? "var(--wh-shadow-glow)" : "none",
    outline: "none",
  };
  const sizes = {
    sm: { fontSize: 11, padding: "6px 10px" },
    md: { fontSize: 13, padding: "8px 14px" },
    lg: { fontSize: 14, padding: "11px 18px" },
  };
  const variants = {
    primary: {
      background: hover ? "#FFDC5C" : "var(--wh-primary)",
      color: "var(--wh-on-primary)",
    },
    secondary: {
      background: hover ? "var(--wh-surface-3)" : "var(--wh-surface-2)",
      color: "var(--wh-fg)",
      borderColor: "var(--wh-border)",
    },
    ghost: {
      background: hover ? "var(--wh-surface-2)" : "transparent",
      color: hover ? "var(--wh-fg)" : "var(--wh-fg-2)",
    },
    danger: {
      background: hover ? "rgba(255,107,107,0.22)" : "var(--wh-danger-soft)",
      color: "var(--wh-danger)",
      borderColor: "var(--wh-danger)",
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
    >
      {leftIcon && <Icon name={leftIcon} size={14} />}
      {children}
    </button>
  );
}

// ---------- Input ----------
function Input({ value, onChange, placeholder, mono, type = "text", min, step }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type={type} min={min} step={step}
      value={value} onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        fontFamily: mono ? "var(--wh-font-mono)" : "var(--wh-font-sans)",
        fontSize: 13,
        color: "var(--wh-fg)",
        background: "var(--wh-surface-2)",
        border: `1px solid ${focus ? "var(--wh-primary)" : "var(--wh-border)"}`,
        borderRadius: "var(--wh-radius-2)",
        padding: "9px 12px",
        outline: "none",
        boxShadow: focus ? "var(--wh-shadow-glow)" : "none",
        width: "100%", boxSizing: "border-box",
      }}
    />
  );
}

// ---------- Select ----------
function Select({ value, onChange, options }) {
  const [focus, setFocus] = useState(false);
  return (
    <select
      value={value} onChange={(e) => onChange?.(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        fontFamily: "var(--wh-font-sans)",
        fontSize: 13,
        color: "var(--wh-fg)",
        background: "var(--wh-surface-2)",
        border: `1px solid ${focus ? "var(--wh-primary)" : "var(--wh-border)"}`,
        borderRadius: "var(--wh-radius-2)",
        padding: "9px 12px",
        outline: "none",
        boxShadow: focus ? "var(--wh-shadow-glow)" : "none",
        width: "100%", boxSizing: "border-box",
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%238C95B0' stroke-width='1.5' stroke-linecap='round'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 30,
      }}
    >
      {options.map(opt => {
        const v = typeof opt === "string" ? opt : opt.value;
        const l = typeof opt === "string" ? opt : opt.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

// ---------- Field ----------
function Field({ label, helper, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "var(--wh-font-sans)", fontSize: 11, fontWeight: 600,
        color: "var(--wh-fg-2)", textTransform: "uppercase", letterSpacing: "0.06em"
      }}>{label}</label>
      {children}
      {helper && <span style={{
        fontFamily: "var(--wh-font-sans)", fontSize: 11, color: "var(--wh-fg-3)"
      }}>{helper}</span>}
    </div>
  );
}

// ---------- Badge ----------
function Badge({ children, tone = "neutral", dot }) {
  const tones = {
    neutral: { bg: "var(--wh-surface-2)", fg: "var(--wh-fg-2)", bd: "var(--wh-border)" },
    animals: { bg: "var(--wh-found-soft)", fg: "var(--wh-found)", bd: "rgba(94,227,161,0.4)" },
    pokemon: { bg: "rgba(255,138,194,0.15)", fg: "var(--wh-list-pokemon)", bd: "rgba(255,138,194,0.4)" },
    hint:    { bg: "var(--wh-hint-soft)",   fg: "var(--wh-hint)",   bd: "rgba(138,180,255,0.4)" },
    primary: { bg: "var(--wh-primary-soft)", fg: "var(--wh-primary)", bd: "rgba(255,210,63,0.4)" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--wh-font-sans)", fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }}></span>}
      {children}
    </span>
  );
}

// ---------- Card ----------
function Card({ children, padding = 16 }) {
  return (
    <div style={{
      background: "var(--wh-surface)",
      border: "1px solid var(--wh-border)",
      borderRadius: "var(--wh-radius-3)",
      boxShadow: "var(--wh-shadow-2)",
      padding,
      display: "flex", flexDirection: "column", gap: 10,
    }}>{children}</div>
  );
}

// ---------- Highlight ----------
function Highlight({ children, tone = "primary" }) {
  const color = tone === "found" ? "var(--wh-found)" : "var(--wh-primary)";
  return (
    <span style={{
      backgroundImage: `linear-gradient(180deg, transparent 0, transparent 55%, ${color} 55%, ${color} 92%, transparent 92%)`,
      padding: "0 2px",
      color: "var(--wh-fg)",
    }}>{children}</span>
  );
}

const popupStyles = {
  eyebrow: {
    fontFamily: "var(--wh-font-sans)",
    fontSize: 10, fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--wh-fg-3)",
  },
};

Object.assign(window, { Icon, Eyebrow, Button, Input, Select, Field, Badge, Card, Highlight });
