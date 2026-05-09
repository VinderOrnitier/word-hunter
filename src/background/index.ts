import type { ActiveWord } from "../shared/types";

export type ActiveWordChangedMessage = {
  type: "ACTIVE_WORD_CHANGED";
  activeWord: ActiveWord | null;
};

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("activeWord" in changes)) return;

  const message: ActiveWordChangedMessage = {
    type: "ACTIVE_WORD_CHANGED",
    activeWord: (changes.activeWord.newValue as ActiveWord) ?? null,
  };

  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, message);
      }
    }
  });
});
