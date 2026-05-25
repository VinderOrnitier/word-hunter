import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { ActiveWord } from "../../shared/types";
import { CollectionGrid } from "../collection/CollectionGrid";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import { pickRandomWord } from "../collection/pickRandomWord";
import type { CollectionFilter } from "../collection/types";
import { BottomActionBar } from "../components/BottomActionBar";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useStorage } from "../hooks/useStorage";
import { ActiveWordCard } from "../play/ActiveWordCard";
import { CustomWordModal } from "../play/CustomWordModal";
import { ProgressRow } from "../play/ProgressRow";
import { ReloadHint } from "../play/ReloadHint";
import { WORD_LISTS, type WordListName } from "../word-lists";

const LIST_CHIPS: Array<{ value: WordListName; labelKey: MessageKey }> = [
  { value: "animals", labelKey: "play_list_animals" },
  { value: "pokemon", labelKey: "play_list_pokemon" },
];

const FILTER_CHIPS: Array<{ value: CollectionFilter; labelKey: MessageKey }> = [
  { value: "all", labelKey: "play_filter_all" },
  { value: "caught", labelKey: "play_filter_caught" },
  { value: "uncaught", labelKey: "play_filter_uncaught" },
];

export function PlayTab(): JSX.Element {
  const t = useT();
  const [activeWord, setActiveWord] = useStorage("activeWord", null);
  const [finds] = useStorage("finds", []);
  const [list, setList] = useStorage("selectedList", "animals");
  const [settings, setSettings] = useStorage("settings", DEFAULT_SETTINGS);
  const flags = useFeatureFlags();

  useEffect(() => {
    if (!flags.pokemon && list === "pokemon") {
      void chrome.storage.local.set({ selectedList: "animals" });
    }
  }, [flags.pokemon, list]);

  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [customOpen, setCustomOpen] = useState(false);
  const [pendingWord, setPendingWord] = useState<string | null>(null);
  const [showReloadBanner, setShowReloadBanner] = useState(false);

  const counts = useMemo(() => computeCatchCounts(finds, list), [finds, list]);
  const stats = useMemo(
    () => computeCollectionStats(counts, WORD_LISTS[list].length),
    [counts, list]
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
    if (settings.showReloadHint) setShowReloadBanner(true);
  };

  const handleReload = (): void => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.location.reload(),
        });
      }
    });
    setShowReloadBanner(false);
  };

  const shufflePick = (): void => {
    const word = pickRandomWord(list, counts, "uncaught");
    setPendingWord(word);
  };

  const submitCustom = (word: string): void => {
    const next: ActiveWord = { word, list: "custom", insertedAt: Date.now() };
    setActiveWord(next);
    setCustomOpen(false);
    if (settings.showReloadHint) setShowReloadBanner(true);
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
        {showReloadBanner && activeWord && (
          <ReloadHint onReload={handleReload} onDismiss={() => setShowReloadBanner(false)} />
        )}

        <ActiveWordCard activeWord={activeWord} onClear={clear} />

        <div
          class="wh-chip-group"
          role="tablist"
          data-group="list"
          aria-label={t("play_word_list_aria")}
        >
          {LIST_CHIPS.filter((chip) => chip.value !== "pokemon" || flags.pokemon).map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
              aria-selected={list === chip.value}
              onClick={() => setList(chip.value)}
            >
              {t(chip.labelKey)}
            </button>
          ))}
        </div>

        <ProgressRow stats={stats} streak={streak} achievements={achievements} />

        <div
          class="wh-chip-group"
          role="tablist"
          data-group="filter"
          aria-label={t("play_filter_aria")}
        >
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              class={`wh-chip${filter === chip.value ? " is-selected" : ""}`}
              aria-selected={filter === chip.value}
              onClick={() => setFilter(chip.value)}
            >
              {t(chip.labelKey)}
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
        autoContinue={settings.autoContinue}
        onAutoContinue={toggleAutoContinue}
      />

      <CustomWordModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
      />
    </div>
  );
}
