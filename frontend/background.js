// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
//   .catch((error) => console.error(error));
let colorB = false;
let highC = false;
let dys = false;

// Open (or create if it doesn't exist) the IndexedDB database
const request = indexedDB.open("AccessibilitySettingsDB", 1);

// Set up the database structure if needed
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore("settings", { keyPath: "id" });
};

// Load settings from IndexedDB into variables
request.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction("settings", "readonly");
  const store = transaction.objectStore("settings");

  store.getAll().onsuccess = (event) => {
    const settings = event.target.result;
    
    settings.forEach((setting) => {
      if (setting.id === "colorBlind") colorB = setting.enabled;
      if (setting.id === "highContrast") highC = setting.enabled;
      if (setting.id === "dyslexicFont") dys = setting.enabled;
    });

    // Log the loaded variables for verification
    console.log("Settings loaded:");
    console.log("colorB:", colorB);
    console.log("highC:", highC);
    console.log("dys:", dys);
  };
};

function loadSettingsFromDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AccessibilitySettingsDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("settings", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("settings", "readonly");
      const store = transaction.objectStore("settings");

      const settings = { colorB, highC, dys };

      store.getAll().onsuccess = (event) => {
        const result = event.target.result;

        result.forEach((setting) => {
          if (setting.id === "colorBlind") settings.colorB = setting.enabled;
          if (setting.id === "highContrast") settings.highC = setting.enabled;
          if (setting.id === "dyslexicFont") settings.dys = setting.enabled;
        });

        // Update global variables with the latest settings
        colorB = settings.colorB;
        highC = settings.highC;
        dys = settings.dys;

        resolve(settings);
      };

      store.getAll().onerror = (event) => {
        reject(event.target.error);
      };
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

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
  
  function removeHTMLTagsCSSAndJS(html) {
    // Remove <style> and <script> blocks along with their content
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
    // Remove any inline JavaScript event handlers (e.g., onclick="...")
    html = html.replace(/\s*on\w+="[^"]*"/gi, '');
  
    // Remove all HTML tags
    html = html.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, " ") // Replace 2+ spaces with single space
    .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with double newline
    .trim(); // Remove leading/trailing whitespace
  
    // Trim and return only the text content
    return {
      websiteContent:html.trim(),
      colorB,
  highC,
  dys
}
  }
  // Example usage
  
  
  function capturePageContent() {
    // Get the HTML content of the page
    const content = document.documentElement.outerHTML;
  
    console.log("Content captured");
    // Send the content to the background script
    chrome.runtime.sendMessage({ content });
  }
  

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



function capturePageContent() {
  // Get the HTML content of the page
  const content = document.documentElement.outerHTML;

  console.log("Content captured");
  // Send the content to the background script
  chrome.runtime.sendMessage({ content });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.content) {
    loadSettingsFromDB().then(() => {
      fetch("http://localhost:3000/process-html", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(removeHTMLTagsCSSAndJS(message.content)),
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
    })
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

