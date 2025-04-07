export function startGlitch() {
  const glitchOverlay = document.getElementById('glitch-overlay');
  function triggerGlitch() {
    glitchOverlay.classList.add('glitch-active');
    setTimeout(() => {
      glitchOverlay.classList.remove('glitch-active');
    }, 300);
    const nextGlitch = Math.random() * 5000 + 2000;
    setTimeout(triggerGlitch, nextGlitch);
  }
  triggerGlitch();
}
