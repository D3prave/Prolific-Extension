var isExtensionOn = true;

// Function to check URL
function shouldRefresh(url) {
  return url === "https://app.prolific.com/studies";
}

// Function to set up auto-refresh
function startAutoRefresh(tabId) {

  const refreshInterval = Math.floor(Math.random() * (150000 - 67500 + 1)) + 67500;
  const intervalInMinutes = refreshInterval / 60000;

  // Clear existing alarm 
  chrome.alarms.clear(`refresh-${tabId}`, () => {
    // Create a new alarm
    chrome.alarms.create(`refresh-${tabId}`, { delayInMinutes: intervalInMinutes });
  });
}

// Restart auto-refresh when extension is toggled on
function refreshAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (shouldRefresh(tab.url) && isExtensionOn) {
        startAutoRefresh(tab.id);
      }
    }
  });
}

// Toggle the extension state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === "setOnOffState") {
    isExtensionOn = request.data.value;

    // Clear all alarms (OFF)
    if (!isExtensionOn) {
      chrome.alarms.clearAll();
    } else {
      // ON
      refreshAllTabs();
    }

    sendResponse({ success: true });
  }

  if (request.cmd === "getOnOffState") {
    sendResponse(isExtensionOn);
  }
});

// Reload
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("refresh-")) {
    const tabId = parseInt(alarm.name.split("-")[1]);
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => location.reload()
    });
    startAutoRefresh(tabId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && shouldRefresh(tab.url) && isExtensionOn) {
    startAutoRefresh(tabId);
  }
});
