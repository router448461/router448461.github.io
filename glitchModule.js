// glitchModule.js
export function startGlitch() {
  const glitchOverlay = document.getElementById('glitch-overlay');
  function triggerGlitch() {
    glitchOverlay.classList.add('glitch-active');
    glitchOverlay.addEventListener('animationend', () => {
      glitchOverlay.classList.remove('glitch-active');
    }, { once: true });
    const nextDelay = Math.random() * 5000 + 2000;
    setTimeout(triggerGlitch, nextDelay);
  }
  triggerGlitch();
}
