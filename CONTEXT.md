# Word Hunter

A Chrome extension where the player searches for a hidden word embedded invisibly in page text.

## Language

**Word**:
A string candidate from a `WordList` (e.g. "cat", "Pikachu").
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
A set of adjacent sibling prose elements within the same parent whose combined word count meets the `MinWordThreshold`. The unit from which a `Paragraph` is selected for `ActiveWord` insertion. Structural, navigational, and heading elements (e.g. `<nav>`, `<h1>`–`<h6>`) do not form or contribute to a ParagraphGroup. Elements hidden from the user (not rendered, zero dimensions) are excluded.
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

**FindEvent**:
The player's click on a `HiddenWord` that registers the discovery and ends the current search. Immediately clears the `ActiveWord` from storage — other tabs remove their `HiddenWord` at this point, not when the `CelebrationPopup` is dismissed.
_Avoid_: click event, discovery event, word found

**ReviewClick**:
A subsequent click on a `HiddenWord` that is already in its found state. Re-shows the `CelebrationPopup` so the player can review the result (art, duration), but does not create a new `HuntRecord`.
_Avoid_: second click, repeat click, re-find

**HuntRecord**:
The record created after a `FindEvent`, stored in statistics. Contains: `word`, `foundAt`, `pageUrl`, `pageTitle`, `searchDurationSeconds`, `hintUsed`.
_Avoid_: stat entry, find record, discovery

## Relationships

- A **WordList** contains many **Words**
- The player selects one **Word** from the active **WordList** to become the **ActiveWord**
- One **ActiveWord** exists at a time across all tabs
- A **ParagraphGroup** contains one or more adjacent prose **Paragraphs** whose combined word count meets the **MinWordThreshold**
- A **HiddenWord** is the DOM representation of the **ActiveWord** inside a **Paragraph**
- A **FindEvent** on a **HiddenWord** produces one **HuntRecord** and immediately clears the **ActiveWord**
- A **ReviewClick** on an already-found **HiddenWord** replays the **CelebrationPopup** without producing a new **HuntRecord**
- A **HintTimer** runs per page that contains a **HiddenWord**

## Example dialogue

> **Dev:** "When the player picks 'Pikachu' from the Pokémon list, does the ActiveWord change immediately?"
> **Domain expert:** "Yes — selecting a Word from a WordList makes it the ActiveWord right away. The old HiddenWord on any open tab is replaced."
>
> **Dev:** "What if the page has no Paragraph?"
> **Domain expert:** "No HiddenWord is inserted. The player sees a notification explaining why."

## Flagged ambiguities

- "word" was used loosely to mean both the string candidate and the thing currently being searched — resolved: `Word` (candidate) vs `ActiveWord` (what's live).
- "find" was used for both hovering and clicking — resolved: `FindEvent` is only the click that registers the discovery; hover is a UI detail, not a domain concept.
