// Toggle button
const toggleButton = document.getElementById("toggleButton");

chrome.runtime.sendMessage({ cmd: "getOnOffState" }, (isExtensionOn) => {
  updateButton(isExtensionOn);
});

// Click listener
toggleButton.addEventListener("click", () => {
  const isCurrentlyOn = toggleButton.classList.contains("on");
  const newState = !isCurrentlyOn;

  // Send to the background
  chrome.runtime.sendMessage({ cmd: "setOnOffState", data: { value: newState } }, (response) => {
    if (response.success) {
      updateButton(newState);
    } else {
      console.error("Failed to update extension state.");
    }
  });
});

// Function to update the button style
function updateButton(isOn) {
  if (isOn) {
    toggleButton.textContent = "Turn Off";
    toggleButton.classList.add("on");
    toggleButton.classList.remove("off");
  } else {
    toggleButton.textContent = "Turn On";
    toggleButton.classList.add("off");
    toggleButton.classList.remove("on");
  }
}
