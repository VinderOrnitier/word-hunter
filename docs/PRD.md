# PRD: Chrome Extension "Word Hunter"

## Problem Statement

The user wants to play a simple casual game while browsing any website: find a hidden word embedded in the page text. There is currently no tool that invisibly injects a word into page content and tests the reader's attentiveness.

## Solution

A Chrome extension that automatically inserts a player-chosen word into a random position within a sufficiently long text block on any web page. The word looks like ordinary text and is invisible to the browser's built-in search (Ctrl+F). The player reads the text and tries to find the word. Upon finding it — a celebration animation plays and the result is recorded in statistics.

## User Stories

1. As a player, I want to choose an active word list (Animals or Pokémon), so that I can vary the theme of the game.
2. As a player, I want to see a Pokédex-style grid of every word in the active list — caught words showing their art and a catch counter, uncaught words shown as silhouettes / `???` — so that picking a new word feels like collecting a set.
3. As a player, I want to filter the grid to only my caught or uncaught words, so that I can quickly see what's left to hunt.
4. As a player, I want to type a custom word not in the list, so that I can diversify the game. The field accepts any Unicode letters and hyphens (min 2, max 25 characters). Validation errors appear only after I attempt to submit, then update in real-time as I correct the word. Custom words do not count toward the collection.
3. As a player, I want the chosen word to appear automatically on every web page when it loads, so that I don't have to configure the game each time.
4. As a player, I want the word to be inserted only into sufficiently long texts (50+ words), so that it can genuinely hide among other words.
5. As a player, I want the word to look like normal page text, so that it cannot be easily spotted visually.
6. As a player, I want the word to be undetectable by the browser's Ctrl+F search, so that the game has real challenge.
7. As a player, I want to receive a hint tooltip after a set reading time, so that I have help if I cannot find the word on my own.
8. As a player, I want to configure the hint timer duration, so that I can adjust the game difficulty.
9. As a player, I want to hover over the found word and see a celebration animation (GIF), so that I get positive reinforcement.
10. As a player, I want the celebration tooltip to appear after 1.5 seconds of hovering (configurable), not immediately, so that it confirms I genuinely found the word.
11. As a player, I want to click on the found word to register the find, so that it is recorded in my statistics.
12. As a player, I want to see statistics: how many words I found, which words, when and where I found them.
13. As a player, I want to see in statistics whether I used a hint for each found word, so that I can evaluate my progress.
13a. As a player, I want to see how many distinct words I've caught from each list (e.g. `27 / 54 Animals`) and a progress bar, so that I have a sense of overall completion.
13b. As a player, I want to see how many days in a row I've hunted at least once (my "streak") with a one-day grace period so I don't lose the streak just because I haven't played yet today, so that the game encourages a gentle daily habit.
13c. As a player, I want unlockable achievement badges for milestones — first catch, 50 %, 100 %, and 7- and 30-day streaks — with a hint tooltip telling me how to unlock each, so that long-term play feels rewarding.
14. As a player, I want to see a link to the page where I found the word, so that I can return to it later.
15. As a player, I want the hint timer to start counting from the moment the page containing the inserted word is loaded.
16. As a player, I want to choose the next word myself after finding the current one (or press "new word") by default, but with an opt-in **Auto-Continue mode** I can flip on for hands-free play — when it's on, after I find a word the next one from the same list is picked automatically (skipped for one-off custom words), so I can just reload the page and keep hunting without reopening the popup. While Auto-Continue is on, every page load shows a brief top-right toast confirming the mode and naming the current word; the celebration popup gains a "Next up: …" preview (optional, can be hidden in Settings if I'd rather discover the next word on reload).
17. As a player, I want one active word across all tabs simultaneously, so that I can search on any page.
18. As a player, I want to see a notification when a page has no suitable text blocks (no paragraphs with 50+ words), so that I know why the word is not hidden on this page.
19. As a player, I want to view a page inside the extension that explains the rules for what qualifies as a valid text block, so that I understand where the word can be hidden.

## Implementation Decisions

### Modules

**1. Manifest & Extension Shell**
- `manifest.json` (Manifest V3)
- Permissions: `storage`, `activeTab`, `scripting`
- Content script injected on all pages (`<all_urls>`)
- Popup: `popup.html` + `popup.js`

