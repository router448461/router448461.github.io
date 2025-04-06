export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  const messages = [
    "SYSTEM INITIALIZING...",
    "LOADING SENSOR DATA...",
    "CALIBRATING TARGETING SYSTEM...",
    "SYSTEM READY."
  ];
  bootOverlay.innerHTML = messages.join('<br>');
  setTimeout(() => {
    bootOverlay.classList.add('boot-hidden');
    // Trigger shutter door animation
    const shutterContainer = document.getElementById('shutter-container');
    shutterContainer.classList.add('open');
    // Remove shutter container after animation completes
    setTimeout(() => {
      shutterContainer.remove();
    }, 1200);
  }, 4000);
}
