// Open (or create if it doesn't exist) the IndexedDB database
let db;
const request = indexedDB.open("AccessibilitySettingsDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("settings", { keyPath: "id" });
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadSettings();
};

request.onerror = (event) => {
  console.error("IndexedDB error:", event.target.error);
};

// Functions to toggle accessibility features and save settings
document.getElementById("colorBlindToggle").addEventListener("click", () => toggleFeature("colorBlind"));
document.getElementById("dyslexicFontToggle").addEventListener("click", () => toggleFeature("dyslexicFont"));
document.getElementById("highContrastToggle").addEventListener("click", () => toggleFeature("highContrast"));

function toggleFeature(feature) {
  // Toggle the body class and checkbox state
  const checkbox = document.getElementById(`${feature}Toggle`);
  document.body.classList.toggle(feature, checkbox.checked);

  // Save the state of the feature in IndexedDB
  saveSetting(feature, checkbox.checked);
}

function saveSetting(feature, value) {
  const transaction = db.transaction("settings", "readwrite");
  const store = transaction.objectStore("settings");
  store.put({ id: feature, enabled: value });
}

function loadSettings() {
  const transaction = db.transaction("settings", "readonly");
  const store = transaction.objectStore("settings");

  store.getAll().onsuccess = (event) => {
    const settings = event.target.result;
    settings.forEach((setting) => {
      const isEnabled = setting.enabled;
      const toggleId = `${setting.id}Toggle`;
      
      // Set the checkbox state based on the stored setting
      const checkbox = document.getElementById(toggleId);
      if (checkbox) {
        checkbox.checked = isEnabled;
      }

      // Update the body class based on the stored setting
      document.body.classList.toggle(setting.id, isEnabled);
    });
  };
}

function updateButtonState(feature, isEnabled) {
  const checkbox = document.getElementById(`${feature}Toggle`);
  if (checkbox) {
    checkbox.checked = isEnabled;
  }
}
