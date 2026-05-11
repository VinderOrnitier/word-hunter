// Play tab — the main game-loop surface.

const { useState: useStatePlay } = React;

function PlayTab({ activeWord, setActiveWord }) {
  const [list, setList] = useStatePlay("animals");
  const [picked, setPicked] = useStatePlay(WORD_LISTS["animals"][0]);
  const [custom, setCustom] = useStatePlay("");

  const onListChange = (next) => {
    setList(next);
    setPicked(WORD_LISTS[next][0]);
  };

  const submit = () => {
    const word = custom.trim() || picked;
    if (!word) return;
    setActiveWord({
      word,
      list: custom.trim() ? "custom" : list,
      insertedAt: Date.now(),
    });
    setCustom("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      {activeWord ? (
        <Card>
          <Eyebrow>Active word</Eyebrow>
          <span style={{
            fontFamily: "var(--wh-font-mono)", fontSize: 26, fontWeight: 700,
            letterSpacing: "-0.01em", color: "var(--wh-fg)",
          }}>
            {activeWord.word}
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--wh-font-sans)", fontSize: 11, color: "var(--wh-fg-3)",
          }}>
            <Badge tone={activeWord.list === "pokemon" ? "pokemon" : activeWord.list === "animals" ? "animals" : "neutral"}
                   dot={LIST_DOT[activeWord.list]}>
              {LIST_LABEL[activeWord.list]}
            </Badge>
            <span style={{ color: "var(--wh-fg-4)" }}>·</span>
            <span>hidden across all your tabs</span>
          </div>
        </Card>
      ) : (
        <Card>
          <Eyebrow>No active word</Eyebrow>
          <span style={{ fontFamily: "var(--wh-font-serif)", fontStyle: "italic", fontSize: 16, color: "var(--wh-fg-2)", lineHeight: 1.5 }}>
            pick a word below to start the hunt.
          </span>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Field label="Word list">
              <Select value={list} onChange={onListChange}
                options={[{ value: "animals", label: "Animals" }, { value: "pokemon", label: "Pokémon" }]} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Word">
              <Select value={picked} onChange={setPicked}
                options={WORD_LISTS[list]} />
            </Field>
          </div>
        </div>

        <Field label="Custom word" helper="overrides the list selection">
          <Input value={custom} onChange={setCustom} placeholder="type your own…" mono />
        </Field>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Button variant="primary" onClick={submit} leftIcon="refresh">New word</Button>
          <Button variant="ghost" onClick={() => setActiveWord(null)}>Clear</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlayTab });
