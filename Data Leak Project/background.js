chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Example of listening for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("mail.google.com")) {
    console.log("Gmail page loaded");
  }
});
