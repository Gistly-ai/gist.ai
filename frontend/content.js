const button = document.createElement('button');
button.id = 'hoverButton';

// Create an icon element (using the icon16.png as an example)
const icon = document.createElement('img');
icon.src = chrome.runtime.getURL("icons/icon16.png");
icon.alt = "Open Gist";
icon.id = 'buttonIcon';

// Error handling for icon load failure
icon.onerror = () => {
  console.error("Failed to load icon image. Please check the icon path in manifest and the icons folder.");
};

// Append the icon to the button
button.appendChild(icon);
document.body.appendChild(button);

// Add CSS for the button to make it look good and hover properly
const style = document.createElement('style');
style.textContent = `
  #hoverButton {
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background-color: transparent;
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 1000;
  }
  #hoverButton:hover {
    background-color: #005f73;
    border-radius: 50%;
  }
  #buttonIcon {
    width: 32px;
    height: 32px;
  }
`;
document.head.appendChild(style);

// Handle button click
button.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "openSidePanel" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message to background script: ", chrome.runtime.lastError);
    } else if (response && response.status === "success") {
      button.style.display = 'none';
      console.log("Side panel should be opened now");
    } else {
      console.error("Unexpected response from background script");
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openFloatingButton") {
    button.style.display ='block';
  }
});
