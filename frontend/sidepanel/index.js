document.addEventListener('DOMContentLoaded', () => {
    // Listen for the message from the background.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'HTML_FETCHED') {
            // Render the fetched HTML in a specific element
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = message.data;
        }
    });
    const playButton = document.querySelector(".profile-btn");
    if (playButton) {
      playButton.addEventListener("click", () => {
        // Send a message to the background script to open the popup
        chrome.action.openPopup();
      });
    } else {
      console.error("profile-btn element not found");
    }



    
});

document.addEventListener("beforeunload", (event) => {

  chrome.runtime.sendMessage({ action: "openFloatingButton" });
});




