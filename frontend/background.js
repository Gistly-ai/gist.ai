chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome Reading List Extension Installed");
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    // Replace the URL with your desired API endpoint
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => {
        console.log("API Data: ", data);
        sendResponse({ data: data });
      })
      .catch(error => {
        console.error("Error fetching data: ", error);
        sendResponse({ error: "Failed to fetch data" });
      });

    // Required to return true when sending a response asynchronously
    return true;
  }

  if (message.action === "openSidePanel") {
    // Open the side panel when the button is clicked
    chrome.sidePanel.setOptions({
      path: "sidepanel.html", // Make sure you have a sidepanel.html file ready
      enabled: true,
    }).catch((error) => console.error("Failed to open side panel: ", error));
  }
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
