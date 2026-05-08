# Word Hunter — Build Roadmap

## Phase 0 — Setup ✅
- [x] Dev environment: Node 24, pnpm 11, TypeScript, Vite + @crxjs/vite-plugin, Jest + jsdom
- [x] GitHub repo created: https://github.com/VinderOrnitier/word-hunter
- [x] gh CLI authenticated (VinderOrnitier)
- [x] **Step 1** — `/grill-with-docs` — lock down domain glossary in `CONTEXT.md` (Word, ActiveWord, WordList, Paragraph, HiddenWord, HintTimer, FindEvent, HuntRecord)
- [x] **Step 2** — `/setup-matt-pocock-skills` — configure issue tracker, triage labels, domain docs

## Phase 1 — Planning
- [x] **Step 3** — `/to-issues` — break PRD into vertical slices → GitHub issues #1–#14

## Phase 2 — Prototypes (validate risky decisions before coding)
- [x] **Step 4** — `/prototype` — verify Ctrl+F bypass technique (CSS `::before` + empty text nodes) → confirmed: `data-char` spans with empty text nodes are invisible to `TreeWalker(NodeFilter.SHOW_TEXT)`
- [ ] **Step 5** — `/prototype` — validate celebration tooltip UX (2-3 layout variants)

## Phase 3 — Implementation (TDD, one module at a time)
- [ ] **Step 6a** — `/tdd` — `ParagraphSelector`: returns paragraphs with 50+ words
- [ ] **Step 6b** — `/tdd` — `WordRenderer`: word visible via CSS but absent from DOM text nodes
- [ ] **Step 6c** — `/tdd` — `StatisticsStore`: find record contains all required fields
- [ ] **Step 6d** — `/tdd` — `HintTimer`: fires after configured duration, sets hintUsed flag

## Phase 4–6 — Ongoing (bugs, features, architecture)
- `/diagnose` — for hard bugs (SPA navigation, double inserts, timer drift)
- `/triage` — sort incoming GitHub issues
- `/to-issues` + `/tdd` — standard cycle for every new feature
- `/improve-codebase-architecture` — run after 3+ modules exist
- `/zoom-out` — when lost in the codebase

## Key technical decisions (from PRD)
- Manifest V3, permissions: `storage`, `activeTab`, `scripting`
- Ctrl+F bypass: each letter in `<span data-char="x">`, rendered via `::before { content: attr(data-char) }`, empty text node inside
- SPA support: `MutationObserver` or `history` API
- Stats persistence: `chrome.storage.local`
- Hint timer state: `sessionStorage` (resets per page load)
- Test stack: Jest + jsdom, verify bypass via `TreeWalker` with `NodeFilter.SHOW_TEXT`
