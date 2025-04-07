export function bootSequence() {
  const bootOverlay = document.getElementById('boot-overlay');
  const messages = [
    "ESTABLISHING VIDEO UPLINK...",
  ];
  bootOverlay.innerHTML = messages.join('<br>');
  function flicker() {
    bootOverlay.style.opacity = Math.random() * 0.2 + 0.8;
    setTimeout(flicker, Math.random() * 200 + 50);
  }
  flicker();
  setTimeout(() => {
    bootOverlay.classList.add('boot-hidden');
    document.getElementById('map').classList.add('reveal');
    setTimeout(() => {
      bootOverlay.remove();
    }, 1000);
  }, 4000);
}
