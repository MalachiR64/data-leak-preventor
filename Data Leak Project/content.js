// content.js - Listen for changes in the email body and flag sensitive data

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

// Function to detect credit card numbers with proper validation
function containsCreditCardNumber(text) {
  // Regular expression to detect possible credit card patterns (13-19 digits)
  const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
  
  // Extract potential matches
  let matches = text.match(ccRegex);
  
  if (!matches) return false; // No matches found

  // Validate using Luhn algorithm
  for (let match of matches) {
      let cleanedNumber = match.replace(/\D/g, ''); // Remove spaces/dashes

      if (isValidCreditCard(cleanedNumber)) {
          return true; // Found a valid credit card number
      }
  }

  return false; // No valid numbers found
}

// Function to check email content for sensitive data
function checkForSensitiveData() {
// Find the email content area (the message body in Gmail)
const emailContent = document.querySelector('div[aria-label="Message Body"]');

if (emailContent) {
  // Get the text content from the email body
  const text = emailContent.textContent || emailContent.innerText || "";
  console.log(text);
  
  // Use the improved credit card detection function
  const foundCreditCard = containsCreditCardNumber(text);
  
  // Regular expression for SSN (keeping the original)
  const ssnRegex = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
  const foundSSN = ssnRegex.test(text);

  if (foundCreditCard || foundSSN) {
    console.log("Sensitive data detected!");
    return true;
  } else {
    console.log("No sensitive data found. tester");
    return false;
  }
}
return false;
}

// Track if we're currently processing a send action
let isProcessingSend = false;
// Track if we've shown a warning and the user confirmed to send anyway
let userConfirmedSend = false;

// Add event listener for the send button - using capture phase to intercept early
document.addEventListener('click', function(e) {
// Find the send button that was clicked
const sendButton = e.target.closest('div[role="button"][aria-label*="Send"]');

if (!sendButton) {
  return; // Not a send button click
}

// If this is a simulated click after user confirmation or if no sensitive data found
if (userConfirmedSend) {
  // Reset the flag for future clicks
  userConfirmedSend = false;
  return; // Let this click go through normally
}

// If we're already processing a click, avoid recursion
if (isProcessingSend) {
  return;
}

// Prevent default to stop the immediate send
e.preventDefault();
e.stopPropagation();

// Set flag to avoid re-entry
isProcessingSend = true;

// Check for sensitive data
const hasSensitiveData = checkForSensitiveData();

if (hasSensitiveData) {
  // Show confirmation dialog
  const confirmSend = confirm("WARNING: This email contains sensitive information (credit card numbers or SSNs). Are you sure you want to send it?");
  
  if (confirmSend) {
    // User confirmed, allow the next click to go through
    userConfirmedSend = true;
    
    // Reset processing flag
    isProcessingSend = false;
    userConfirmedSend = true; 
    // Simulate a click on the send button to send the email
    sendButton.click();
  } else {
    // User canceled, just reset the flag
    isProcessingSend = false;
  }
} else {
  // No sensitive data, immediately proceed with sending
  isProcessingSend = false;
  userConfirmedSend = true; // Set to true to bypass our listener on the next click
  sendButton.click(); // This will trigger a new click event, but userConfirmedSend will be true
}
}, true); // The true parameter means use capture phase

// Listen for input events on the email body
function setupInputListeners() {
const emailBody = document.querySelector('div[aria-label="Message Body"]');
if (emailBody) {
  const emailText = emailBody.innerText || emailBody.textContent;
  console.log("Email text checking:", emailText); // Log the email text for debugging
  
  emailBody.addEventListener('input', () => {
    checkForSensitiveData();  // Check for sensitive data as user types
  });
  console.log("Email content listener set up");
} else {
  // If element not found, try again after a short delay
  setTimeout(setupInputListeners, 1000);
}
}

// Initialize the input listeners when the page loads
// Use MutationObserver to detect when the compose window appears
function initializeExtension() {
console.log("Initializing email security extension");

// Set up a mutation observer to detect when Gmail's UI changes
const observer = new MutationObserver((mutations) => {
  // Look for the compose window
  const composeWindow = document.querySelector('[aria-label="Message Body"]');
  if (composeWindow) {
    setupInputListeners();
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Initial check in case the compose window is already open
setupInputListeners();
}

// Initialize the extension
initializeExtension();