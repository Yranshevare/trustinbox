chrome.runtime.onInstalled.addListener(() => {
  console.log("TrustInBox Phishing Detector installed");
  chrome.storage.local.set({ isAuthenticated: false, user: null });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AUTH_STATUS") {
    chrome.storage.local.get(["isAuthenticated", "user"], (result) => {
      sendResponse({
        isAuthenticated: result.isAuthenticated || false,
        user: result.user || null,
      });
    });
    return true;
  }

  if (message.type === "SET_AUTH") {
    chrome.storage.local.set(
      {
        isAuthenticated: true,
        user: message.user,
        token: message.token,
      },
      () => {
        sendResponse({ success: true });
      },
    );
    return true;
  }

  if (message.type === "LOGOUT") {
    chrome.storage.local.set(
      { isAuthenticated: false, user: null, token: null },
      () => {
        sendResponse({ success: true });
      },
    );
    return true;
  }

  if (message.type === "ANALYZE_EMAIL") {
    analyzeEmail(message.emailData)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error: Error) =>
        sendResponse({ success: false, error: error.message }),
      );
    return true;
  }
});

// @ts-nocheck
async function analyzeEmail(emailData: any) {
  const API_BASE = "http://localhost:3000/api";

  const response = await fetch(`${API_BASE}/analyse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: emailData.subject,
      sender: emailData.sender,
      body: emailData.body,
      bodyHtml: emailData.bodyHtml,
    }),
  });

  if (!response.ok) {
    throw new Error("Analysis request failed");
  }

  return response.json();
}
