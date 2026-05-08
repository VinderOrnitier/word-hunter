# PRD: Chrome Extension "Word Hunter"

## Problem Statement

The user wants to play a simple casual game while browsing any website: find a hidden word embedded in the page text. There is currently no tool that invisibly injects a word into page content and tests the reader's attentiveness.

## Solution

A Chrome extension that automatically inserts a player-chosen word into a random position within a sufficiently long text block on any web page. The word looks like ordinary text and is invisible to the browser's built-in search (Ctrl+F). The player reads the text and tries to find the word. Upon finding it — a celebration animation plays and the result is recorded in statistics.

## User Stories

1. As a player, I want to choose an active word list (Animals or Pokémon), so that I can vary the theme of the game.
2. As a player, I want to select a word from the active list, so that I can start playing without extra configuration.
3. As a player, I want to type a custom word not in the list, so that I can diversify the game.
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
14. As a player, I want to see a link to the page where I found the word, so that I can return to it later.
15. As a player, I want the hint timer to start counting from the moment the page containing the inserted word is loaded.
16. As a player, I want to choose the next word myself after finding the current one (or press "new word"), rather than having it change automatically.
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
- Click on the span → registers the word as found, writes to statistics, clears the active word

**5. Statistics Store**
- `chrome.storage.local` for persistence
- Record structure: `{ word, foundAt (timestamp), pageUrl, pageTitle, searchDurationSeconds, hintUsed }`
- Full list of all found words

**6. Popup UI**
- Tab "Play": current active word, "Change word" button, dropdown with word list + custom input field
- Tab "Statistics": table of found words (word, date, search duration, hint used, link to page)
- Tab "Settings": hint timer duration (minutes), hover duration for celebration tooltip (seconds)

### Word Lists

The player selects an active list; the word is then chosen from that list.

**Animals (default):**
cat, elephant, fox, wolf, eagle, bear, giraffe, tiger, dolphin, hedgehog, zebra, kangaroo, lion, penguin, owl, crocodile, flamingo, peacock

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

## Out of Scope

- Cross-browser sync (Chrome Sync)
- Multiplayer or leaderboard
- Support for other browsers (Firefox, Safari)
- Inserting the word into images or video
- Additional word lists beyond Animals and Pokémon (planned: expandable lists with per-word images, e.g. a photo of the Pokémon or animal)
- Binding a celebration image to a specific word (planned as a future feature tied to list expansion)
- Localization into other languages
- Binding a celebration image to a specific word (e.g. a photo of a cat for "cat")

## Further Notes

- The extension uses Manifest V3 (current Chrome standard)
- The content script must handle Single Page Applications: monitor navigation via `MutationObserver` or the `history` API
- If no suitable paragraphs exist on a page, the extension shows a notification explaining why the word was not hidden; the extension popup also has a "Rules" tab explaining what qualifies as a valid paragraph
- Celebration GIFs are stored as static assets bundled with the extension (not fetched from the internet)
