import type { MessageKey } from "../types";

export const de: Record<MessageKey, string> = {
  // Header
  header_rules_aria: "Regeln",

  // Tabs nav
  tab_play: "Spielen",
  tab_stats: "Statistik",
  tab_settings: "Einstellungen",

  // Bottom action bar
  action_bar_auto_continue_title: "Auto-Weiter — wählt das nächste Wort nach jedem Fund",
  action_bar_auto_continue_aria: "Auto-Weiter",
  action_bar_start: "Jagd starten",
  action_bar_shuffle_title: "Zufälliges Wort wählen",
  action_bar_shuffle_aria: "Zufälliges Wort wählen",
  action_bar_custom_title: "Eigenes Wort",
  action_bar_custom_aria: "Eigenes Wort",

  // Active word card
  active_word_empty_eyebrow: "Kein aktives Wort",
  active_word_empty_hint: "Wähle unten ein Wort, um die Jagd zu beginnen.",
  active_word_eyebrow: "Aktives Wort",
  active_word_stop_title: "Jagd beenden",
  active_word_stop_aria: "Aktives Wort löschen",

  // Reload hint
  reload_hint_info_title: "Kann in den Einstellungen deaktiviert werden.",
  reload_hint_text: "Zum Starten neu starten.",
  reload_hint_reload: "Neu laden",
  reload_hint_dismiss_aria: "Schließen",

  // Progress row
  progress_aria_label:
    "Fortschritt: {caught} von {total} Wörtern gefunden, {unlocked} von {achTotal} Erfolgen freigeschaltet",
  progress_streak_eyebrow: "Serie",
  progress_current_label: "aktuell",
  progress_longest_label: "längste",
  progress_achievements_eyebrow: "Erfolge",

  // Confirm overlay
  confirm_yes: "Ja",

  // Custom word modal
  custom_word_backdrop_aria: "Dialog schließen",
  custom_word_dialog_aria: "Eigenes Wort",
  custom_word_heading: "Eigenes Wort",
  custom_word_close_aria: "Schließen",
  custom_word_close_title: "Schließen",
  custom_word_field_label: "Wort",
  custom_word_placeholder: "Glückseligkeit",
  custom_word_cancel: "Abbrechen",
  custom_word_submit: "Jagd starten",

  // Play tab
  play_list_animals: "Tiere",
  play_list_pokemon: "Pokémon",
  play_filter_all: "Alle",
  play_filter_caught: "Gefunden",
  play_filter_uncaught: "Nicht gefunden",
  play_word_list_aria: "Wortliste",
  play_filter_aria: "Filter",

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
  stats_empty_body: "Noch keine Wörter gefunden.",
  stats_empty_editorial: "deine Jagden erscheinen hier.",
  stats_n_hunts: "{count} Jagden",
  stats_col_word: "Wort",
  stats_col_found: "Gefunden",
  stats_col_duration_tooltip: "Dauer",
  stats_col_hint_header: "Hint",
  stats_col_page: "Seite",
  stats_hint_used_aria: "Hinweis verwendet",
  stats_no_hint_aria: "kein Hinweis",
  stats_hint_used_tooltip: "Hinweis verwendet",
  stats_no_hint_tooltip: "Kein Hinweis",
  stats_clear: "Löschen",
  stats_clear_confirm: "Alle Jagden löschen?",

  // Rules tab
  rules_editorial: "ein ruhiges Spiel beim Lesen.",
  rules_body:
    "Word Hunter versteckt das aktive Wort irgendwo im Text jeder Seite, die du besuchst. Es fügt sich wie normaler Text ein. Finde es beim Lesen. Klicke darauf, um es zu fangen.",
  rules_step_1: "Wähle ein Wort aus der Liste",
  rules_step_2: "Drücke «Jagd starten»",
  rules_step_3: "Lade die Seite neu und fang an zu lesen",
  rules_settings: "Passe die Schwierigkeit an und verfeinere dein Erlebnis im Einstellungen-Tab.",
  rules_disclaimer:
    "Nicht jede Seite kooperiert — das Layout oder die Skripte mancher Websites können das korrekte Einfügen des Wortes verhindern, oder es ganz verhindern. Falls das passiert, versuche die Einstellungen anzupassen.",

  // Settings tab
  settings_language_label: "Sprache",
  settings_min_paragraph_label: "Mindest-Absatzlänge",
  settings_min_paragraph_helper: "Absätze unterhalb dieser Wortanzahl werden übersprungen",
  settings_hint_delay_label: "Hinweisverzögerung",
  settings_hint_delay_helper: "Minuten bis zur Hinweis-Einblendung nach dem Öffnen der Seite",
  settings_hint_delay_unit: "min",
  settings_cursor_delay_label: "Cursor-Enthüllungsverzögerung",
  settings_cursor_delay_helper:
    "Sekunden des Schwebens bis das Wort durch den Cursor enthüllt wird",
  settings_cursor_delay_unit: "s",
  settings_reload_hint_label: "Neu-laden-Hinweis",
  settings_reload_hint_helper: "Aufforderung zum Neuladen der Seite nach dem Starten einer Jagd",
  settings_next_word_preview_label: "Nächstes Wort anzeigen",
  settings_next_word_preview_helper:
    "Zeigt das nächste Wort im Feierpopup, wenn Auto-Weiter aktiv ist",
  settings_notifications_eyebrow: "Benachrichtigungen",
  settings_notifications_aria: "Seitenbenachrichtigungen",
  settings_notifications_title: "Alle Benachrichtigungen",
  settings_auto_continue_label: "Auto-Weiter gestartet",
  settings_auto_continue_helper: "kurze Bestätigung, wenn Auto-Weiter eine neue Jagd beginnt",
  settings_hint_reminder_label: "Hinweiserinnerung",
  settings_hint_reminder_helper: "wird angezeigt, wenn die Hinweisverzögerung ohne Fund abläuft",
  settings_no_paragraphs_label: "Keine Absätze",
  settings_no_paragraphs_helper: "wird angezeigt, wenn die Seite keinen geeigneten Text hat",
  settings_switch_on: "Ein",
  settings_switch_off: "Aus",
  settings_cancel: "Abbrechen",
  settings_save: "Speichern",

  // InPageToast (shared aria labels)
  toast_open_aria: "Word Hunter öffnen",
  toast_dismiss_aria: "Schließen",
  toast_find_aria: "Wort finden",

  // Content-script toasts
  content_no_paragraph_message: "Nicht genug Text, um das Wort zu verstecken.",
  content_auto_mode_toast: "Auto-Jagd aktiv",
  content_hint_toast: "Das Wort ist auf dieser Seite versteckt.",

  // CelebrationPopup
  celebration_found_headline: "Gefunden!",
  celebration_hint_used: "Hinweis verwendet",
  celebration_no_hint: "kein Hinweis",
  celebration_next_label: "Als Nächstes",
  celebration_remove_word: "Wort entfernen",
};
