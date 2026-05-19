# Word Hunter

A Chrome extension where the player searches for a hidden word embedded invisibly in page text.

## Language

**Word**:
A string candidate from a `WordList` (e.g. "Cat", "Pikachu").
_Avoid_: target, search term

**ActiveWord**:
The `Word` currently hidden across all tabs and being searched for by the player. Exactly one exists at a time.
_Avoid_: current word, selected word

**WordList**:
A named set of `Word` candidates the player chooses from (e.g. Animals, Pokémon).
_Avoid_: word bank, word set, category

**WordSource**:
The identifier for the origin of the `ActiveWord`: `"animals"`, `"pokemon"`, or `"custom"`. Determines which art (emoji or animated sprite) is shown in the `CelebrationPopup`.
_Avoid_: word type, list type, category

**ParagraphGroup**:
A set of adjacent sibling prose elements within the same parent whose combined word count meets the `MinWordThreshold`. The unit from which a `Paragraph` is selected for `ActiveWord` insertion. Structural, navigational, and heading elements (e.g. `<nav>`, `<h1>`–`<h6>`) do not form or contribute to a ParagraphGroup. Elements hidden from the user are excluded — this covers computed `display:none`/`visibility:hidden`/`opacity:0` (via any CSS, not just inline styles) and elements whose bounding box is smaller than 4 × 4 px (e.g. `sr-only` patterns).
_Avoid_: text section, content block, merged paragraph

**Paragraph**:
A single prose element within a `ParagraphGroup` into which the `ActiveWord` is actually hidden. Selected randomly from the group at insertion time.
_Avoid_: text block, element, node

**MinWordThreshold**:
The minimum combined word count a `ParagraphGroup` must meet to be eligible for `ActiveWord` insertion. User-configurable in Settings; default 30, range 30–150.
_Avoid_: word limit, paragraph length, threshold

**HiddenWord**:
The DOM representation of an `ActiveWord` inserted into a `Paragraph` — rendered via CSS `::before` on empty `<span>` elements, making it invisible to Ctrl+F.
_Avoid_: injected word, word span, word node

**HintTimer**:
The subsystem that starts counting when a page with a `HiddenWord` loads, displays a hint tooltip after a configured duration, and records the `hintUsed` flag.
_Avoid_: timer, hint system, countdown

**CursorRevealDelay**:
The configured duration (in seconds) the player must hover over a `HiddenWord` before the cursor changes to `pointer`, revealing the word's position. Clicking the `HiddenWord` always registers a `FindEvent` regardless of whether the cursor has changed. User-configurable in Settings.
_Avoid_: hover delay, pointer delay, cursor timer

**FindEvent**:
The player's click on a `HiddenWord` that registers the discovery and ends the current search. By default immediately clears the `ActiveWord` from storage; when `AutoContinueMode` is on for a non-`custom` `WordList`, the `ActiveWord` is replaced with the next auto-selected `Word` instead. Either way, other tabs reconcile at this point (not when the `CelebrationPopup` is dismissed).
_Avoid_: click event, discovery event, word found

**ReviewClick**:
A subsequent click on a `HiddenWord` that is already in its found state. Re-shows the `CelebrationPopup` so the player can review the result (art, duration), but does not create a new `HuntRecord`.
_Avoid_: second click, repeat click, re-find

**HuntRecord**:
The record created after a `FindEvent`, stored in statistics. Contains: `word`, `foundAt`, `pageUrl`, `pageTitle`, `searchDurationSeconds`, `hintUsed`, and the originating `list` (`WordSource`). The `list` field is what the Hunt Collection derives catch counts from.
_Avoid_: stat entry, find record, discovery

**HuntCollection**:
The Pokédex-style grid that is the Play tab body: one `CollectionSlot` per `Word` in the active `WordList`. Derived entirely on-the-fly from `HuntRecord[]` and `WORD_LISTS[list]` — there is no separate storage key for collection state.
_Avoid_: word grid, catch list, dex

**CatchCount**:
A `Map<word, number>` that records, for the active `WordList`, how many `HuntRecord`s exist for each `Word`. Records whose `list` differs from the active list are filtered out; legacy lowercase records are matched case-insensitively against the canonical Title-Case list.
_Avoid_: hit count, find count, score

**CollectionSlot**:
A single grid cell representing one `Word`. Three visual states: `caught` (catch count ≥ 1) shows the word's art — emoji for Animals, PokeAPI sprite for Pokémon — plus an `×N` counter; `uncaught` shows `???` for Animals and a `brightness(0)` silhouette of the sprite for Pokémon; `active` overlays a primary-yellow glow when the slot's word equals the `ActiveWord`. Clicking a slot sets it as the `ActiveWord`.
_Avoid_: cell, tile, card

**CollectionFilter**:
The visibility mode for the `HuntCollection`: `all`, `caught`, or `uncaught`. Selected via chip in `CollectionToolbar`.
_Avoid_: filter mode, view mode

**Streak**:
The number of consecutive local-calendar days on which the player recorded at least one `HuntRecord`. Two values are exposed: `current` (the streak that ends today or — per the grace-period rule — yesterday) and `longest` (the longest contiguous run in history). See [ADR 004](docs/adr/004-streak-grace-period.md) for the grace-period rule.
_Avoid_: streak count, consecutive days

