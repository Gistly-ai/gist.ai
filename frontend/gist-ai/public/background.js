chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome Reading List Extension Installed");
});

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId === 0) {
      console.log("Page loaded:", details.url);
      console.log("Executing script on page load");

      // Inject content script to capture page content
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: capturePageContent,
      });
    }
  },
  { url: [{ urlMatches: "https://*/*" }] }
);

function capturePageContent() {
  // Get the HTML content of the page
  const content = document.documentElement.outerHTML;

  console.log("Content captured");
  // Send the content to the background script
  chrome.runtime.sendMessage({ content });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.content) {
    fetch("http://localhost:3000/fetch-content", {
      method: "POST",
      headers: {
        "Content-Type": "text/html",
      },
      body: message.content, 
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data);
        sendResponse({ status: "success", data });
      })
      .catch((error) => {
        console.error("Error sending content to server:", error);
        sendResponse({ status: "error", error });
      });

    return true;
  }
});
