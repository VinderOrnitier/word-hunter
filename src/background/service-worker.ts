import { refreshFlags } from "../shared/feature-flags";
import type { ActiveWord } from "../shared/types";

export type ActiveWordChangedMessage = {
  type: "ACTIVE_WORD_CHANGED";
  activeWord: ActiveWord | null;
};

export type OpenPopupMessage = {
  type: "OPEN_POPUP";
};

chrome.runtime.onMessage.addListener((message: OpenPopupMessage | ActiveWordChangedMessage) => {
  if (message?.type === "OPEN_POPUP") {
    chrome.action.openPopup().catch(() => {});
  }
});

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

chrome.runtime.onInstalled.addListener(() => {
  void refreshFlags();
  chrome.alarms.create("refresh-flags", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh-flags") {
    void refreshFlags();
  }
});
