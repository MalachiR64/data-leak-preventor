// Load saved setting for the checkbox
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get("enableWarning", (data) => {
    document.getElementById('toggleFeature').checked = data.enableWarning || false;
  });
});

// Save setting when checkbox is toggled
document.getElementById('toggleFeature').addEventListener('change', (event) => {
  chrome.storage.sync.set({ enableWarning: event.target.checked });
  console.log("Feature toggled:", event.target.checked);
});

// Handle button click (example of sending a message to content.js)
document.getElementById('scanEmails').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return; // No active tab found
    
    const tab = tabs[0];
    
    // Check if the tab's URL belongs to Gmail
    if (tab.url && tab.url.includes("mail.google.com")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => alert("Scanning emails for sensitive data...")
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => alert("This extension only works on Gmail.")
      });
    }
  });
});
