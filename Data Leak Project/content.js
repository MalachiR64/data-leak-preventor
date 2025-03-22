// content.js - Listen for changes in the email body and flag sensitive data

// Function to check email content for sensitive data (e.g., credit card numbers)
function checkForSensitiveData() {
  // Find the email content area (the message body in Gmail)
  const emailContent = document.querySelector('[aria-label="Message Body"]');

  if (emailContent) {
    // Get the text content from the email body
    const text = emailContent.value || emailContent.textContent;

    console.log("Text to scan:", text);  // Log the text content for debugging

      alert("Sensitive data detected!1");  // Alert if sensitive data is found
    } else {
      console.log("No sensitive data found.");  // Log when no sensitive data is found
    }
  }




// Listen for input events on the email body (as the user types)
const emailContent = document.querySelector('textarea[name="body"]') || document.querySelector('[aria-label="Message Body"]');
if (emailContent) {
  emailContent.addEventListener('input', () => {
    checkForSensitiveData();  // Check for sensitive data whenever the user types
  });
}
