chrome.runtime.onInstalled.addListener(() => {
  console.log('Gemini-like side panel extension installed.');
});

chrome.sidePanel.setOptions({
  default_path: 'sidepanel.html'
});
