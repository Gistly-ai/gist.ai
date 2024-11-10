document.addEventListener('DOMContentLoaded', () => {
    // Listen for the message from the background.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'HTML_FETCHED') {
            // Render the fetched HTML in a specific element
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = message.data;
        }
    });
});