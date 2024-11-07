// Initialize the extension state when popup is opened
document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('toggleButton');

  // Function to update button text based on the current state
  function updateButtonText(isOn) {
      toggleButton.textContent = isOn ? "Turn Off" : "Turn On";
  }

  // Fetch the current state from the background script
  chrome.runtime.sendMessage({ cmd: "getOnOffState" }, function (isOn) {
      updateButtonText(isOn);
  });

  // Add click listener for the button
  toggleButton.addEventListener('click', function () {
      // Fetch the current state again to ensure consistency
      chrome.runtime.sendMessage({ cmd: "getOnOffState" }, function (isOn) {
          const newOnState = !isOn;

          // Update the state in the background script
          chrome.runtime.sendMessage({ cmd: "setOnOffState", data: { value: newOnState } }, function () {
              updateButtonText(newOnState);
          });
      });
  });
});
