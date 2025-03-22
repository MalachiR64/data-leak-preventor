document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the current setting from chrome storage to check if the warning feature is enabled
  chrome.storage.sync.get("enableWarning", (data) => {
    document.getElementById('toggleFeature').checked = data.enableWarning || false;
  });
});

// Toggle the "Enable Sensitive Data Warnings" setting in chrome storage
document.getElementById('toggleFeature').addEventListener('change', (event) => {
  chrome.storage.sync.set({ enableWarning: event.target.checked });
  console.log("Feature toggled:", event.target.checked);
});

// Event listener for the "Scan for Sensitive Data" button
document.getElementById('scanEmails').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    
    // Check if the tab's URL belongs to Gmail
    if (tabs[0].url && tabs[0].url.includes("mail.google.com")){
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: scanEmailForSensitiveData
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => alert("This extension only works on Gmail.")
      });
    }
    
  });
});

// Function to scan the email content for sensitive data like credit card numbers and SSNs
function scanEmailForSensitiveData() {
  // Retrieve the email content from the Gmail message body
  const emailBody = document.querySelector('div[aria-label="Message Body"]'); // Gmail's message body selector

  if (emailBody) {
    const emailText = emailBody.innerText || emailBody.textContent; // Get the raw email text

    // Regular expressions to detect sensitive data
    const creditCardRegex = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{16})\b/g;
    const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

    // Check if sensitive data like credit card numbers or SSNs are present
    const foundCreditCard = creditCardRegex;
    const foundSSN = ssnRegex.test(emailText);

    if (foundCreditCard.test(emailText) || foundSSN.test(emailText)) {
      // Highlight the sensitive data
      emailBody.innerHTML = emailBody.innerHTML.replace(creditCardRegex, (match) => {
        found = true;
        return `<span style="background-color: red; color: white; font-weight: bold;">${match}</span>`;
      });

      emailBody.innerHTML = emailBody.innerHTML.replace(ssnRegex, (match) => {
        found = true;
        return `<span style="background-color: red; color: white; font-weight: bold;">${match}</span>`;
      });
    
      alert("Sensitive data detected!");
    } else {
      alert("No sensitive data found.");
    }
  } else {
    alert("No email body found.");
  }
}

