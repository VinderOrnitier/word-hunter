import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useT } from "../../i18n";
import type { MessageKey } from "../../i18n/types";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import type { ActiveWord } from "../../shared/types";
import { CollectionGridPdx } from "../collection/CollectionGrid.pdx";
import { computeCatchCounts } from "../collection/computeCatchCounts";
import { computeCollectionStats } from "../collection/computeCollectionStats";
import { computeStreak } from "../collection/computeStreak";
import { listAchievements } from "../collection/listAchievements";
import { pickRandomWord } from "../collection/pickRandomWord";
import type { CollectionFilter } from "../collection/types";
import { BottomActionBarPdx } from "../components/BottomActionBar.pdx";
import { Icon } from "../components/Icon";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useStorage } from "../hooks/useStorage";
import { ActiveWordCardPdx } from "../play/ActiveWordCard.pdx";
import { CustomWordModalPdx } from "../play/CustomWordModal.pdx";
import { ProgressRowPdx } from "../play/ProgressRow.pdx";
import { ReloadHintPdx } from "../play/ReloadHint.pdx";
import { WORD_LISTS, type WordListName } from "../word-lists";

const LIST_CHIPS: Array<{ value: WordListName; labelKey: MessageKey }> = [
  { value: "animals", labelKey: "play_list_animals" },
  { value: "pokemon", labelKey: "play_list_pokemon" },
];

const PDX_FILTER_CHIPS: Array<{ value: CollectionFilter; labelKey: MessageKey }> = [
  { value: "all", labelKey: "pdx_filter_all" },
  { value: "caught", labelKey: "pdx_filter_caught" },
  { value: "uncaught", labelKey: "pdx_filter_uncaught" },
];

export function PlayTabPdx(): JSX.Element {
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

  const availableLists = useMemo(
    () =>
      LIST_CHIPS.filter((chip) => chip.value !== "pokemon" || flags.pokemon).map((chip) => {
        const listCounts = computeCatchCounts(finds, chip.value);
        const listStats = computeCollectionStats(listCounts, WORD_LISTS[chip.value].length);
        return { value: chip.value, labelKey: chip.labelKey, caught: listStats.caught };
      }),
    [finds, flags.pokemon]
  );

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
    <>
      <div class="pdx-popup__body">
        <div class="pdx-popup__body-inner">
          {showReloadBanner && activeWord && (
            <ReloadHintPdx onReload={handleReload} onDismiss={() => setShowReloadBanner(false)} />
          )}
          <ActiveWordCardPdx activeWord={activeWord} onClear={clear} />

          <div class="pdx-list-selector" role="tablist" aria-label={t("play_word_list_aria")}>
            {availableLists.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                class={`pdx-list-key${list === item.value ? " is-active" : ""}`}
                aria-selected={list === item.value}
                onClick={() => setList(item.value)}
              >
                <Icon name="bookmark" size={11} />
                {t(item.labelKey)}
                <span class="pdx-list-key__count">{item.caught}</span>
              </button>
            ))}
          </div>

          <ProgressRowPdx stats={stats} streak={streak} achievements={achievements} />

          <div class="pdx-filter" role="tablist" aria-label={t("play_filter_aria")}>
            <span class="pdx-filter__label">{t("pdx_filter_label")}</span>
            {PDX_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                role="tab"
                class={`pdx-filter__key${filter === chip.value ? " is-active" : ""}`}
                aria-selected={filter === chip.value}
                onClick={() => setFilter(chip.value)}
              >
                {t(chip.labelKey)}
              </button>
            ))}
          </div>

          <CollectionGridPdx
            list={list}
            filter={filter}
            counts={counts}
            activeWord={activeWordValue}
            pendingWord={pendingWord}
            onPick={pickFromCollection}
          />
        </div>
      </div>

      <BottomActionBarPdx
        onStart={startHunt}
        onShuffle={shufflePick}
        onCustom={() => setCustomOpen(true)}
        startDisabled={pendingWord === null}
        autoContinue={settings.autoContinue}
        onAutoContinue={toggleAutoContinue}
      />

      <CustomWordModalPdx
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
      />
    </>
  );
}
