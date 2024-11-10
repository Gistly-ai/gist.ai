chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome Reading List Extension Installed");
});

// Listen for messages from the content script
let windowId;

chrome.tabs.onActivated.addListener(function (activeInfo) {
  windowId = activeInfo.windowId;
});

// to receive messages from popup script
chrome.runtime.onMessage.addListener((message, sender) => {
  (async () => {
    if (message.action === 'open_side_panel') {
      chrome.sidePanel.open({ windowId: windowId });
    }
  })();
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

function removeHTMLTagsCSSAndJS(html) {
  // Remove <style> and <script> blocks along with their content
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove any inline JavaScript event handlers (e.g., onclick="...")
  html = html.replace(/\s*on\w+="[^"]*"/gi, '');

  // Remove all HTML tags
  html = html.replace(/<[^>]+>/g, '');

  // Trim and return only the text content
  return html.trim();
}

function capturePageContent() {
  // Get the HTML content of the page
  const content = document.documentElement.outerHTML;

  console.log("Content captured");
  // Send the content to the background script
  chrome.runtime.sendMessage({ content });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.content) {
    fetch("http://localhost:3000/process-html", {
      method: "POST",
      headers: {
        "Content-Type": "text/html",
      },
      body: removeHTMLTagsCSSAndJS(message.content),
    })
      .then((response) => response.text())
      .then((response) => {
        console.log("response parsed", response);
        chrome.runtime.sendMessage({ type: 'HTML_FETCHED', data: response });
      })
      .catch((error) => {
        console.error("Error sending content to server:", error);
        sendResponse({ status: "error", error });
      });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSidePanel") {
    console.log('Opening side panel...');
    chrome.sidePanel.open({ windowId: sender.tab?.windowId });
    // Open the side panel asynchronously
    chrome.sidePanel.setOptions({
      path: "sidepanel/index.html", // Make sure you have a sidepanel.html file ready
      enabled: true,
    })
    .then(() => {
      console.log('Side panel opened successfully.');
      sendResponse({ status: "success" });
    })
    .catch((error) => {
      console.error("Failed to open side panel: ", error);
      sendResponse({ status: "error", error: error.message });
    });

    // Return true to indicate response will be sent asynchronously
    return true;
  }
});

chrome.runtime.sendMessage({ action: "openFloatingButton" });