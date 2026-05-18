import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";
import type { ActiveWord, WordSource } from "../../shared/types";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { useStorage } from "../hooks/useStorage";
import { validateCustomWord, MAX_CUSTOM_LEN } from "../../shared/word-validation";
import { Card } from "../components/Card";
import { Eyebrow } from "../components/Eyebrow";
import { Badge, type BadgeTone } from "../components/Badge";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { CollectionToolbar } from "../collection/CollectionToolbar";
import { ProgressHeader } from "../collection/ProgressHeader";
import { CollectionGrid } from "../collection/CollectionGrid";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import type { CollectionFilter } from "../collection/types";

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
  const [finds] = useStorage("finds", []);
  const [list, setList] = useState<WordListName>("animals");
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [custom, setCustom] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const trimmed = custom.trim();
  const customError = validateCustomWord(trimmed);
  const showCustomError = submitAttempted && customError !== undefined && trimmed.length > 0;
  const customCounter = `${trimmed.length} / ${MAX_CUSTOM_LEN}`;

  const counts = useMemo(() => computeCatchCounts(finds, list), [finds, list]);
  const stats = useMemo(
    () => computeCollectionStats(counts, WORD_LISTS[list].length),
    [counts, list],
  );
  const streak = useMemo(() => computeStreak(finds, Date.now()), [finds]);
  const achievements = useMemo(() => listAchievements(stats, streak), [stats, streak]);

  const pickFromCollection = (word: string): void => {
    const next: ActiveWord = {
      word,
      list,
      insertedAt: Date.now(),
    };
    setActiveWord(next);
  };

  const submitCustom = (): void => {
    if (!trimmed) {
      setSubmitAttempted(true);
      return;
    }
    if (customError) {
      setSubmitAttempted(true);
      return;
    }
    const next: ActiveWord = {
      word: trimmed,
      list: "custom",
      insertedAt: Date.now(),
    };
    setActiveWord(next);
    setCustom("");
    setSubmitAttempted(false);
  };

  const clear = (): void => {
    setActiveWord(null);
  };

  const activeWordValue = activeWord?.word ?? null;

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

      <CollectionToolbar
        list={list}
        filter={filter}
        onListChange={setList}
        onFilterChange={setFilter}
      />

      <ProgressHeader
        stats={stats}
        streak={streak}
        achievements={achievements}
        listLabel={LIST_LABEL[list]}
      />

      <CollectionGrid
        list={list}
        filter={filter}
        counts={counts}
        activeWord={activeWordValue}
        onPick={pickFromCollection}
      />

      <div class="wh-play__custom">
        <Field
          label="Custom word"
          helper="set your own word — not counted in the collection"
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
          <Button variant="primary" leftIcon="refresh" onClick={submitCustom}>
            New word
          </Button>
          {activeWord && (
            <Button variant="ghost" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
