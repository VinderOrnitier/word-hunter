# ADR 002 — ParagraphGroup-based paragraph selection

**Status:** Accepted  
**Date:** 2026-05-15

## Context

The original `ParagraphSelector` returned any DOM element with 50+ words of `innerText`, regardless of tag or visibility. This caused `ActiveWord` to be inserted into structurally invalid locations: headings, navigation menus, link text, collapsed dropdowns, and invisible elements. Style inheritance was also broken — `WordRenderer` copied computed style from the paragraph container rather than from the direct parent of the selected text node.

## Decision

**ParagraphGroup algorithm (Variant A over Variant B).**  
Rather than simply lowering the word threshold and selecting individual elements, the selector groups adjacent sibling prose elements under the same parent. A group qualifies when its combined word count meets the `MinWordThreshold` (default 30). This correctly handles articles where multiple short `<p>` elements form a single readable section, without selecting the parent container itself (which could include navigation or other non-prose siblings).

**Group break elements** (start a new group or end the current one): `h1`–`h6`, `hr`, `figure`, `table`, `ul`, `ol`, `blockquote`, `nav`, `aside`. `<img>` and empty/whitespace-only elements are not breaks — they are skipped over.

**Excluded container tags** (never contribute to a ParagraphGroup): `h1`–`h6`, `nav`, `header`, `footer`, `aside`, `menu`, `button`, `select`, `textarea`, `input`, `label`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `ul`, `ol`, `figure`, `figcaption`, `iframe`, `script`, `style`, `noscript`. `li`, `blockquote`, `pre`, `article`, `section`, `main`, `div` are allowed.

**Visibility check:** an element is excluded if any of the following are true: `display: none`, `visibility: hidden`, `opacity: 0`, or `offsetWidth === 0 && offsetHeight === 0`.

**Text node skip list:** within the selected Paragraph, text nodes whose closest ancestor is one of `a`, `button`, `code`, `kbd`, `samp`, `var`, `abbr`, `acronym` are skipped for insertion. Inline styling elements (`strong`, `em`, `span`, `mark`, etc.) are allowed.

**Style inheritance fix:** computed style is taken from `textNode.parentElement`, not from the Paragraph container. Inherited properties: `fontFamily`, `fontSize`, `color`, `lineHeight`, `fontWeight`, `fontStyle`.

**Interface change:** `ParagraphSelector` now returns `Element[][]` (array of ParagraphGroups). `WordRenderer` accepts `Element[][]`, picks a random group, then a random element within it.

**MinWordThreshold** is stored in `GameSettings` and exposed in SettingsTab as a range input (min 30, max 150, step 10, default 30).

## Considered Options

- **Variant B** — lower threshold to 30 words for individual elements. Rejected because it doesn't solve the case of multiple short adjacent `<p>` elements that together form readable prose, and it would select more single-element containers that happen to hit the threshold without being proper prose sections.
