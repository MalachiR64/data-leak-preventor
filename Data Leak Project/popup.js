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

// Luhn Algorithm to validate credit card number
function isValidCreditCard(number) {
    let sum = 0;
    let alternate = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);

        if (alternate) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        alternate = !alternate;
    }

    return sum % 10 === 0; // Valid if sum is a multiple of 10
}

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
      console.log("Email text checking:", emailText); // Log the email text for debugging
      
      // Improved credit card detection with Luhn algorithm
      const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
      let foundCreditCards = [];
      
      let match;
      while ((match = ccRegex.exec(emailText)) !== null) {
        const cardNumber = match[0];
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        if (isValidCreditCard(cleanNumber)) {
          foundCreditCards.push(cardNumber);
        }
      }
      
      // Regular expression for SSN (keeping the original)
      const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
      const foundSSNs = emailText.match(ssnRegex) || [];

      if (foundCreditCards.length > 0 || foundSSNs.length > 0) {
        let message = "Found sensitive information:\n";
        if (foundCreditCards.length > 0) {
          message += `Credit Card Numbers: ${foundCreditCards.join(", ")}\n`;
        }
        if (foundSSNs.length > 0) {
          message += `Social Security Numbers: ${foundSSNs.join(", ")}`;
        }
        alert(message);
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
          // Define the Luhn algorithm function in this context
          function isValidCreditCard(number) {
            let sum = 0;
            let alternate = false;
            
            for (let i = number.length - 1; i >= 0; i--) {
              let digit = parseInt(number[i]);

              if (alternate) {
                digit *= 2;
                if (digit > 9) digit -= 9;
              }

              sum += digit;
              alternate = !alternate;
            }

            return sum % 10 === 0; // Valid if sum is a multiple of 10
          }

          // Get the email body
          const emailBody = document.querySelector('div[aria-label="Message Body"]');
          if (emailBody) {
            const emailText = emailBody.innerText || emailBody.textContent;
            
            // Check for credit card numbers with Luhn validation
            const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
            let foundCreditCard = false;
            
            let match;
            while ((match = ccRegex.exec(emailText)) !== null) {
              const cleanNumber = match[0].replace(/\D/g, '');
              if (isValidCreditCard(cleanNumber)) {
                foundCreditCard = true;
                break;
              }
            }
            
            // Check for SSNs
            const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
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