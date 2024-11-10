// document.addEventListener('DOMContentLoaded', () => {
//     // Listen for the message from the background.js
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//         if (message.type === 'HTML_FETCHED') {
//             // Render the fetched HTML in a specific element
//             const contentDiv = document.getElementById('content');
//             contentDiv.innerHTML = message.data;
//     } else if (message.type === 'MP3_FETCHED') {
//         // Set the source of the audio player to the received MP3 data
//         audioPlayer.src = 'data:audio/mp3;base64,' + message.data;
//         audioPlayer.style.display = 'block';
//       }
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const playIcon = document.getElementById('playIcon');
    let audioReady = false;
  
    // Handle play button click
    playButton.addEventListener('click', () => {
      if (!audioReady) {
        console.log('Audio not ready yet.');
        return;
      }
  
      if (audioPlayer.paused) {
        audioPlayer.play();
        updatePlayIcon('pause');
      } else {
        audioPlayer.pause();
        updatePlayIcon('play');
      }
    });
  
    // Function to update the play button icon
    function updatePlayIcon(state) {
      if (state === 'play') {
        playIcon.innerHTML = `
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        `;
      } else if (state === 'pause') {
        playIcon.innerHTML = `
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        `;
      }
    }
  
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'HTML_FETCHED') {
        // Update the content container with the received HTML
        contentDiv.innerHTML = message.data;
  
        // Hide the loading animation
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
          loadingContainer.style.display = 'none';
        }
      } else if (message.type === 'MP3_FETCHED') {
        // Set the source of the audio player to the received MP3 data
        audioPlayer.src = 'data:audio/mp3;base64,' + message.data;
        audioReady = true;
        console.log('Audio is ready to play.');
      }
    });
  
    // Update play icon when audio ends
    audioPlayer.addEventListener('ended', () => {
      updatePlayIcon('play');
    });
  });
  