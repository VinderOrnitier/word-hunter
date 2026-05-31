import type { MessageKey } from "../types";

export const ja: Record<MessageKey, string> = {
  // Header
  header_rules_aria: "ルール",

  // Tabs nav
  tab_play: "プレイ",
  tab_stats: "統計",
  tab_settings: "設定",

  // Bottom action bar
  action_bar_auto_continue_title: "オート続行 — 発見ごとに次の単語を自動選択",
  action_bar_auto_continue_aria: "オート続行",
  action_bar_start: "ハントを開始",
  action_bar_shuffle_title: "ランダムな単語を選ぶ",
  action_bar_shuffle_aria: "ランダムな単語を選ぶ",
  action_bar_custom_title: "カスタム単語",
  action_bar_custom_aria: "カスタム単語",

  // Active word card
  active_word_empty_eyebrow: "アクティブな単語なし",
  active_word_empty_hint: "下から単語を選んでハントを開始してください。",
  active_word_eyebrow: "アクティブな単語",
  active_word_stop_title: "ハントを停止",
  active_word_stop_aria: "アクティブな単語をクリア",

  // Reload hint
  reload_hint_info_title: "設定で無効にできます。",
  reload_hint_text: "再起動して開始してください",
  reload_hint_reload: "再読み込み",
  reload_hint_dismiss_aria: "閉じる",

  // Progress row
  progress_aria_label: "進捗: {total}語中{caught}語発見、{achTotal}個中{unlocked}個の実績解除",
  progress_streak_eyebrow: "ストリーク",
  progress_current_label: "現在",
  progress_longest_label: "最長",
  progress_achievements_eyebrow: "実績",

  // Confirm overlay
  confirm_yes: "はい",

  // Custom word modal
  custom_word_backdrop_aria: "ダイアログを閉じる",
  custom_word_dialog_aria: "カスタム単語",
  custom_word_heading: "カスタム単語",
  custom_word_close_aria: "閉じる",
  custom_word_close_title: "閉じる",
  custom_word_field_label: "単語",
  custom_word_placeholder: "serendipity",
  custom_word_cancel: "キャンセル",
  custom_word_submit: "ハントを開始",

  // Play tab
  play_list_animals: "動物",
  play_list_pokemon: "ポケモン",
  play_filter_all: "すべて",
  play_filter_caught: "発見済み",
  play_filter_uncaught: "未発見",
  play_word_list_aria: "単語リスト",
  play_filter_aria: "フィルター",

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

  // Stats tab
  stats_empty_body: "まだ単語が見つかっていません。",
  stats_empty_editorial: "ハントの記録がここに表示されます。",
  stats_n_hunts: "{count}回のハント",
  stats_col_word: "単語",
  stats_col_found: "発見",
  stats_col_duration_tooltip: "所要時間",
  stats_col_hint_header: "ヒント",
  stats_col_page: "ページ",
  stats_hint_used_aria: "ヒント使用",
  stats_no_hint_aria: "ヒントなし",
  stats_hint_used_tooltip: "ヒント使用",
  stats_no_hint_tooltip: "ヒントなし",
  stats_clear: "クリア",
  stats_clear_confirm: "すべてのハントをクリアしますか？",

  // Rules tab
  rules_editorial: "読書中の静かなゲーム。",
  rules_body:
    "Word Hunterは、訪問したすべてのページのテキストのどこかにアクティブワードを隠します。普通のテキストのように見えます。読みながら探してください。クリックして捕まえましょう。",
  rules_step_1: "リストから単語を選ぶ",
  rules_step_2: "「ハントを開始」を押す",
  rules_step_3: "ページを更新して読み始める",
  rules_settings: "設定タブで難易度を調整して体験をカスタマイズできます。",
  rules_disclaimer:
    "すべてのページが対応しているわけではありません。サイトのマークアップやスクリプトによっては、単語が正しく挿入されない場合があります。その場合は設定を調整してみてください。",

  // Settings tab
  settings_language_label: "言語",
  settings_min_paragraph_label: "最小段落長",
  settings_min_paragraph_helper: "この単語数未満の段落はスキップされます",
  settings_hint_delay_label: "ヒント遅延",
  settings_hint_delay_helper: "ページを開いてからヒントが表示されるまでの時間（分）",
  settings_hint_delay_unit: "分",
  settings_cursor_delay_label: "カーソル表示遅延",
  settings_cursor_delay_helper: "カーソルで単語が表示されるまでのホバー時間（秒）",
  settings_cursor_delay_unit: "秒",
  settings_reload_hint_label: "再読み込みヒント",
  settings_reload_hint_helper: "ハント開始後にページの再読み込みを促すメッセージ",
  settings_next_word_preview_label: "次の単語プレビューを表示",
  settings_next_word_preview_helper: "オート続行がオンのとき、祝福ポップアップに次の単語を表示する",
  settings_notifications_eyebrow: "通知",
  settings_notifications_aria: "ページ内通知",
  settings_notifications_title: "すべての通知",
  settings_auto_continue_label: "オート続行を開始",
  settings_auto_continue_helper: "オート続行が新しいハントを開始したときの簡単な確認",
  settings_hint_reminder_label: "ヒントリマインダー",
  settings_hint_reminder_helper: "発見がないままヒント遅延が過ぎたときに表示",
  settings_no_paragraphs_label: "段落なし",
  settings_no_paragraphs_helper: "ページに適切なテキストがないときに表示",
  settings_switch_on: "オン",
  settings_switch_off: "オフ",
  settings_cancel: "キャンセル",
  settings_save: "保存",

  // InPageToast (shared aria labels)
  toast_open_aria: "Word Hunterを開く",
  toast_dismiss_aria: "閉じる",
  toast_find_aria: "単語を見つける",

  // Content-script toasts
  content_no_paragraph_message: "単語を隠すのに十分なテキストがありません。",
  content_auto_mode_toast: "オートハント中",
  content_hint_toast: "単語はこのページに隠されています。",

  // CelebrationPopup
  celebration_found_headline: "発見！",
  celebration_hint_used: "ヒント使用",
  celebration_no_hint: "ヒントなし",
  celebration_next_label: "次の単語",
  celebration_remove_word: "単語を削除",
};
