import { useState } from "preact/hooks";
import type { JSX } from "preact";
import type { ActiveWord, WordSource } from "../../shared/types";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { useStorage } from "../hooks/useStorage";
import { validateCustomWord, MAX_CUSTOM_LEN } from "../../shared/word-validation";
import { Card } from "../components/Card";
import { Eyebrow } from "../components/Eyebrow";
import { Badge, type BadgeTone } from "../components/Badge";
import { Field } from "../components/Field";
import { Select } from "../components/Select";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const LIST_OPTIONS = [
  { value: "animals", label: "Animals" },
  { value: "pokemon", label: "Pokémon" },
];

const LIST_LABEL: Record<WordSource, string> = {
  animals: "Animals",
  pokemon: "Pokémon",
  custom: "Custom",
};

const LIST_TONE: Record<WordSource, BadgeTone> = {
  animals: "animals",
  pokemon: "pokemon",
  custom: "neutral",
};

const LIST_DOT: Record<WordSource, string> = {
  animals: "var(--wh-list-animals)",
  pokemon: "var(--wh-list-pokemon)",
  custom: "var(--wh-fg-3)",
};

export function PlayTab(): JSX.Element {
  const [activeWord, setActiveWord] = useStorage("activeWord", null);
  const [list, setList] = useState<WordListName>("animals");
  const [picked, setPicked] = useState<string>(WORD_LISTS.animals[0]);
  const [custom, setCustom] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const trimmed = custom.trim();
  const customError = validateCustomWord(trimmed);
  const showCustomError = submitAttempted && customError !== undefined;
  const customCounter = `${trimmed.length} / ${MAX_CUSTOM_LEN}`;

  const onListChange = (next: string): void => {
    const nextList = next as WordListName;
    setList(nextList);
    setPicked(WORD_LISTS[nextList][0]);
  };

  const submit = (): void => {
    if (trimmed) {
      if (customError) {
        setSubmitAttempted(true);
        return;
      }
    }
    const word = trimmed || picked;
    if (!word) return;
    const source: WordSource = trimmed ? "custom" : list;
    const next: ActiveWord = {
      word,
      list: source,
      insertedAt: Date.now(),
    };
    setActiveWord(next);
    setCustom("");
    setSubmitAttempted(false);
  };

  const clear = (): void => {
    setActiveWord(null);
  };

  return (
    <div class="wh-play">
      {activeWord ? (
        <Card>
          <Eyebrow>Active word</Eyebrow>
          <span class="wh-word-display">{activeWord.word}</span>
          <div class="wh-play__meta">
            <Badge
              tone={LIST_TONE[activeWord.list ?? "custom"]}
              dotColor={LIST_DOT[activeWord.list ?? "custom"]}
            >
              {LIST_LABEL[activeWord.list ?? "custom"]}
            </Badge>
            <span class="wh-play__sep">·</span>
            <span class="wh-body-sm">hidden across all your tabs</span>
          </div>
        </Card>
      ) : (
        <Card>
          <Eyebrow>No active word</Eyebrow>
          <span class="wh-editorial">pick a word below to start the hunt.</span>
        </Card>
      )}

      <div class="wh-play__picker">
        <div class="wh-play__row">
          <Field label="Word list">
            <Select value={list} onChange={onListChange}>
              {LIST_OPTIONS}
            </Select>
          </Field>
          <Field label="Word">
            <Select value={picked} onChange={setPicked}>
              {WORD_LISTS[list]}
            </Select>
          </Field>
        </div>

        <Field
          label="Custom word"
          helper="overrides the list selection"
          error={showCustomError ? customError : undefined}
          counter={customCounter}
        >
          <Input
            value={custom}
            onInput={setCustom}
            placeholder="type your own…"
            mono
            error={showCustomError}
          />
        </Field>

        <div class="wh-play__actions">
          <Button variant="primary" leftIcon="refresh" onClick={submit}>
            New word
          </Button>
          <Button variant="ghost" onClick={clear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
