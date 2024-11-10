// background.js
// @ts-ignore
chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Reading List Extension Installed");
  });
// @ts-ignore
chrome.webNavigation.onCompleted.addListener((details) => {
  // Check if the page is fully loaded and matches the required URL pattern
  if (details.frameId === 0) { // frameId 0 means it's the main frame (not an iframe)
    console.log("Page loaded:", details.url);

    // Execute a script on the loaded page
    console.log("Executing script on page load");

    // @ts-ignore
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: runOnPageLoad
    });
  }
}, { url: [{ urlMatches: 'https://*/*' }] }); // M
  
  // Function to run on page load
  function runOnPageLoad() {
    // Add any code here that you want to run on the page load

  
    // Example action: Modify the DOM or log something
    document.body.style.backgroundColor = "lightblue"; // Changes the background color
  }
  