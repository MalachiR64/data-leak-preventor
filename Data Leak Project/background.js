const CLIENT_ID = "794046597479-0jrggfu6luvkgd3os6jqmt26mg7k3knv.apps.googleusercontent.com";
const API_KEY = "AIzaSyAlGwaEpG29tikQ6Drg7ymW7k3AXyiNBgo";
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";


chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Example of listening for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("mail.google.com")) {
    console.log("Gmail page loaded");
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "authenticate") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ error: chrome.runtime.lastError || "Authentication failed" });
      } else {
        sendResponse({ token });
      }
    });
    return true; // Keeps the message channel open for async response
  }
});

function authenticate() {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org&scope=${SCOPES}`,
        interactive: true
      },
      (redirectUri) => {
        if (chrome.runtime.lastError || redirectUri.includes('error=')) {
          reject(chrome.runtime.lastError);
        } else {
          const accessToken = new URL(redirectUri).hash.split('&')[0].split('=')[1];
          resolve(accessToken);
        }
      }
    );
  });
}

async function fetchEmails(accessToken) {
  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  if (data.messages) {
    console.log("Email Messages List:", data.messages);
    return data.messages.slice(0, 10); // Fetch first 10 emails
  } else {
    console.error("No messages found.");
    return [];
  }
}

async function getEmailTitles(accessToken, messageId) {
  const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const emailData = await response.json();
  const headers = emailData.payload.headers;
  const subjectHeader = headers.find(header => header.name === "Subject");
  const subject = subjectHeader ? subjectHeader.value : "No Subject";

  return subject;
}

// Main function to authenticate and fetch Gmail subjects
authenticate()
  .then(async (accessToken) => {
    const messages = await fetchEmails(accessToken);
    const subjects = await Promise.all(messages.map(msg => getEmailTitles(accessToken, msg.id)));

    console.log("Email Subjects:");
    subjects.forEach((subject, index) => console.log(`${index + 1}. ${subject}`));
  })
  .catch(error => console.error("Error:", error));