**2. Word Renderer (Content Script — core of the extension)**
- Finds all paragraphs with 50+ words on the page
- Selects a random paragraph and a random position between words
- Inserts the word via DOM manipulation: each letter in a `<span>` with a `data-char` attribute; CSS renders the text via `::before { content: attr(data-char) }`; the actual text node is empty or contains a zero-width character
- This makes the word invisible to Ctrl+F (the browser searches DOM text nodes)
- Styling inherits `font-family`, `font-size`, `color`, and `line-height` from the parent element

**3. Hint Timer**
- Starts when the page containing the inserted word loads
- State stored in `sessionStorage` (resets on each new page load)
- After the configured duration: displays a hint tooltip saying the word is present on this page
- `hintUsed` flag is stored for statistics

**4. Celebration Tooltip**
- On hover over the word span — begins a 1.5s countdown (configurable)
- After the countdown — shows a popup with a built-in celebration GIF
- Click on the span → registers the word as found, writes to statistics, then either clears the active word (default) or replaces it with the next auto-selected word (Auto-Continue mode, non-custom list)
- When Auto-Continue is on, the celebration popup includes an optional "Next up: …" preview with the next word's art and label (suppressed when the Settings spoiler-toggle is off)

**5. Statistics Store**
- `chrome.storage.local` for persistence
- Record structure: `{ word, foundAt (timestamp), pageUrl, pageTitle, searchDurationSeconds, hintUsed }`
- Full list of all found words

**6. Popup UI**
- Tab "Play": **Hunt Collection** is the primary surface. Layout is a scrollable body above a non-scrolling `BottomActionBar`.
  - **ActiveWordCard** at the top: 40 × 40 art square + `Active word` eyebrow + the word in mono, with a stop button that clears the `ActiveWord`. Renders a compact `No active word` placeholder when nothing is hunting.
  - **List chip group**: `Animals | Pokémon` (list picker).
  - **ProgressRow** (collapsible): a single button row with `caught/total` count, a slim progress bar, an achievement counter (`unlocked/total` with a star icon), and a chevron. Clicking expands an accordion with the **Streak** block (`current` vs `longest`) and the full **Achievements** list (`First catch`, `Half-way`, `Master hunter`, `7-day streak`, `30-day streak`). Locked pills are dimmed and carry a hint tooltip. Expansion is transient (not persisted).
  - **Filter chip group**: `All | Caught | Uncaught`.
  - **CollectionGrid**: 4-column for Animals (54 slots), 5-column for Pokémon (151 slots). Each slot is a button — caught slots show emoji/sprite + `×N` counter; uncaught slots show `???` (Animals) or a `brightness(0)` silhouette (Pokémon). Clicking a slot sets it as the `ActiveWord`; the matching slot gets a primary-yellow glow.
  - **BottomActionBar** (sticky, edge-to-edge): primary `Start a hunt` CTA (picks a random uncaught word from the active list, falling back to the full list if everything is caught), a `shuffle` icon button that does the same, a `pencil` icon button that opens the **CustomWordModal**, and a `↺` (refresh) icon toggle for **Auto-Continue** (`role="switch"`, `aria-label="Auto-continue"`, tooltip: "Auto-continue — pick next word after each find"). Off by default (`GameSettings.autoContinue = false`); when on, the icon glows primary-yellow. Custom-word hunts ignore the setting and always clear the active word on find.
  - **CustomWordModal**: overlay modal with a `Type a word` input (Unicode letters and hyphens only, min 2, max 25 chars; validation triggers on submit then real-time), a counter (`X / 25`), a `Cancel` ghost button, and a `Start hunt` primary button. Submitting writes the word with `list: "custom"`; custom words are **not** counted toward the collection. Closes on backdrop click, `Esc`, or the close icon; focus is trapped inside the dialog.
- Tab "Statistics": table of found words (word, date, search duration, hint used, link to page)
- Tab "Settings": hint timer duration (minutes), hover duration for celebration tooltip (seconds), minimum paragraph word threshold (range slider 30–150, default 30), and a `Show next word preview` switch that controls whether the celebration popup reveals the upcoming word while Auto-Continue is on (default on).

### Word Lists

The player selects an active list; the word is then chosen from that list.

