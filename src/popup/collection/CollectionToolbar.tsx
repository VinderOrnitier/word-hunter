import type { JSX } from "preact";
import type { WordListName } from "../word-lists";
import type { CollectionFilter } from "./types";

interface CollectionToolbarProps {
  list: WordListName;
  filter: CollectionFilter;
  onListChange: (next: WordListName) => void;
  onFilterChange: (next: CollectionFilter) => void;
}

const LIST_CHIPS: Array<{ value: WordListName; label: string }> = [
  { value: "animals", label: "Animals" },
  { value: "pokemon", label: "Pokémon" },
];

const FILTER_CHIPS: Array<{ value: CollectionFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "caught", label: "Caught" },
  { value: "uncaught", label: "Uncaught" },
];

export function CollectionToolbar({
  list,
  filter,
  onListChange,
  onFilterChange,
}: CollectionToolbarProps): JSX.Element {
  return (
    <div class="wh-collection-toolbar">
      <div class="wh-chip-group" role="tablist" data-group="list" aria-label="Word list">
        {LIST_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            role="tab"
            class={`wh-chip${list === chip.value ? " is-selected" : ""}`}
            aria-selected={list === chip.value}
            onClick={() => onListChange(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div class="wh-chip-group" role="tablist" data-group="filter" aria-label="Filter">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            role="tab"
            class={`wh-chip${filter === chip.value ? " is-selected" : ""}`}
            aria-selected={filter === chip.value}
            onClick={() => onFilterChange(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
