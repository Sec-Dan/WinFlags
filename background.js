const perTabCounters = {};

// When the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    totalFlags: 0,
    installDate: new Date().toISOString()
  });
});

// Listen for flag replacements from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "flagsReplaced") {
    const { replaced } = message;
    const tabId = sender.tab.id;

    // Keep count per tab to handle multiple passes
    if (!perTabCounters[tabId]) {
      perTabCounters[tabId] = {
        total: 0,
        savedToStorage: 0
      };
    }

    perTabCounters[tabId].total += replaced;

    // Update badge
    chrome.action.setBadgeText({
      text: perTabCounters[tabId].total.toString(),
      tabId
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#FF0000",
      tabId
    });

    // Add only the delta to the lifetime total
    const delta = perTabCounters[tabId].total - perTabCounters[tabId].savedToStorage;
    if (delta > 0) {
      chrome.storage.local.get(["totalFlags"], (data) => {
        const updatedTotal = (data.totalFlags || 0) + delta;
        chrome.storage.local.set({ totalFlags: updatedTotal });
        perTabCounters[tabId].savedToStorage = perTabCounters[tabId].total;
      });
    }
  }
});

// Reset per-tab counter on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    delete perTabCounters[tabId];
    chrome.action.setBadgeText({ text: "", tabId });
  }
});

// Clean up when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  delete perTabCounters[tabId];
});
