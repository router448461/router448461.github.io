// bootModule.js
export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  bootOverlay.innerHTML = "ESTABLISHING VIDEO UPLINK...";
  // When the boot screen completes, remove it immediately (without additional lens animation)
  setTimeout(() => {
    bootOverlay.classList.add('boot-hidden');
    setTimeout(() => {
      bootOverlay.remove();
    }, 1000);
  }, 4000);
}
