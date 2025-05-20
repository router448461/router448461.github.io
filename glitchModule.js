// glitchModule.js
export function startGlitch() {
  const glitchOverlay = document.getElementById('glitch-overlay');
  if (!glitchOverlay) return;
  
  const triggerGlitch = () => {
    glitchOverlay.classList.add('glitch-active');
    setTimeout(() => {
      glitchOverlay.classList.remove('glitch-active');
    }, 300);
    // Next glitch between 2000ms and 7000ms
    const nextGlitch = Math.random() * 5000 + 2000;
    setTimeout(triggerGlitch, nextGlitch);
  };

  triggerGlitch();
}
