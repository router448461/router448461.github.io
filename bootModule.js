export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  const messages = [
    "ESTABLISHING VIDEO UPLINK...",
  ];
  bootOverlay.innerHTML = messages.join('<br>');
  setTimeout(() => {
    bootOverlay.classList.add('boot-hidden');
    setTimeout(() => {
      bootOverlay.remove();
    }, 1000);
  }, 4000);
}
