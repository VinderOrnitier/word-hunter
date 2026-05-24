# Ukrainian (uk) Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete Ukrainian locale — all 98 message keys translated and type-enforced — plus the Chrome Web Store listing file.

**Architecture:** Change `uk.ts` type from `Partial<Record<MessageKey, string>>` to `Record<MessageKey, string>` so TypeScript enforces full coverage at compile time. Fill all 98 keys with Ukrainian strings. Create `_locales/uk/messages.json` for the CWS listing. Update one existing test that currently asserts uk falls back to English (it won't after this change).

**Tech Stack:** TypeScript, Jest, pnpm

---

### Task 1: Write failing tests and update the existing fallback test

**Files:**
- Create: `tests/i18n/uk.test.ts`
- Modify: `tests/i18n/t.test.ts`

- [ ] **Step 1: Write `tests/i18n/uk.test.ts`**

```ts
import { en } from "../../src/i18n/messages/en";
import { uk } from "../../src/i18n/messages/uk";
import type { MessageKey } from "../../src/i18n/types";

const enKeys = Object.keys(en) as MessageKey[];
const tokenRe = /\{(\w+)\}/g;

function tokens(s: string): string[] {
  return [...s.matchAll(tokenRe)].map((m) => m[1]).sort();
}

describe("uk translation", () => {
  it("covers every key defined in en", () => {
    for (const key of enKeys) {
      expect(uk[key]).toBeDefined();
      expect(uk[key]).not.toBe("");
    }
  });

  it("preserves placeholder tokens for keys that have them", () => {
    for (const key of enKeys) {
      const enTokens = tokens(en[key]);
      if (enTokens.length === 0) continue;
      expect(tokens(uk[key] ?? "")).toEqual(enTokens);
    }
  });
});
```

- [ ] **Step 2: Update the fallback test in `tests/i18n/t.test.ts`**

Find this block (line 27–30):
```ts
  it("falls back to English when the requested locale has no translation", () => {
    expect(t("active_word_eyebrow", "uk")).toBe("Active word");
  });
```

Replace with:
```ts
  it("falls back to English when the requested locale has no translation", () => {
    expect(t("active_word_eyebrow", "de")).toBe("Active word");
  });

  it("returns the Ukrainian translation when uk locale is selected", () => {
    expect(t("active_word_eyebrow", "uk")).toBe("Активне слово");
  });
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
pnpm test -- --testPathPattern="i18n"
```

Expected: `uk.test.ts` fails on the "covers every key" assertion because `uk.ts` is incomplete. `t.test.ts` may also fail on the new Ukrainian assertion.

---

### Task 2: Fill `uk.ts` — change type and add all 98 keys

**Files:**
- Modify: `src/i18n/messages/uk.ts`

- [ ] **Step 1: Replace the entire file contents**

```ts
import type { MessageKey } from "../types";

export const uk: Record<MessageKey, string> = {
  // Header
  header_rules_aria: "Правила",

  // Tabs nav
  tab_play: "Гра",
  tab_stats: "Статистика",
  tab_settings: "Налаштування",

  // Bottom action bar
  action_bar_auto_continue_title:
    "Авто-продовження — вибирає наступне слово після кожної знахідки",
  action_bar_auto_continue_aria: "Авто-продовження",
  action_bar_start: "Почати полювання",
  action_bar_shuffle_title: "Вибрати випадкове слово",
  action_bar_shuffle_aria: "Вибрати випадкове слово",
  action_bar_custom_title: "Власне слово",
  action_bar_custom_aria: "Власне слово",

  // Active word card
  active_word_empty_eyebrow: "Немає активного слова",
  active_word_empty_hint: "виберіть слово нижче, щоб почати полювання.",
  active_word_eyebrow: "Активне слово",
  active_word_stop_title: "Зупинити полювання",
  active_word_stop_aria: "Скинути активне слово",

  // Reload hint
  reload_hint_info_title: "Можна вимкнути в Налаштуваннях.",
  reload_hint_text: "Перезавантажте сторінку, щоб почати полювання.",
  reload_hint_reload: "Перезавантажити",
  reload_hint_dismiss_aria: "Закрити",

  // Progress row
  progress_aria_label:
    "Прогрес: {caught} з {total} слів знайдено, {unlocked} з {achTotal} досягнень розблоковано",
  progress_streak_eyebrow: "Серія",
  progress_current_label: "поточна",
  progress_longest_label: "найдовша",
  progress_achievements_eyebrow: "Досягнення",

  // Confirm overlay
  confirm_yes: "Так",

  // Custom word modal
  custom_word_backdrop_aria: "Закрити діалог",
  custom_word_dialog_aria: "Власне слово",
  custom_word_heading: "Власне слово",
  custom_word_close_aria: "Закрити",
  custom_word_close_title: "Закрити",
  custom_word_field_label: "Слово",
  custom_word_placeholder: "мрія",
  custom_word_cancel: "Скасувати",
  custom_word_submit: "Почати полювання",

  // Play tab
  play_list_animals: "Тварини",
  play_list_pokemon: "Pokémon",
  play_filter_all: "Всі",
  play_filter_caught: "Знайдені",
  play_filter_uncaught: "Не знайдені",
  play_word_list_aria: "Список слів",
  play_filter_aria: "Фільтр",

  // Stats tab
  stats_empty_body: "Слів ще не знайдено.",
  stats_empty_editorial: "ваші полювання з'являться тут.",
  stats_n_hunts: "{count} полювань",
  stats_col_word: "Слово",
  stats_col_found: "Знайдено",
  stats_col_duration_tooltip: "Тривалість",
  stats_col_hint_header: "Підказка",
  stats_col_page: "Сторінка",
  stats_hint_used_aria: "підказка використана",
  stats_no_hint_aria: "без підказки",
  stats_hint_used_tooltip: "Підказка використана",
  stats_no_hint_tooltip: "Без підказки",
  stats_clear: "Очистити",
  stats_clear_confirm: "Очистити всі полювання?",

  // Rules tab
  rules_editorial: "тиха гра під час читання.",
  rules_body_pre_kbd:
    "На кожній сторінці, яку ви відвідуєте, Word Hunter ховає активне слово всередині абзацу. Воно виглядає як звичайний текст, але невидиме для ",
  rules_body_post_kbd: ". Знайдіть його під час читання. Клацніть, щоб зафіксувати знахідку.",
  rules_item_min_words: "слів потрібно для відбору абзацу",
  rules_item_one_active: "активне слово одночасно, в усіх вкладках",
  rules_item_no_long_text: "немає довгого тексту? слово не сховане. ви побачите сповіщення",

  // Settings tab
  settings_language_label: "Мова",
  settings_min_paragraph_label: "Мінімальна довжина абзацу",
  settings_min_paragraph_helper: "абзаци з меншою кількістю слів пропускаються",
  settings_hint_delay_label: "Затримка підказки",
  settings_hint_delay_helper: "хвилин до появи підказки після відкриття сторінки",
  settings_hint_delay_unit: "хв",
  settings_cursor_delay_label: "Затримка розкриття курсором",
  settings_cursor_delay_helper: "секунд наведення до розкриття слова курсором",
  settings_cursor_delay_unit: "с",
  settings_reload_hint_label: "Підказка перезавантаження",
  settings_reload_hint_helper: "нагадування перезавантажити сторінку після початку полювання",
  settings_next_word_preview_label: "Показувати наступне слово",
  settings_next_word_preview_helper:
    "Показує наступне слово у вікні привітання, коли увімкнено Авто-продовження",
  settings_notifications_eyebrow: "Сповіщення",
  settings_notifications_aria: "Сповіщення на сторінці",
  settings_notifications_title: "Всі сповіщення",
  settings_auto_continue_label: "Авто-продовження розпочато",
  settings_auto_continue_helper:
    "коротке підтвердження, коли Авто-продовження починає нове полювання",
  settings_hint_reminder_label: "Нагадування підказки",
  settings_hint_reminder_helper: "з'являється після закінчення затримки підказки без знахідки",
  settings_no_paragraphs_label: "Немає абзаців",
  settings_no_paragraphs_helper: "з'являється, коли на сторінці немає відповідного тексту",
  settings_switch_on: "Увімк.",
  settings_switch_off: "Вимк.",
  settings_cancel: "Скасувати",
  settings_save: "Зберегти",

  // InPageToast (shared aria labels)
  toast_open_aria: "Відкрити Word Hunter",
  toast_dismiss_aria: "Закрити",

  // Content-script toasts
  content_no_paragraph_message: "Недостатньо тексту для приховування слова.",
  content_auto_mode_toast: "Авто-полювання активне",
  content_hint_toast: "Слово сховане на цій сторінці.",

  // CelebrationPopup
  celebration_found_headline: "Знайдено!",
  celebration_hint_used: "підказка використана",
  celebration_no_hint: "без підказки",
  celebration_next_label: "Наступне",
  celebration_remove_word: "Прибрати слово",
};
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
pnpm test -- --testPathPattern="i18n"
```

Expected: All tests in `tests/i18n/` pass.

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/i18n/uk.test.ts tests/i18n/t.test.ts src/i18n/messages/uk.ts
git commit -m "feat(i18n): complete Ukrainian translation — all 98 keys covered (#54)"
```

---

### Task 3: Create `_locales/uk/messages.json`

**Files:**
- Create: `_locales/uk/messages.json`

- [ ] **Step 1: Create the file**

```json
{
  "name": {
    "message": "Word Hunter"
  },
  "description": {
    "message": "Словникова гра, яка ховає слово в тексті веб-сторінки і дозволяє шукати його під час читання."
  }
}
```

- [ ] **Step 2: Run build to verify TypeScript is satisfied**

```bash
pnpm build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add _locales/uk/messages.json
git commit -m "feat(i18n): add Ukrainian CWS listing — _locales/uk/messages.json (#54)"
```
