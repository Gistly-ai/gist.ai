const button = document.createElement('button');
button.innerText = "Open the gist";
button.id = 'hoverButton';
document.body.appendChild(button);

// Add CSS for the button to make it look good and hover properly
const style = document.createElement('style');
style.textContent = `
  #hoverButton {
    position: fixed;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #008CBA;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    z-index: 1000;
  }
  #hoverButton:hover {
    background-color: #005f73;
  }
`;
document.head.appendChild(style);

// Handle button click
button.addEventListener('click', () => {
    // Send a message to background script to open the side panel
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
    console.log("here");
    if (message.action === "openFloatingButton") {
      button.style.display = 'block';
    }

  });

