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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("scanEmails").addEventListener("click", async () => {
    try {
      const token = await requestAuthToken();
      const messages = await fetchEmails(token);

      if (messages.length === 0) {
        alert("No emails found.");
        return;
      }

      let emailList = "Recent Emails:\n";
      for (let msg of messages) {
        let subject = await getEmailTitle(token, msg.id);
        emailList += `- ${subject}\n`;
      }

      alert(emailList);
    } catch (error) {
      console.error("Error fetching emails:", error);
      alert("Failed to fetch emails. Please check permissions.");
    }
  });
});

// Request access token from background.js
function requestAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "authenticate" }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.token);
      }
    });
  });
}

// Fetch recent emails
async function fetchEmails(accessToken) {
  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
  });

  const data = await response.json();
  return data.messages ? data.messages.slice(0, 5) : [];
}

// Get email subject by message ID
async function getEmailTitle(accessToken, messageId) {
  const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
  });

  const emailData = await response.json();
  const headers = emailData.payload.headers;
  const subjectHeader = headers.find(header => header.name === "Subject");
  return subjectHeader ? subjectHeader.value : "No Subject";
}

