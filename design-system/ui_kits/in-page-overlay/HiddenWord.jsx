// HiddenWord — invisible to Ctrl+F via ::before trick.

function HiddenWord({ word, found, onFind }) {
  const color = found ? "var(--wh-found)" : "var(--wh-primary)";
  const bg = `linear-gradient(180deg, transparent 0, transparent 55%, ${color} 55%, ${color} 92%, transparent 92%)`;
  return (
    <span
      className="hw-word"
      data-word={word}
      onClick={onFind}
      style={{
        cursor: "pointer",
        backgroundImage: found ? bg : "none",
        padding: "0 2px",
        transition: "background-image var(--wh-dur-base) var(--wh-ease-standard)",
      }}>
      {[...word].map((c, i) => (
        <span key={i} className="hw-char" data-char={c}
          style={{ font: "inherit", color: "inherit" }}/>
      ))}
    </span>
  );
}

Object.assign(window, { HiddenWord });
