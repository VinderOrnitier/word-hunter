import type { MessageKey } from "../types";

export const uk: Partial<Record<MessageKey, string>> = {
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
