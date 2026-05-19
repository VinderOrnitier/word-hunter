import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";
import type { ActiveWord } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { WORD_LISTS, type WordListName } from "../word-lists";
import { useStorage } from "../hooks/useStorage";
import { CollectionGrid } from "../collection/CollectionGrid";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import { pickRandomWord } from "../collection/pickRandomWord";
import type { CollectionFilter } from "../collection/types";
import { ActiveWordCard } from "../play/ActiveWordCard";
import { ProgressRow } from "../play/ProgressRow";
import { CustomWordModal } from "../play/CustomWordModal";
import { BottomActionBar } from "../components/BottomActionBar";

const LIST_CHIPS: Array<{ value: WordListName; label: string }> = [
  { value: "animals", label: "Animals" },
  { value: "pokemon", label: "Pokémon" },
];

const FILTER_CHIPS: Array<{ value: CollectionFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "caught", label: "Caught" },
  { value: "uncaught", label: "Uncaught" },
];

export function PlayTab(): JSX.Element {
  const [activeWord, setActiveWord] = useStorage("activeWord", null);
  const [finds] = useStorage("finds", []);
  const [list, setList] = useStorage("selectedList", "animals");
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [customOpen, setCustomOpen] = useState(false);
  const [pendingWord, setPendingWord] = useState<string | null>(null);

  const counts = useMemo(() => computeCatchCounts(finds, list), [finds, list]);
  const stats = useMemo(
    () => computeCollectionStats(counts, WORD_LISTS[list].length),
    [counts, list],
  );
  const streak = useMemo(() => computeStreak(finds, Date.now()), [finds]);
  const achievements = useMemo(() => listAchievements(stats, streak), [stats, streak]);

  const pickFromCollection = (word: string): void => {
    setPendingWord(word);
  };

  const startHunt = (): void => {
    if (!pendingWord) return;
    setActiveWord({ word: pendingWord, list, insertedAt: Date.now() });
    setPendingWord(null);
  };

  const shufflePick = (): void => {
    const word = pickRandomWord(list, counts, "uncaught");
    setPendingWord(word);
  };

  const submitCustom = (word: string): void => {
    const next: ActiveWord = { word, list: "custom", insertedAt: Date.now() };
    setActiveWord(next);
    setCustomOpen(false);
  };

  const clear = (): void => {
    setActiveWord(null);
  };

  const toggleAutoContinue = (): void => {
    setSettings({ ...settings, autoContinue: !settings.autoContinue });
  };

  const activeWordValue = activeWord?.word ?? null;

  return (
    <div class="wh-play">
      <div class="wh-play__scroll">
        <ActiveWordCard activeWord={activeWord} onClear={clear} />

        <div class="wh-chip-group" role="tablist" data-group="list" aria-label="Word list">
          {LIST_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
              aria-selected={list === chip.value}
              onClick={() => setList(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          role="switch"
          class={`wh-auto-toggle${settings.autoContinue ? " is-on" : ""}`}
          aria-checked={settings.autoContinue}
          aria-label="Auto-Continue"
          onClick={toggleAutoContinue}
        >
          <span class="wh-auto-toggle__track">
            <span class="wh-auto-toggle__thumb" />
          </span>
          <span class="wh-auto-toggle__body">
            <span class="wh-auto-toggle__label">Auto-Continue</span>
            <span class="wh-auto-toggle__hint">Pick next word after each find</span>
          </span>
        </button>

        <ProgressRow stats={stats} streak={streak} achievements={achievements} />

        <div class="wh-chip-group" role="tablist" data-group="filter" aria-label="Filter">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${filter === chip.value ? " is-selected" : ""}`}
              aria-selected={filter === chip.value}
              onClick={() => setFilter(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <CollectionGrid
          list={list}
          filter={filter}
          counts={counts}
          activeWord={activeWordValue}
          pendingWord={pendingWord}
          onPick={pickFromCollection}
        />
      </div>

      <BottomActionBar
        onStart={startHunt}
        onShuffle={shufflePick}
        onCustom={() => setCustomOpen(true)}
        startDisabled={pendingWord === null}
      />

      <CustomWordModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
      />
    </div>
  );
}
