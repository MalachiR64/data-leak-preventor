document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the current setting from chrome storage to check if the warning feature is enabled
  chrome.storage.sync.get("enableWarning", (data) => {
    document.getElementById('toggleFeature').checked = data.enableWarning || false;
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
          function: scanEmailForSensitiveData
        });
      } else {
        alert("This extension only works on Gmail.");
      }
      
    });
  });
});

// Function to scan email content for sensitive data
function scanEmailForSensitiveData() {
  chrome.storage.sync.get("enableWarning", (data) => {
    // Check if the warning feature is enabled
    if (!data.enableWarning) {
      console.log("Sensitive data warnings are disabled.");
      return; // Exit function if warnings are disabled
    }

    // Retrieve the email content from the Gmail message body
    const emailBody = document.querySelector('div[aria-label="Message Body"]'); // Gmail's message body selector

    if (emailBody) {
      const emailText = emailBody.innerText || emailBody.textContent; // Get the raw email text

      // Regular expressions to detect sensitive data
      const creditCardRegex = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{16})\b/g;
      const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

      // Check if sensitive data like credit card numbers or SSNs are present
      const foundCreditCard = creditCardRegex.test(emailText);
      const foundSSN = ssnRegex.test(emailText);

      if (foundCreditCard || foundSSN) {
        // Highlight the sensitive data
        emailBody.innerHTML = emailBody.innerHTML.replace(creditCardRegex, (match) => {
          return `<span style="background-color: red; color: white; font-weight: bold;">${match}</span>`;
        });

        emailBody.innerHTML = emailBody.innerHTML.replace(ssnRegex, (match) => {
          return `<span style="background-color: red; color: white; font-weight: bold;">${match}</span>`;
        });
        
        alert("Sensitive data detected!");
      } else {
        alert("No sensitive data found.");
      }
    } else {
      alert("No email body found.");
    }
  }); 
}

// Listen for message from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanEmail") {
    // This function runs in the context of the popup, not the tab
    // We need to run the scan in the context of the tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ canSend: true });
        return;
      }
      
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          const emailBody = document.querySelector('div[aria-label="Message Body"]');
          if (emailBody) {
            const emailText = emailBody.innerText || emailBody.textContent;
            
            const creditCardRegex = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{16})\b/g;
            const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;

            const foundCreditCard = creditCardRegex.test(emailText);
            const foundSSN = ssnRegex.test(emailText);

            if (foundCreditCard || foundSSN) {
              const confirmSend = confirm("WARNING: This email contains sensitive information. Are you sure you want to send it?");
              return { canSend: confirmSend };
            }
            return { canSend: true };
          }
          return { canSend: true };
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          sendResponse(results[0].result);
        } else {
          sendResponse({ canSend: true });
        }
      });
    });
    return true; // Required for async response
  }
});