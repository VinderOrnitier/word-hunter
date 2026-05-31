export const en = {
  // Header
  header_rules_aria: "Rules",

  // Tabs nav
  tab_play: "Play",
  tab_stats: "Statistics",
  tab_settings: "Settings",

  // Bottom action bar
  action_bar_auto_continue_title: "Auto-continue — pick next word after each find",
  action_bar_auto_continue_aria: "Auto-continue",
  action_bar_start: "Start a hunt",
  action_bar_shuffle_title: "Pick a random word",
  action_bar_shuffle_aria: "Pick a random word",
  action_bar_custom_title: "Custom word",
  action_bar_custom_aria: "Custom word",

  // Active word card
  active_word_empty_eyebrow: "No active word",
  active_word_empty_hint: "pick a word below to start the hunt.",
  active_word_eyebrow: "Active word",
  active_word_stop_title: "Stop hunt",
  active_word_stop_aria: "Clear active word",

  // Reload hint
  reload_hint_info_title: "Can be disabled in Settings.",
  reload_hint_text: "Reload the page to begin hunting.",
  reload_hint_reload: "Reload",
  reload_hint_dismiss_aria: "Dismiss",

  // Progress row
  progress_aria_label:
    "Progress: {caught} of {total} words caught, {unlocked} of {achTotal} achievements unlocked",
  progress_streak_eyebrow: "Streak",
  progress_current_label: "current",
  progress_longest_label: "longest",
  progress_achievements_eyebrow: "Achievements",

  // Confirm overlay
  confirm_yes: "Yes",

  // Custom word modal
  custom_word_backdrop_aria: "Close dialog",
  custom_word_dialog_aria: "Custom word",
  custom_word_heading: "Custom word",
  custom_word_close_aria: "Close",
  custom_word_close_title: "Close",
  custom_word_field_label: "Word",
  custom_word_placeholder: "serendipity",
  custom_word_cancel: "Cancel",
  custom_word_submit: "Start hunt",

  // Play tab
  play_list_animals: "Animals",
  play_list_pokemon: "Pokémon",
  play_filter_all: "All",
  play_filter_caught: "Caught",
  play_filter_uncaught: "Uncaught",
  play_word_list_aria: "Word list",
  play_filter_aria: "Filter",

  // Pokédex Play surface (theme-specific voice)
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
  stats_empty_body: "No words found yet.",
  stats_empty_editorial: "your hunts will appear here.",
  stats_n_hunts: "{count} hunts",
  stats_col_word: "Word",
  stats_col_found: "Found",
  stats_col_duration_tooltip: "Duration",
  stats_col_hint_header: "Hint",
  stats_col_page: "Page",
  stats_hint_used_aria: "hint used",
  stats_no_hint_aria: "no hint",
  stats_hint_used_tooltip: "Hint used",
  stats_no_hint_tooltip: "No hint",
  stats_clear: "Clear",
  stats_clear_confirm: "Clear all hunts?",

  // Rules tab
  rules_editorial: "a quiet game while you read.",
  rules_body:
    "Word Hunter hides the active word somewhere inside the text of every page you visit. It blends in like normal text. Find it by reading. Click it to catch it.",
  rules_step_1: "Pick a word from the list",
  rules_step_2: "Press Start a hunt",
  rules_step_3: "Reload the page and start reading",
  rules_settings: "Adjust the difficulty and fine-tune your experience in the Settings tab.",
  rules_disclaimer:
    "Not every page cooperates — some sites' markup or scripts may prevent the word from inserting correctly, or at all. If that happens, try adjusting the settings.",

  // Settings tab
  settings_language_label: "Language",
  settings_min_paragraph_label: "Minimum paragraph length",
  settings_min_paragraph_helper: "paragraphs below this word count are skipped",
  settings_hint_delay_label: "Hint delay",
  settings_hint_delay_helper: "minutes the page is open before the hint tooltip shows",
  settings_hint_delay_unit: "min",
  settings_cursor_delay_label: "Cursor reveal delay",
  settings_cursor_delay_helper: "seconds of hovering before the cursor reveals the word",
  settings_cursor_delay_unit: "s",
  settings_reload_hint_label: "Reload hint",
  settings_reload_hint_helper: "prompt to reload the page after starting a hunt",
  settings_next_word_preview_label: "Show next word preview",
  settings_next_word_preview_helper:
    "Reveal the upcoming word in the celebration popup when Auto-Continue is on",
  settings_notifications_eyebrow: "Notifications",
  settings_notifications_aria: "In-page notifications",
  settings_notifications_title: "All notifications",
  settings_auto_continue_label: "Auto-Continue started",
  settings_auto_continue_helper: "brief confirmation when Auto-Continue begins a new hunt",
  settings_hint_reminder_label: "Hint reminder",
  settings_hint_reminder_helper: "shown after the hint delay passes with no find",
  settings_no_paragraphs_label: "No paragraphs",
  settings_no_paragraphs_helper: "shown when the page has no suitable text",
  settings_switch_on: "On",
  settings_switch_off: "Off",
  settings_cancel: "Cancel",
  settings_save: "Save",

  // InPageToast (shared aria labels)
  toast_open_aria: "Open Word Hunter",
  toast_dismiss_aria: "Dismiss",
  toast_find_aria: "Find word",

  // Content-script toasts
  content_no_paragraph_message: "Not enough text to hide the word.",
  content_auto_mode_toast: "Auto-Hunter active",
  content_hint_toast: "The word is hidden on this page.",

  // CelebrationPopup
  celebration_found_headline: "Found!",
  celebration_hint_used: "hint used",
  celebration_no_hint: "no hint",
  celebration_next_label: "Next up",
  celebration_remove_word: "Remove word",
} as const;
