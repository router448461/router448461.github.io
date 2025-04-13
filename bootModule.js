// bootModule.js
export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  bootOverlay.innerHTML = "ESTABLISHING VIDEO UPLINK...";
  setTimeout(() => {
    bootOverlay.classList.add('boot-lens');
    setTimeout(() => {
      bootOverlay.classList.add('boot-hidden');
      setTimeout(() => {
        bootOverlay.remove();
      }, 1000);
    }, 1000);
  }, 4000);
}
