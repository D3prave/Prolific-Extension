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

  refreshIntervalId = setInterval(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => location.reload()
    });
  }, refreshInterval);
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
    if (!isExtensionOn && refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
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

// Listen for updates to each tab to restart auto-refresh if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && shouldRefresh(tab.url) && isExtensionOn) {
    startAutoRefresh(tabId);
  }
});
