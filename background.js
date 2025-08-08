const perTabCounters = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    totalFlags: 0,
    installDate: new Date().toISOString()
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'flagsReplaced') return;

  const { replaced } = message;
  const tabId = sender.tab.id;

  if (!perTabCounters[tabId]) {
    perTabCounters[tabId] = {
      total: 0,
      savedToStorage: 0
    };
  }

  perTabCounters[tabId].total += replaced;

  chrome.action.setBadgeText({
    text: replaced.toString(),
    tabId
  });
  chrome.action.setBadgeBackgroundColor({
    color: '#7fffd4',
    tabId
  });

  const delta =
    perTabCounters[tabId].total - perTabCounters[tabId].savedToStorage;
  if (delta > 0) {
    chrome.storage.local.get(['totalFlags'], ({ totalFlags = 0 }) => {
      chrome.storage.local.set({
        totalFlags: totalFlags + delta
      });
      perTabCounters[tabId].savedToStorage = perTabCounters[tabId].total;
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    delete perTabCounters[tabId];
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  delete perTabCounters[tabId];
});
