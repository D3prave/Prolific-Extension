var isExtensionOn = true;
var refreshIntervalId = null;

const refreshInterval = 7500;

// Function to check if URL matches the target page
function shouldRefresh(url) {
  return url === "https://app.prolific.com/studies";
}

// Function to set up auto-refresh
function startAutoRefresh(tabId) {
  if (refreshIntervalId) clearInterval(refreshIntervalId); // Clear any existing interval

  // Check if the tab's URL still matches the target URL before setting up the interval
  chrome.tabs.get(tabId, (tab) => {
    if (shouldRefresh(tab.url)) {
      refreshIntervalId = setInterval(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => location.reload()
        });
      }, refreshInterval);
    }
  });
}

// Function to stop auto-refresh
function stopAutoRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

// Restart auto-refresh on all relevant tabs when extension is toggled on
function refreshAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (shouldRefresh(tab.url) && isExtensionOn) {
        startAutoRefresh(tab.id);
      }
    }
  });
}

// Listen for messages to toggle the extension state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === "setOnOffState") {
    isExtensionOn = request.data.value;

    // Clear refresh if turning off
    if (!isExtensionOn) {
      stopAutoRefresh();
    }

    // If turning on, re-enable auto-refresh on any relevant tabs
    if (isExtensionOn) {
      refreshAllTabs();
    }

    sendResponse({ success: true });
  }

  if (request.cmd === "getOnOffState") {
    sendResponse(isExtensionOn);
  }
});

// Listen for updates to each tab to restart or stop auto-refresh if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (shouldRefresh(tab.url) && isExtensionOn) {
      startAutoRefresh(tabId);
    } else {
      stopAutoRefresh(); // Stop refreshing if URL doesn't match
    }
  }
});