**Animals (default):**
Alpaca, Bat, Bear, Beaver, Camel, Cat, Chameleon, Cheetah, Cow, Crocodile, Deer, Dolphin, Eagle, Elephant, Elk, Flamingo, Fox, Frog, Giraffe, Gorilla, Hamster, Hedgehog, Hippo, Horse, Iguana, Jaguar, Kangaroo, Koala, Leopard, Lion, Llama, Moose, Octopus, Otter, Owl, Panda, Parrot, Peacock, Penguin, Pig, Rabbit, Raccoon, Raven, Rhino, Shark, Skunk, Sloth, Squirrel, Tiger, Turtle, Vulture, Whale, Wolf, Zebra

**Pokémon:**
Pikachu, Bulbasaur, Charmander, Squirtle, Jigglypuff, Mewtwo, Eevee, Snorlax, Gengar, Psyduck, Machop, Alakazam, Magikarp, Gyarados, Lapras, Vaporeon, Flareon, Dragonite

### Technical Solution for Ctrl+F Bypass

```html
<!-- The hidden word span looks like this -->
<span class="hidden-word" data-word="cat">
  <span class="hw-char" data-char="c"></span>
  <span class="hw-char" data-char="a"></span>
  <span class="hw-char" data-char="t"></span>
</span>
```

```css
.hw-char::before {
  content: attr(data-char);
}
.hw-char {
  font: inherit;
  color: inherit;
}
```

Text nodes inside `.hw-char` are empty → Ctrl+F cannot find the word.

## Testing Decisions

Good tests verify behavior through public interfaces, not implementation details.

**What to test:**
- `ParagraphSelector`: given an HTML document, returns only paragraphs with 50+ words
- `WordRenderer`: after insertion, the word is visually present in the text (via `::before` CSS) but absent from DOM text nodes
- `StatisticsStore`: a record written on word discovery contains all required fields
- `HintTimer`: timer fires after the configured duration; `hintUsed` flag is set correctly

**Prior art:** unit tests via Jest + `jsdom` for DOM manipulation; Ctrl+F bypass verified via `TreeWalker` with `NodeFilter.SHOW_TEXT`.

## In Scope (Shipped)

- **Hunt Collection** Pokédex-style grid (Play tab): per-word art, catch counters, active-word glow, filter chips, all derived on-the-fly from `HuntRecord[]` with no storage migration. See [ADR 003](adr/003-hunt-collection-derivation.md).
- **Streak tracking**: consecutive-day count with a one-day grace period (a yesterday-only player still sees a 1-day streak today). See [ADR 004](adr/004-streak-grace-period.md).
- **Achievement badges** (5 of them): First catch, Half-way, Master hunter, 7-day streak, 30-day streak, with hint tooltips on locked badges.
- **Auto-Continue mode**: opt-in hands-free hunting. After a `FindEvent`, the next `ActiveWord` is auto-selected from the same list via the existing `pickRandomWord` (random uncaught, fallback to the full list). The celebration popup shows an optional `Next up: …` preview (toggleable in Settings to avoid spoilers), and a 🎯 top-right toast confirms the mode on each page load. Custom-word hunts are excluded — there is no list to cycle. See [ADR 005](adr/005-auto-continue-mode.md).

## Out of Scope

- Cross-browser sync (Chrome Sync)
- Multiplayer or leaderboard
- Support for other browsers (Firefox, Safari)
- Inserting the word into images or video
- Additional word lists beyond Animals and Pokémon
- Custom user-defined word lists (only single custom words today)
- Achievement toasts on unlock (the badge row is the only surface; the CelebrationPopup is reserved for `FindEvent`s)
- Localization into other languages

## Further Notes

- The extension uses Manifest V3 (current Chrome standard)
- The content script must handle Single Page Applications: monitor navigation via `MutationObserver` or the `history` API
- If no suitable paragraphs exist on a page, the extension shows a notification explaining why the word was not hidden; the popup has a Rules view accessible via an icon button in the header
- Celebration art is word-source-dependent: Animals words show an emoji, Pokémon words show an animated sprite fetched from the PokeAPI CDN (`raw.githubusercontent.com/PokeAPI/sprites/…`); a local placeholder image is shown on load failure
