import type { MessageKey } from "../types";

export const uk: Record<MessageKey, string> = {
  // Header
  header_rules_aria: "Правила",

  // Tabs nav
  tab_play: "Гра",
  tab_stats: "Статистика",
  tab_settings: "Налаштування",

  // Bottom action bar
  action_bar_auto_continue_title: "Авто-продовження — вибирає наступне слово після кожної знахідки",
  action_bar_auto_continue_aria: "Авто-продовження",
  action_bar_start: "Почати",
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
  reload_hint_text: "Оновіть сторінку, щоб почати.",
  reload_hint_reload: "Оновити",
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
  custom_word_submit: "Почати",

  // Play tab
  play_list_animals: "Тварини",
  play_list_pokemon: "Pokémon",
  play_filter_all: "Всі",
  play_filter_caught: "Знайдені",
  play_filter_uncaught: "Не знайдені",
  play_word_list_aria: "Список слів",
  play_filter_aria: "Фільтр",

  // Pokédex Play surface (theme-specific voice — EN fallback)
  pdx_active_now_hunting: "Now hunting",
  pdx_active_no_hunt: "No hunt",
  pdx_active_empty_hint: "pick a slot below to start.",
  pdx_progress_caught_label: "CGHT",
  pdx_filter_label: "Show",
  pdx_filter_all: "All",
  pdx_filter_caught: "CGHT",
  pdx_filter_uncaught: "MISS",
  pdx_collection_empty_caught: "No catches — go hunt!",
  pdx_collection_empty_uncaught: "All caught!",
  pdx_reload_hint_text: "Reload to hunt",
  pdx_custom_word_prompt: "Enter your own word to hunt",
  pdx_custom_word_helper: "no spaces · 2-25 letters · won't appear in your collection",
  pdx_custom_word_submit: "Start",
  pdx_unsaved_edits: "Unsaved edits",

  // Stats tab
  stats_empty_body: "Слів ще не знайдено.",
  stats_empty_editorial: "ваші полювання з'являться тут.",
  stats_n_hunts: "{count} полювань",
  stats_col_word: "Слово",
  stats_col_found: "Знайдено",
  stats_col_duration_tooltip: "Тривалість",
  stats_col_hint_header: "Підк",
  stats_col_page: "Сайт",
  stats_hint_used_aria: "підказка використана",
  stats_no_hint_aria: "без підказки",
  stats_hint_used_tooltip: "Підказка використана",
  stats_no_hint_tooltip: "Без підказки",
  stats_clear: "Очистити",
  stats_clear_confirm: "Очистити всі полювання?",

  // Rules tab
  rules_editorial: "тиха гра під час читання.",
  rules_body:
    "Word Hunter ховає активне слово кудись у тексті кожної сторінки, яку ви відвідуєте. Воно вписується як звичайний текст. Знайдіть його під час читання. Клацніть, щоб зафіксувати знахідку.",
  rules_step_1: "Оберіть слово зі списку",
  rules_step_2: "Натисніть «Почати»",
  rules_step_3: "Перезавантажте сторінку і починайте читати",
  rules_settings: "Налаштуйте складність і персоналізуйте досвід у вкладці налаштувань.",
  rules_disclaimer:
    "Не кожна сторінка співпрацює — верстка або скрипти деяких сайтів можуть завадити слову вставитись коректно або взагалі. Якщо так сталося, спробуйте змінити налаштування.",

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
  toast_find_aria: "Знайти слово",

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
