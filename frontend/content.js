// Create a floating button
const button = document.createElement('button');
button.innerText = "Open Panel";
button.id = 'hoverButton';
document.body.appendChild(button);

// Handle button click
button.addEventListener('click', () => {
  // Send message to background script to open the side panel
  chrome.runtime.sendMessage({ action: "openSidePanel" });
});
