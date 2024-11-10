import React from 'react';

function Popup() {
  return (
    <div>
      <h1>Gemini-like Popup</h1>
      <button onClick={() => chrome.sidePanel.open()}>Open Side Panel</button>
    </div>
  );
}

export default Popup;
