// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get("enableWarning", (data) => {
    document.getElementById('enableWarning').checked = data.enableWarning || false;
  });
});

// Save settings when the checkbox is changed
document.getElementById('enableWarning').addEventListener('change', (event) => {
  chrome.storage.sync.set({ enableWarning: event.target.checked });
  console.log("Settings saved");
});