**Achievement**:
One of five unlockable badges shown in the `ProgressRow` accordion: `First catch` (≥ 1 total catch), `Half-way` (caught ratio ≥ 0.5 for the active list), `Master hunter` (caught ratio = 1), `7-day streak`, `30-day streak`. Locked pills are dimmed and carry a hint tooltip telling the player how to unlock them. Derived from `CollectionStats` + `Streak` on every popup render.
_Avoid_: medal, milestone, trophy

**AutoContinueMode**:
The opt-in mode where, after a `FindEvent`, the system automatically picks the next `ActiveWord` from the same `WordList` (via the existing `pickRandomWord` — random uncaught, falling back to the full list when everything is caught). Lets the player keep hunting by just reloading the page — no popup interaction needed. Skipped for `WordSource = "custom"`: there is no list to cycle through, so the `ActiveWord` is cleared as in default behavior. Stored as `GameSettings.autoContinue` (default `false`), toggled from the Play tab. See [ADR 005](docs/adr/005-auto-continue-mode.md).
_Avoid_: auto-mode, autoplay, continuous mode

**NextWordPreview**:
The optional "Next up: …" section appended to the `CelebrationPopup` showing the `Word` (with art) that `AutoContinueMode` just auto-selected. Suppressed when the player prefers to discover the next `Word` only on page reload. Stored as `GameSettings.showNextWordPreview` (default `true`), toggled from Settings. Only meaningful when `AutoContinueMode` is on.
_Avoid_: spoiler, next hint, upcoming word

**AutoModeToast**:
The top-right pill notification shown on every page load while `AutoContinueMode` is active, confirming the mode is on and naming the current `ActiveWord` to hunt. Auto-dismisses after 4 seconds or on click. Mutually exclusive with `NoParagraphNotification` — when the page has no qualifying `ParagraphGroup`, the no-paragraph notification takes precedence and the `AutoModeToast` is not shown for that load.
_Avoid_: auto banner, mode indicator, hunt toast

## Relationships

- A **WordList** contains many **Words**
- The player selects one **Word** from the active **WordList** to become the **ActiveWord**
- One **ActiveWord** exists at a time across all tabs
- A **ParagraphGroup** contains one or more adjacent prose **Paragraphs** whose combined word count meets the **MinWordThreshold**
- A **HiddenWord** is the DOM representation of the **ActiveWord** inside a **Paragraph**
- A **FindEvent** on a **HiddenWord** produces one **HuntRecord** and immediately clears the **ActiveWord**
- A **ReviewClick** on an already-found **HiddenWord** replays the **CelebrationPopup** without producing a new **HuntRecord**
- A **HintTimer** runs per page that contains a **HiddenWord**
- The **HuntCollection** for a given **WordList** is derived from the subset of **HuntRecord**s whose `list` field matches that **WordList** — there is no denormalised collection state
- A **CollectionSlot** is `caught` when the **CatchCount** for its **Word** is ≥ 1, and `active` when its **Word** equals the **ActiveWord**
- A **Streak** is derived from the local-calendar dates of every **HuntRecord** regardless of which **WordList** the record came from
- An **Achievement** is derived from the **CollectionStats** of the active list and the global **Streak**
- When **AutoContinueMode** is on, a **FindEvent** on a non-custom-list **HiddenWord** auto-selects the next **Word** from the same **WordList** as the new **ActiveWord**; otherwise the **ActiveWord** is cleared
- The **NextWordPreview** in the **CelebrationPopup** mirrors the auto-selected next **Word** when **AutoContinueMode** and the spoiler-toggle are both on
- An **AutoModeToast** is shown at most once per page load while **AutoContinueMode** is on, unless the page is already showing a **NoParagraphNotification**

## Example dialogue

> **Dev:** "When the player picks 'Pikachu' from the Pokémon list, does the ActiveWord change immediately?"
> **Domain expert:** "Yes — selecting a Word from a WordList makes it the ActiveWord right away. The old HiddenWord on any open tab is replaced."
>
> **Dev:** "What if the page has no Paragraph?"
> **Domain expert:** "No HiddenWord is inserted. The player sees a notification explaining why."
>
> **Dev:** "How does the HuntCollection know that 'fox' was caught three times?"
> **Domain expert:** "It walks the HuntRecord list, keeps only the records whose list matches the active WordList, and groups them by Word — case-insensitively, so a legacy `'cat'` record still rolls up under the canonical `'Cat'` slot. Nothing is stored separately; the count is recomputed on every popup open."

## Flagged ambiguities

- "word" was used loosely to mean both the string candidate and the thing currently being searched — resolved: `Word` (candidate) vs `ActiveWord` (what's live).
- "find" was used for both hovering and clicking — resolved: `FindEvent` is only the click that registers the discovery; hover is a UI detail, not a domain concept.
- "score" / "progress" / "collection" were ambiguous across the team — resolved: `CatchCount` is the per-Word number, `CollectionStats` aggregates them, `Streak` is the calendar dimension, and `Achievement` is the unlock state. There is no single "score" value.
