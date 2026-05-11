// Celebration popup — appears when the player clicks the hidden word.
// `art` is an optional emoji string OR an image URL up to 100×100. Falls
// back to the body-only layout if not provided.

function CelebrationPopup({ visible, word, durationS, hintUsed, art, onDismiss }) {
  if (!visible) return null;
  const isImage = typeof art === "string" && /^(https?:|\/|data:|\.\.?\/)/.test(art);
  return (
    <div onClick={onDismiss} style={{
      position: "fixed", inset: 0, zIndex: 2147483000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.18)",
      animation: "hw-fade 200ms var(--wh-ease-standard) both",
    }}>
      <div style={{
        background: "rgba(11,15,25,0.92)",
        border: "1px solid var(--wh-found)",
        borderRadius: "var(--wh-radius-3)",
        padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
        boxShadow: "var(--wh-shadow-3), var(--wh-shadow-glow-found)",
        backdropFilter: "blur(12px)",
        minWidth: 240,
        animation: "hw-pop 360ms var(--wh-ease-pop) both",
      }}>
        {art && (
          <div aria-hidden="true" style={{
            width: 84, height: 84, flex: "0 0 auto",
            borderRadius: "var(--wh-radius-2)",
            background: "var(--wh-surface-2)",
            border: "1px solid var(--wh-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 56, lineHeight: 1, overflow: "hidden",
          }}>
            {isImage
              ? <img src={art} alt="" style={{ maxWidth: 100, maxHeight: 100, width: "100%", height: "100%", objectFit: "contain" }}/>
              : art /* emoji */}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--wh-font-sans)", fontSize: 20, fontWeight: 700, color: "var(--wh-found)" }}>
            Found!
          </span>
          <span style={{ fontFamily: "var(--wh-font-mono)", fontSize: 16, fontWeight: 600, color: "var(--wh-fg)" }}>
            {word}
          </span>
          <div style={{ display: "flex", gap: 10, fontFamily: "var(--wh-font-mono)", fontSize: 11, color: "var(--wh-fg-3)" }}>
            <span>{durationS}s</span>
            <span style={{ color: "var(--wh-fg-4)" }}>·</span>
            <span>{hintUsed ? "hint used" : "no hint"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CelebrationPopup });
