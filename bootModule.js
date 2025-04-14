// bootModule.js
export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  bootOverlay.innerHTML = "ESTABLISHING VIDEO UPLINK...";
  bootOverlay.classList.add('boot-start');
  bootOverlay.addEventListener('animationend', () => bootOverlay.remove());
}
